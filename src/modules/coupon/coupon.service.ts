import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto, UpdateParamsCouponDto } from './dto/update-coupon.dto';
import { CouponDocument, CouponRepository, lean, userDocument, UserRepository } from 'src/DB';
import { FolderEnum, GetAllDTO, S3Service } from 'src/common';
import { Types } from 'mongoose';

@Injectable()
export class CouponService {
  
  constructor(
    private readonly couponRepository:CouponRepository,
    private readonly s3Service: S3Service,
      
  ){}

  
  
  
  
  async create(createCouponDto: CreateCouponDto, user: userDocument, file: Express.Multer.File): Promise<CouponDocument> {
   
    const checkDuplicated =  await this.couponRepository.findOne({filter:{name:createCouponDto.name , paranoId:false}})
   
    if (checkDuplicated) {
      throw new BadRequestException(' coupon name Duplicated')
    }
     
    // console.log(createCouponDto.type);
    
const startDate = new Date(createCouponDto.startDate);
const endDate = new Date(createCouponDto.endDate);
const now = new Date();

if (startDate < now) {
  throw new BadRequestException("Start date must be today or in the future");
}

if (endDate <= startDate) {
  throw new BadRequestException("End date must be after start date");
}

    const image = await this.s3Service.uploadFile({
      file,
      path:FolderEnum.Coupon
    })
  
    const [coupon] = await this.couponRepository.create({
      Data: [{
        ...createCouponDto,
        image,
        createdBy:user._id
     }]
    })
    
    if (!coupon) {
      await this.s3Service.deleteFile({
        Key:image
      })

      throw new BadRequestException('Fail to create this coupon')
    }
  
    return coupon;
  }
  async update(couponId:Types.ObjectId, updateCouponDto: UpdateCouponDto, user: userDocument): Promise<CouponDocument> {
   
    const coupon = await this.couponRepository.findOne({filter:{_id:couponId} })
   
    if (!coupon) {
      throw new BadRequestException(' fail to find coupon Instance')
    }
    if (updateCouponDto.name) {
      const checkDuplicated = await this.couponRepository.findOne({ filter: { name: updateCouponDto.name, paranoId: false } })
   
      if (checkDuplicated) {
        throw new BadRequestException(' coupon name Duplicated')
      }
    }


    // if(updateCouponDto.usedBy?.length){

    //   const usedBy = [...new Set(updateCouponDto.usedBy)]
   
    //   const checkUserExist = await this.userRepository.find({ filter: { _id: { $in: usedBy }, paranoId: false } })
     
    // if (!checkUserExist.length) {
    //   throw new BadRequestException(' some userIds is not exist')
    // }}
   
     
    if (updateCouponDto.startDate || updateCouponDto.endDate) {
      const startDateValue =
        updateCouponDto.startDate ?? coupon.startDate;
    
      const endDateValue =
        updateCouponDto.endDate ?? coupon.endDate;
    
      const startDate = new Date(startDateValue);
      const endDate = new Date(endDateValue);
      const now = new Date();
    
    
      if (startDate < now) {
        throw new BadRequestException("Start date must be today or in the future");
      }
    
      if (endDate <= startDate) {
        throw new BadRequestException("End date must be after start date");
      }
    }
    

    const updateCoupon = await this.couponRepository.findOneAndUpdate({
      filter: { _id: couponId },
      update: {
        ...updateCouponDto,
        createdBy:user._id
      }
    })
  
    if (!updateCoupon) {
      throw new BadRequestException(' fail to find coupon Instance')
    }
    
    return updateCoupon as unknown as CouponDocument ;
  }

async updateAttachment(couponId:Types.ObjectId,file:Express.Multer.File ,  user:userDocument) {
   
    
   const coupon = await this.couponRepository.findOne({ filter: { _id: couponId } })   
  
   if (!coupon) {
    throw new BadRequestException('Fail to find matching product instance ')
     
   }
    const image = await this.s3Service.uploadFile({
       path: FolderEnum.Coupon,
       file
    })
     
  
     
    const updateProduct= await this.couponRepository.findOneAndUpdate({
      filter: { _id: couponId },
      update: {
        image,
        createdBy: user._id
        }
    
    })

    if (!updateProduct) {
      await this.s3Service.deleteFile({
       Key:image   
      })
      throw new BadRequestException('Fail to update coupon  pleas try again later')
   }
   
   await this.s3Service.deleteFile({
       Key:coupon.image
     })

    return updateProduct
  }



  
       async softDelete(
         couponId: Types.ObjectId,
         user : userDocument
     
       ):Promise<CouponDocument | lean<CouponDocument>> {
       
        
        const result = await this.couponRepository.findOneAndUpdate({
          filter: { _id: couponId , freezedAt:{$exists:false} },
          update: {
            $set: {
                 freezedAt: new Date(),
                 freezedBy: user._id
            },
          $unset:{restoredAt:1,restoredBy:1}
          }
        })
         
        if (!result) {
          throw new BadRequestException('Fail to find matching coupon instance ')
        }
        
      
           return result;
     
       }
      
       async restore(
         couponId: Types.ObjectId,
         user : userDocument
     
       ):Promise<CouponDocument | lean<CouponDocument>> {
       
        
        const result = await this.couponRepository.findOneAndUpdate({
          filter: { _id: couponId ,paranoId:false , freezedAt:{$exists:true} },
          update: {
            $set: {
                 restoredAt: new Date(),
                 restoredBy: user._id
            },
          $unset:{freezedAt:1,freezedBy:1}
          }
        })
         
        if (!result) {
          throw new BadRequestException('Fail to find matching c instance ')
        }
        
      
           return result;
     
       }
      
       
       async delete(
         couponId: Types.ObjectId,
       
       ):Promise<CouponDocument | lean<CouponDocument>> {
       
        
        const coupon = await this.couponRepository.findOneAndDelete({
          filter: { _id: couponId ,paranoId:false ,freezedAt:{$exists:true} },
         
        })
         
        if (!coupon) {
          throw new BadRequestException('Fail to find matching coupon instance ')
         }
         
         await this.s3Service.deleteFile({
           Key:coupon.image
         })
        
      
           return coupon;
     
       }
      
      
      
      
       async findAll(data:GetAllDTO):Promise<{docsCount?:number,
       limit?: number,
       pages?:number,
       currentPage?: number|undefined,
       result: CouponDocument[] | lean <CouponDocument>[] }>
       {
         
         const {page , size , search} = data
         
         const coupons = await this.couponRepository.paginate({
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
        
         return coupons;
       }
       async findAllArchive(data:GetAllDTO , archive:Boolean=false):Promise<{docsCount?:number,
       limit?: number,
       pages?:number,
       currentPage?: number|undefined,
       result: CouponDocument[] | lean <CouponDocument>[] }>
       {
         
         const {page , size , search} = data
         
         const coupons = await this.couponRepository.paginate({
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
        
         return coupons;
       }
       async findOne(
         couponId: Types.ObjectId,
         archive: Boolean = false
       ): Promise<CouponDocument | lean<CouponDocument>>
       {
     
         const coupon = await this.couponRepository.findOne({
           filter: {
              _id:couponId ,
               ...(archive?{paranoId:false , freezedAt:{$exists:true}}:{})
              }
         })
        
         if (!coupon) {
           throw new BadRequestException('Fail to find matching coupon instance ')
         }
         return coupon;
       }
     
       
     
     
}
