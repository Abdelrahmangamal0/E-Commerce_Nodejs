import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoryRepository } from 'src/DB/repository/category.repository';
import { FolderEnum, GetAllDTO, S3Service } from 'src/common';
import { BrandRepository, CategoryDocument, lean, userDocument } from 'src/DB';
import { Types } from 'mongoose';
import { randomUUID } from 'crypto';

@Injectable()
export class CategoryService {
  constructor(
      private readonly categoryRepository:CategoryRepository ,
      private readonly brandRepository:BrandRepository ,
      private readonly s3Service:S3Service
    ){}
   async create(
      createCategoryDto: CreateCategoryDto,
      file: Express.Multer.File,
      user : userDocument
  
    ):Promise<CategoryDocument> {
    
      let { name  } = createCategoryDto
      
     
    
      const checkNameExist = await this.categoryRepository.findOne({filter:{name:name}})
           
     if (checkNameExist) {
        throw new ConflictException('Category Name is Exist ')
      }
      
      const brands = [... new Set(createCategoryDto.brands)].map(brand => {
        return Types.ObjectId.createFromHexString(brand as unknown as string)  
      })
     
     if (brands && (await this.brandRepository.find({ filter: { _id: { $in: brands } } })).length != brands.length) {
       throw new NotFoundException('some of mentioned brands are not exist ')
     }
    
     createCategoryDto.brands = brands
     
     const assetFolderId = randomUUID()
     const image: string = await this.s3Service.uploadFile({
       file,
       path:`${FolderEnum.Category}/${assetFolderId}`
     })
     
     const [Category] = await this.categoryRepository.create({
       Data: [{
         ...createCategoryDto,
         image,
         assetFolderId,
         createdBy:user?._id
       }]
     })
  
     if (!Category) {
       await this.s3Service.deleteFile({
         Key:image
       })
  
       throw new BadRequestException('fail to crate this Category resource') 
     }
  
     return Category
    }
  
   
   async update(
      CategoryId: Types.ObjectId,
      updateCategoryDto: UpdateCategoryDto,
      user : userDocument
  
    ):Promise<CategoryDocument | lean<CategoryDocument>> {
    
      
      const checkNameExist = await this.categoryRepository.findOne({filter:{name:updateCategoryDto.name}})
           
     if (updateCategoryDto.name &&  checkNameExist) {
        throw new ConflictException('Category Name is Exist ')
     }
     
     const brands = [... new Set(updateCategoryDto.brands)].map(brand => {
      return Types.ObjectId.createFromHexString(brand as unknown as string)  
    })
   
   if (brands && (await this.brandRepository.find({ filter: { _id: { $in: brands } } })).length != brands.length) {
     throw new NotFoundException('some of mentioned brands are not exist ')
   }
  
   updateCategoryDto.brands = brands
   
   
     
  
     const removeBrands = updateCategoryDto.removeBrands ?? []
     delete updateCategoryDto.removeBrands
    
     const Category = await this.categoryRepository.findOneAndUpdate({
       filter: { _id: CategoryId },
       update: [{
         $set:{...updateCategoryDto,
         createdBy: user._id,
         brands: {
           $setUnion: [
             {
               $setDifference : [
                 '$brands',
                 (removeBrands || []).map((brand)=> {
                 return Types.ObjectId.createFromHexString(brand as unknown as string)
                 })
               ]
                 
               
             },
             (brands||[])

           ]
         }}
       }]
     })
      
     if (!Category) {
       throw new BadRequestException('Fail to find matching Category instance ')
     }
     
   
        return Category;
  
    }
   
    async updateAttachment(
      CategoryId: Types.ObjectId,
      user: userDocument,
      file:Express.Multer.File
  
    ):Promise<CategoryDocument | lean<CategoryDocument>> {
    
      
      const category = await this.categoryRepository.findOne({filter:{_id:CategoryId}})
      
      if (!category) {
        throw new BadRequestException('Fail to find matching Category instance ')
    
      }
      
      const image = await this.s3Service.uploadFile({
        path: `${FolderEnum.Category}/${category.assetFolderId}`,
        file
     }) 
     const updatedCategory = await this.categoryRepository.findOneAndUpdate({
       filter: { _id: CategoryId },
       update: {
         image,
         createdBy:user._id
       },
     })
      
     if (!updatedCategory) {
       await this.s3Service.deleteFile({
        Key:image
       })
       
       throw new BadRequestException('Fail to find matching Category instance ')
     }
     
     await this.s3Service.deleteFile({Key:category.image})
     category.image = image
      return updatedCategory
  
    }
  
   
   
    async softDelete(
      CategoryId: Types.ObjectId,
      user : userDocument
  
    ):Promise<CategoryDocument | lean<CategoryDocument>> {
    
     
     const result = await this.categoryRepository.findOneAndUpdate({
       filter: { _id: CategoryId , freezedAt:{$exists:false} },
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
      CategoryId: Types.ObjectId,
      user : userDocument
  
    ):Promise<CategoryDocument | lean<CategoryDocument>> {
    
     
     const result = await this.categoryRepository.findOneAndUpdate({
       filter: { _id: CategoryId ,paranoId:false , freezedAt:{$exists:true} },
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
      CategoryId: Types.ObjectId,
     
    ):Promise<CategoryDocument | lean<CategoryDocument>> {
    
     
     const Category = await this.categoryRepository.findOneAndDelete({
       filter: { _id: CategoryId ,paranoId:false ,freezedAt:{$exists:true} },
      
     })
      
     if (!Category) {
       throw new BadRequestException('Fail to find matching Category instance ')
      }
      
      await this.s3Service.deleteFile({
        Key:Category.image
      })
     
   
        return Category;
  
    }
   
   
   
   
    async findAll(data:GetAllDTO):Promise<{docsCount?:number,
    limit?: number,
    pages?:number,
    currentPage?: number|undefined,
    result: CategoryDocument[] | lean <CategoryDocument>[] }>
    {
      
      const {page , size , search} = data
      
      const categories = await this.categoryRepository.paginate({
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
     
      return categories;
    }
    async findAllArchive(data:GetAllDTO , archive:Boolean=false):Promise<{docsCount?:number,
    limit?: number,
    pages?:number,
    currentPage?: number|undefined,
    result: CategoryDocument[] | lean <CategoryDocument>[] }>
    {
      
      const {page , size , search} = data
      
      const categories = await this.categoryRepository.paginate({
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
     
      return categories;
    }
    async findOne(
      CategoryId: Types.ObjectId,
      archive: Boolean = false
    ): Promise<CategoryDocument | lean<CategoryDocument>>
    {
  
      const Category = await this.categoryRepository.findOne({
        filter: {
           _id:CategoryId ,
            ...(archive?{paranoId:false , freezedAt:{$exists:true}}:{})
           }
      })
     
      if (!Category) {
        throw new BadRequestException('Fail to find matching Category instance ')
      }
      return Category;
    }
  
    
  
    remove(id: number) {
      return `This action removes a #${id} Category`;
    }
  }
  
