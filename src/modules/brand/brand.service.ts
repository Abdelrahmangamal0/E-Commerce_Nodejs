import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import { CreateBrandDto } from './dto/create-brand.dto';
import { BrandRepository } from 'src/DB/repository/brand.repository';
import { BrandDocument, lean, userDocument } from 'src/DB';
import { FolderEnum, GetAllDTO, S3Service } from 'src/common';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { Types } from 'mongoose';

@Injectable()
export class BrandService {
 
  constructor(
    private readonly brandRepository:BrandRepository ,
    private readonly s3Service:S3Service
  ){}
 async create(
    createBrandDto: CreateBrandDto,
    file: Express.Multer.File,
    user : userDocument

  ):Promise<BrandDocument> {
  
    const { name, slogan } = createBrandDto
    
    const checkNameExist = await this.brandRepository.findOne({filter:{name:name}})
         
   if (checkNameExist) {
      throw new ConflictException('Brand Name is Exist ')
    }
    
   const image: string = await this.s3Service.uploadFile({
     file,
     path:FolderEnum.Brand
   })
   
   const [brand] = await this.brandRepository.create({
     Data: [{
       name, 
       slogan,
       image,
       createdBy:user?._id
     }]
   })

   if (!brand) {
     await this.s3Service.deleteFile({
       Key:image
     })

     throw new BadRequestException('fail to crate this brand resource') 
   }

   return brand
  }

 
 async update(
    brandId: Types.ObjectId,
    updateBrandDto: UpdateBrandDto,
    user : userDocument

  ):Promise<BrandDocument | lean<BrandDocument>> {
  
    
    const checkNameExist = await this.brandRepository.findOne({filter:{name:updateBrandDto.name}})
         
   if (updateBrandDto.name &&  checkNameExist) {
      throw new ConflictException('Brand Name is Exist ')
   }
   
   const brand = await this.brandRepository.findOneAndUpdate({
     filter: { _id: brandId },
     update: {
       ...updateBrandDto,
       createdBy:user._id
     }
   })
    
   if (!brand) {
     throw new BadRequestException('Fail to find matching brand instance ')
   }
   
 
      return brand;

  }
 
  async updateAttachment(
    brandId: Types.ObjectId,
    user: userDocument,
    file:Express.Multer.File

  ):Promise<BrandDocument | lean<BrandDocument>> {
  
    
    const image = await this.s3Service.uploadFile({
      path: FolderEnum.Brand,
      file
   }) 
   const brand = await this.brandRepository.findOneAndUpdate({
     filter: { _id: brandId },
     update: {
       image,
       createdBy:user._id
     },
     options:{new:false}
   })
    
   if (!brand) {
     await this.s3Service.deleteFile({
      Key:image
     })
     
     throw new BadRequestException('Fail to find matching brand instance ')
   }
   
   await this.s3Service.deleteFile({Key:brand.image})
    brand.image = image
    return brand;

  }

 
 
  async softDelete(
    brandId: Types.ObjectId,
    user : userDocument

  ):Promise<BrandDocument | lean<BrandDocument>> {
  
   
   const result = await this.brandRepository.findOneAndUpdate({
     filter: { _id: brandId , freezedAt:{$exists:false} },
     update: {
       $set: {
            freezedAt: new Date(),
            freezedBy: user._id
       },
     $unset:{restoredAt:1,restoredBy:1}
     }
   })
    
   if (!result) {
     throw new BadRequestException('Fail to find matching brand instance ')
   }
   
 
      return result;

  }
 
  async restore(
    brandId: Types.ObjectId,
    user : userDocument

  ):Promise<BrandDocument | lean<BrandDocument>> {
  
   
   const result = await this.brandRepository.findOneAndUpdate({
     filter: { _id: brandId ,paranoId:false , freezedAt:{$exists:true} },
     update: {
       $set: {
            restoredAt: new Date(),
            restoredBy: user._id
       },
     $unset:{freezedAt:1,freezedBy:1}
     }
   })
    
   if (!result) {
     throw new BadRequestException('Fail to find matching brand instance ')
   }
   
 
      return result;

  }
 
  
  async delete(
    brandId: Types.ObjectId,
    user : userDocument

  ):Promise<BrandDocument | lean<BrandDocument>> {
  
   
   const brand = await this.brandRepository.findOneAndDelete({
     filter: { _id: brandId ,paranoId:false ,freezedAt:{$exists:true} },
    
   })
    
   if (!brand) {
     throw new BadRequestException('Fail to find matching brand instance ')
    }
    
    await this.s3Service.deleteFile({
      Key:brand.image
    })
   
 
      return brand;

  }
 
 
 
 
  async findAll(data:GetAllDTO):Promise<{docsCount?:number,
  limit?: number,
  pages?:number,
  currentPage?: number|undefined,
  result: BrandDocument[] | lean <BrandDocument>[] }>
  {
    
    const {page , size , search} = data
    
    const brands = await this.brandRepository.paginate({
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
   
    return brands;
  }
  async findAllArchive(data:GetAllDTO , archive:Boolean=false):Promise<{docsCount?:number,
  limit?: number,
  pages?:number,
  currentPage?: number|undefined,
  result: BrandDocument[] | lean <BrandDocument>[] }>
  {
    
    const {page , size , search} = data
    
    const brands = await this.brandRepository.paginate({
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
   
    return brands;
  }
  async findOne(
    brandId: Types.ObjectId,
    archive: Boolean = false
  ): Promise<BrandDocument | lean<BrandDocument>>
  {

    const brand = await this.brandRepository.findOne({
      filter: {
         _id:brandId ,
          ...(archive?{paranoId:false , freezedAt:{$exists:true}}:{})
         }
    })
   
    if (!brand) {
      throw new BadRequestException('Fail to find matching brand instance ')
    }
    return brand;
  }

  

  remove(id: number) {
    return `This action removes a #${id} brand`;
  }
}
