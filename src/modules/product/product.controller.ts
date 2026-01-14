import { Controller, Get, Post, Body, Patch, Param, Delete, UsePipes, ValidationPipe, UseInterceptors, UploadedFile, ParseFilePipe, UploadedFiles, Query, Inject } from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateParamsProductDto, UpdateProductAttachmentDto, UpdateProductDto } from './dto/update-product.dto';
import { Auth, cloudFileUpload, fileValidations, GetAllDTO, GetAllResponse, IProduct, IResponse, roleEnum, storageEnum, TTL, User } from 'src/common';
import { endPoint } from 'src/modules/brand/authorization.brand';
import type { userDocument } from 'src/DB';
import { ProductResponse } from './entities/product.entity';
import { successResponse } from 'src/common/utils/response';
import { FilesInterceptor } from '@nestjs/platform-express';
import {type RedisClientType } from 'redis';
import { RedisCacheInterceptor } from 'src/common/interceptors/cach.intercepto';


@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
@Controller('product')
export class ProductController {
  constructor(
    private readonly productService: ProductService ,
    @Inject('REDIS_CLIENT') private redisClient: RedisClientType
  ) {}


  @Get('test')
 async test(){
  // this.redisClient.del('user')
    let user = JSON.parse(await this.redisClient.get('user') as string)
    if (!user) {
      user = { message: `Done at ${Date.now()}`, name: "AG" }
      await this.redisClient.set('user' , JSON.stringify(user) ,{EX: 10})
}
return { message: `Done at ${Date.now()}`, name: "AG" }
  }


  
     @Auth(endPoint.create)
     @UseInterceptors(FilesInterceptor('attachments',5 ,cloudFileUpload({ validation: fileValidations.Image , storageApproach:storageEnum.disk  })))
     @Post()
     async create(
       @User() user:userDocument,
       @Body() createProductDto: CreateProductDto,
       @UploadedFiles(ParseFilePipe) files:Express.Multer.File[] 
     ):Promise<IResponse<ProductResponse>> {
       const product = await this.productService.create(createProductDto, files , user);
       return successResponse<ProductResponse>({data:{product}})
     }
  
  
@Auth(endPoint.create)
@Patch(':productId')
async update(
  @Param() Params: UpdateParamsProductDto,
  @User() user:userDocument,
  @Body() updateProductDto: UpdateProductDto
  ):Promise<IResponse<ProductResponse>> {
    const product = await this.productService.update(Params.productId, updateProductDto, user);
    
    return successResponse<ProductResponse>({data:{product}})
     }
 
@UseInterceptors(FilesInterceptor('attachments',5 ,cloudFileUpload({ validation: fileValidations.Image , storageApproach:storageEnum.disk  })))
@Auth(endPoint.create)
@Patch(':productId/attachments')
async updateAttachment(
  @Param() Params: UpdateParamsProductDto,
  @User() user:userDocument,
  @Body() updateProductAttachmentDto: UpdateProductAttachmentDto,
  @UploadedFiles(ParseFilePipe) files:Express.Multer.File[]  
):Promise<IResponse<ProductResponse>> {
    const product = await this.productService.updateAttachment(Params.productId,files, updateProductAttachmentDto, user);
    return  successResponse<ProductResponse>({data:{product}})
     }
 
 
 
     @Auth(endPoint.create)
     @Patch(':productId/softDelete')
     async softDelete(
       @User()user:userDocument,
       @Param() params: UpdateParamsProductDto,
     
     ):Promise<IResponse<ProductResponse>> {
        await this.productService.softDelete(params.productId, user );
       return successResponse() 
     }
    
     @Auth(endPoint.create)
     @Patch(':productId/restore')
     async restore(
       @User()user:userDocument,
       @Param() params: UpdateParamsProductDto,
     
     ):Promise<IResponse<ProductResponse>> {
       const product = await this.productService.restore(params.productId, user );
       return successResponse() 
     }
    
     @Auth(endPoint.create)
     @Delete(':productId')
     async delete(
       @User()user:userDocument,
       @Param() params: UpdateParamsProductDto,
     
     ):Promise<IResponse<ProductResponse>> {
       const product = await this.productService.delete(params.productId);
       return successResponse() 
     }
   
     @TTL(20)
     @UseInterceptors(RedisCacheInterceptor)
     @Get()
     async findAll(@Query() query:GetAllDTO):Promise<IResponse<GetAllResponse<IProduct>>> {
       const 
       result = await this.productService.findAll(query);
      
       return successResponse<GetAllResponse<IProduct>>({data:{result}})
   
     }
     
     @Auth(endPoint.create)
     @Get('archive')
     async findAllArchive(@Query() query:GetAllDTO):Promise<IResponse<GetAllResponse<IProduct>>> {
       const 
       result = await this.productService.findAllArchive(query , true);
      
       return successResponse<GetAllResponse<IProduct>>({data:{result}})
   
     }
   
     @Get(':productId')
     async findOne(@Param() params: UpdateParamsProductDto):Promise<IResponse<ProductResponse>> {
       const product = await this.productService.findOne(params.productId);
       return successResponse<ProductResponse>({data:{product}})
     }
     @Get(':productId/archive')
     async findOneArchive(@Param() params: UpdateParamsProductDto):Promise<IResponse<ProductResponse>>{
       const product = await this.productService.findOne(params.productId , true);
       return successResponse<ProductResponse>({data:{product}})
     }
     
      @Auth([roleEnum.User])
      @Patch(':productId/addToWishList')
      async addToWishList(
       @User()user:userDocument,
       @Param() params: UpdateParamsProductDto): Promise<IResponse<ProductResponse>>{
       const product = await this.productService.addToWishList(params.productId , user);
       return successResponse<ProductResponse>({data:{product}})
     }
    
  @Auth([roleEnum.User])  
    @Patch(':productId/removeFromWishList')
     async removeFromWishList(
       @User()user:userDocument,
       @Param() params: UpdateParamsProductDto): Promise<IResponse>{
       const product = await this.productService.removeFromWishList(params.productId ,user);
       return successResponse()
     }
   
}

