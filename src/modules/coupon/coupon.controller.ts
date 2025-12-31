import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFile, ParseFilePipe, Query, UsePipes, ValidationPipe } from '@nestjs/common';
import { CouponService } from './coupon.service';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto, UpdateParamsCouponDto } from './dto/update-coupon.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { Auth, cloudFileUpload, fileValidations, GetAllDTO, GetAllResponse, ICoupon, IResponse, User } from 'src/common';
import { endPoint } from './authorization.coupon';
import type{ userDocument } from 'src/DB';
import { successResponse } from 'src/common/utils/response';
import { CouponResponse } from './entities/coupon.entity';

@UsePipes(new ValidationPipe({ whitelist: true,  forbidNonWhitelisted: true  }))
@Controller('coupon')
export class CouponController {
  constructor(private readonly couponService: CouponService) {}

  @UseInterceptors(FileInterceptor('attachment' , cloudFileUpload({validation:fileValidations.Image})))
  @Auth(endPoint.create)
  @Post()
  async create(
   
    @User() user: userDocument,
    @Body() createCouponDto: CreateCouponDto,
    @UploadedFile(ParseFilePipe) file:Express.Multer.File
  ):Promise<IResponse<CouponResponse>> {
    const coupon = await this.couponService.create(createCouponDto , user , file);
  
    return successResponse<CouponResponse>({data:{coupon}})

  }
  
  @Auth(endPoint.create)
  @Patch(':couponId')
  async update(
   
    @User() user: userDocument,
    @Param() param:UpdateParamsCouponDto,
    @Body() updateCouponDto: UpdateCouponDto,
  ):Promise<IResponse<CouponResponse>> {
    const coupon = await this.couponService.update(param.couponId, updateCouponDto , user );
  
    return successResponse<CouponResponse>({data:{coupon}})

  }

  @UseInterceptors(FileInterceptor('attachment' ,cloudFileUpload({ validation: fileValidations.Image })))
  @Auth(endPoint.create)
  @Patch(':couponId/attachment')
  async updateAttachment(
    @Param() Params: UpdateParamsCouponDto,
    @User() user:userDocument,
    @UploadedFile(ParseFilePipe) file:Express.Multer.File 
  ):Promise<IResponse<CouponResponse>> {
      const coupon = await this.couponService.updateAttachment(Params.couponId,file, user);
      return  successResponse<CouponResponse>({data:{coupon}})
       }
   
   
   
       @Auth(endPoint.create)
       @Patch(':couponId/softDelete')
       async softDelete(
         @User()user:userDocument,
         @Param() params: UpdateParamsCouponDto,
       
       ):Promise<IResponse<CouponResponse>> {
          await this.couponService.softDelete(params.couponId, user );
         return successResponse() 
       }
      
       @Auth(endPoint.create)
       @Patch(':couponId/restore')
       async restore(
         @User()user:userDocument,
         @Param() params: UpdateParamsCouponDto,
       
       ):Promise<IResponse<CouponResponse>> {
         const coupon = await this.couponService.restore(params.couponId, user );
         return successResponse() 
       }
      
       @Auth(endPoint.create)
       @Delete(':couponId')
       async delete(
         @User()user:userDocument,
         @Param() params: UpdateParamsCouponDto,
       
       ):Promise<IResponse<CouponResponse>> {
         const coupon = await this.couponService.delete(params.couponId);
         return successResponse() 
       }
     
     
       @Get()
       async findAll(@Query() query:GetAllDTO):Promise<IResponse<GetAllResponse<ICoupon>>> {
         const 
         result = await this.couponService.findAll(query);
        
         return successResponse<GetAllResponse<ICoupon>>({data:{result}})
     
       }
       
       @Auth(endPoint.create)
       @Get('archive')
       async findAllArchive(@Query() query:GetAllDTO):Promise<IResponse<GetAllResponse<ICoupon>>> {
         const 
         result = await this.couponService.findAllArchive(query , true);
        
         return successResponse<GetAllResponse<ICoupon>>({data:{result}})
     
       }
     
       @Get(':couponId')
       async findOne(@Param() params: UpdateParamsCouponDto):Promise<IResponse<CouponResponse>> {
         const coupon = await this.couponService.findOne(params.couponId);
         return successResponse<CouponResponse>({data:{coupon}})
       }
       @Get(':couponId/archive')
       async findOneArchive(@Param() params: UpdateParamsCouponDto):Promise<IResponse<CouponResponse>>{
         const coupon = await this.couponService.findOne(params.couponId , true);
         return successResponse<CouponResponse>({data:{coupon}})
       }
  
}
