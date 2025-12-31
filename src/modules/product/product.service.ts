import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductAttachmentDto, UpdateProductDto } from './dto/update-product.dto';
import { BrandRepository, ProductDocument, lean, ProductRepository, userDocument, UserRepository } from 'src/DB';
import { CategoryRepository } from 'src/DB/repository/category.repository';
import {  FolderEnum, GetAllDTO, S3Service } from 'src/common';
import { randomUUID } from 'crypto';
import { Types } from 'mongoose';

@Injectable()
export class ProductService {
  constructor(
    private readonly productRepository:ProductRepository,
    private readonly categoryRepository:CategoryRepository,
    private readonly brandRepository:BrandRepository,
    private readonly userRepository:UserRepository,
    private readonly s3Service:S3Service
  ) {}
  async create(
     createProductDto: CreateProductDto,
     files: Express.Multer.File[],
     user:userDocument
  ) {
   const {name , description ,discountPercent , originalPrice , stock} = createProductDto
    const category = await this.categoryRepository.findById({id:createProductDto.category})
     
    if (!category) {
             throw new BadRequestException('Fail to find matching Category instance ')
           } 
   
    const brand = await this.brandRepository.findById({id:createProductDto.brand})
     
    if (!brand) {
             throw new BadRequestException('Fail to find matching brand instance ')
           } 
   
           const brandInCategory = await this.categoryRepository.findOne({
            filter: {
              _id: createProductDto.category,
              brands:new Types.ObjectId(createProductDto.brand),
            },
           });
   
           if (!brandInCategory) {
            throw new BadRequestException('Fail to find matching brandInCategory instance ')
    } 
    
    const assetFolderId = randomUUID()

    const images = await this.s3Service.uploadFiles({
      files,
      path:`${FolderEnum.Category}/${createProductDto.category}/${FolderEnum.Product}?${assetFolderId}`
    })
  

    const [product] = await this.productRepository.create({
      Data: [{
        category: category._id,
        brand:brand._id,  
        name,
        description,
        originalPrice,
        discountPercent,
        salePice: originalPrice - (originalPrice*discountPercent/100),
        stock,
        assetFolderId,
        images,
        createdBy:user._id
      }]
    })

    if (!product) {
      
      await this.s3Service.deleteFiles({
        urls:images
      })
      
      throw new BadRequestException('Fail to create product pleas try again later')
    }

    return product
  }

  async update(productId:Types.ObjectId,updateProductDto: UpdateProductDto , user:userDocument) {
   
    
    const product = await this.productRepository.findOne({ filter: { _id: productId } })   
 
    if (!product) {
     throw new BadRequestException('Fail to find matching Category instance ')
      
    }
    
    
    if (updateProductDto.category) {
    
      const category = await this.categoryRepository.findById({ id: updateProductDto.category })
      
      if (!category) {
        throw new BadRequestException('Fail to find matching Category instance ')
      }
    }
    
    if(updateProductDto.brand){
 
    const brand = await this.brandRepository.findById({ id: updateProductDto.brand })
      
     if (!brand) {
              throw new BadRequestException('Fail to find matching brand instance ')
            } 
    }
       
    const brandInCategory = await this.categoryRepository.findOne({
             filter: {
               _id: updateProductDto.category,
               brands:new Types.ObjectId(updateProductDto.brand),
             },
            });
    
            if (!brandInCategory) {
             throw new BadRequestException('Fail to find matching brandInCategory instance ')
     } 
     
     
    let salePice = product.salePice
 
    if (updateProductDto.originalPrice || updateProductDto.discountPercent) {
   
      const originalPrice = updateProductDto.originalPrice ?? product.originalPrice
      const discountPercent =updateProductDto.discountPercent??product.discountPercent
      const finalPice = originalPrice - (originalPrice * discountPercent / 100)
      salePice = finalPice > 0 ? finalPice:1 
    }
     
 
     const updateProduct= await this.productRepository.findOneAndUpdate({
       filter: { _id: productId },
       update: {
         ...updateProductDto,
         salePice,
         createdBy:user._id
       }
     })
 
     if (!updateProduct) {
        
       throw new BadRequestException('Fail to create product pleas try again later')
     }
 
     return updateProduct
   }
  
 async updateAttachment(productId:Types.ObjectId,files:Express.Multer.File[] , updateProductAttachmentDto: UpdateProductAttachmentDto , user:userDocument) {
   
    
   const product = await this.productRepository.findOne({ filter: { _id: productId } , options:{populate:[{path:'category'}]}})   
  console.log(product?.category);
  
   if (!product) {
    throw new BadRequestException('Fail to find matching product instance ')
     
   }
  let attachments:string[] = []
   if (files.length) {
     attachments = await this.s3Service.uploadFiles({
       path: `${FolderEnum.Category}/${(product.category as unknown as ProductDocument).assetFolderId}/${FolderEnum.Product}/${product.assetFolderId}`,
       files
    })
     
  }

   const removedAttachments = [... new Set(updateProductAttachmentDto.removedAttachments ?? [])]
     
    const updateProduct= await this.productRepository.findOneAndUpdate({
      filter: { _id: productId },
      update:[ {
        $set: {
          images: {
            $setUnion: [{
              $setDifference: [
                '$images',
                removedAttachments

              ]
            },
            attachments
            ]
          },
       
       
          createdBy: user._id
        }
      }]
    })

    if (!updateProduct) {
      await this.s3Service.deleteFiles({
       urls:attachments   
      })
      throw new BadRequestException('Fail to create product pleas try again later')
   }
   
   await this.s3Service.deleteFiles({
       urls:removedAttachments
     })

    return updateProduct
  }

  
    
    
     async softDelete(
       productId: Types.ObjectId,
       user : userDocument
   
     ):Promise<ProductDocument | lean<ProductDocument>> {
     
      
      const result = await this.productRepository.findOneAndUpdate({
        filter: { _id: productId , freezedAt:{$exists:false} },
        update: {
          $set: {
               freezedAt: new Date(),
               freezedBy: user._id
          },
        $unset:{restoredAt:1,restoredBy:1}
        }
      })
       
      if (!result) {
        throw new BadRequestException('Fail to find matching Category instance ')
      }
      
    
         return result;
   
     }
    
     async restore(
       productId: Types.ObjectId,
       user : userDocument
   
     ):Promise<ProductDocument | lean<ProductDocument>> {
     
      
      const result = await this.productRepository.findOneAndUpdate({
        filter: { _id: productId ,paranoId:false , freezedAt:{$exists:true} },
        update: {
          $set: {
               restoredAt: new Date(),
               restoredBy: user._id
          },
        $unset:{freezedAt:1,freezedBy:1}
        }
      })
       
      if (!result) {
        throw new BadRequestException('Fail to find matching Category instance ')
      }
      
    
         return result;
   
     }
    
     
     async delete(
       productId: Types.ObjectId,
     
     ):Promise<ProductDocument | lean<ProductDocument>> {
     
      
      const product = await this.productRepository.findOneAndDelete({
        filter: { _id: productId ,paranoId:false ,freezedAt:{$exists:true} },
       
      })
       
      if (!product) {
        throw new BadRequestException('Fail to find matching product instance ')
       }
       
       await this.s3Service.deleteFiles({
         urls:product.images
       })
      
    
         return product;
   
     }
    
    
    
    
     async findAll(data:GetAllDTO):Promise<{docsCount?:number,
     limit?: number,
     pages?:number,
     currentPage?: number|undefined,
     result: ProductDocument[] | lean <ProductDocument>[] }>
     {
       
       const {page , size , search} = data
       
       const products = await this.productRepository.paginate({
         filter: {
           ...(
             search ? {
               $or: [
                {page:{$regex:search , $options:'i'}},
                {slug:{$regex:search , $options:'i'}},
                {slogan:{$regex:search , $options:'i'}}
               ]
             }:{}
           )
         },
         page,
         size
       })
      
       return products;
     }
     async findAllArchive(data:GetAllDTO , archive:Boolean=false):Promise<{docsCount?:number,
     limit?: number,
     pages?:number,
     currentPage?: number|undefined,
     result: ProductDocument[] | lean <ProductDocument>[] }>
     {
       
       const {page , size , search} = data
       
       const products = await this.productRepository.paginate({
         filter: {
           ...(
             search ? {
               $or: [
                {page:{$regex:search , $options:'i'}},
                {slug:{$regex:search , $options:'i'}},
                {slogan:{$regex:search , $options:'i'}}
               ]
             } : {}),
             ...(archive?{paranoId:false , freezedAt:{$exists:true}}:{})
           
         },
         page,
         size
       })
      
       return products;
     }
     async findOne(
       productId: Types.ObjectId,
       archive: Boolean = false
     ): Promise<ProductDocument | lean<ProductDocument>>
     {
   
       const Product = await this.productRepository.findOne({
         filter: {
            _id:productId ,
             ...(archive?{paranoId:false , freezedAt:{$exists:true}}:{})
            }
       })
      
       if (!Product) {
         throw new BadRequestException('Fail to find matching Product instance ')
       }
       return Product;
     }
   
     
   
   


     async addToWishList(
      productId: Types.ObjectId,
      user:userDocument
    ): Promise<ProductDocument | lean<ProductDocument>>
    {
  
      const product = await this.productRepository.findOne({
        filter: {
           _id:productId 
           }
      })
     
      if (!product) {
        throw new BadRequestException('Fail to find matching product instance ')
       }
       
       await this.userRepository.updateOne({
         filter: { _id: user._id },
         update: {
           $addToSet:{wishList:product._id}
         }
       })
      return product;
    }
     async removeFromWishList(
      productId: Types.ObjectId,
      user:userDocument
    ): Promise<string>{
  
       
       await this.userRepository.updateOne({
         filter: { _id: user._id },
         update: {
           $pull:{wishList:Types.ObjectId.createFromHexString(productId as unknown as string)}
         }
       })
      return 'Done';
    }
 


}
   
 

