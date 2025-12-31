import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFile, ParseFilePipe, UsePipes, ValidationPipe, Query } from '@nestjs/common';
import { BrandService } from './brand.service';
import { CreateBrandDto } from './dto/create-brand.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { Auth, cloudFileUpload, fileValidations, GetAllDTO, GetAllResponse, IBrand, roleEnum, User } from 'src/common';
import { endPoint } from './authorization.brand';
import type { userDocument } from 'src/DB';
import { IResponse } from 'src/common/interface/response.interface';
import type {BrandResponse } from './entities/brand.entity';
import { successResponse } from 'src/common/utils/response';
import { BrandParamsDto, UpdateBrandDto } from './dto/update-brand.dto';

@UsePipes(new ValidationPipe({whitelist:true , forbidNonWhitelisted:true}))
@Controller('brand')
export class BrandController {
  constructor(private readonly brandService: BrandService) {}
  @Auth(endPoint.create)
  @UseInterceptors(FileInterceptor('attachment', cloudFileUpload({ validation: fileValidations.Image })))
  @Post()
  async create(
    @User() user:userDocument,
    @Body() createBrandDto: CreateBrandDto,
    @UploadedFile(ParseFilePipe) file:Express.Multer.File 
  ):Promise<IResponse<BrandResponse>> {
    const brand = await this.brandService.create(createBrandDto, file, user);
    return successResponse<BrandResponse>({data:{brand}})
  }

  @Auth(endPoint.create)
  @Patch(':brandId')
 async update(
    @User()user:userDocument,
    @Param() params: BrandParamsDto,
   @Body() updateBrandDto: UpdateBrandDto
 
  ):Promise<IResponse<BrandResponse>> {
    const brand = await this.brandService.update(params.brandId, updateBrandDto, user);
    return successResponse<BrandResponse>({data:{brand}}) 
  }

  @Auth(endPoint.create)
  @UseInterceptors(FileInterceptor('attachment',cloudFileUpload({validation:fileValidations.Image})))
  @Patch(':brandId/attachment')
 async updateAttachment(
    @User()user:userDocument,
    @Param() params: BrandParamsDto,
    @UploadedFile(ParseFilePipe) file:Express.Multer.File
  ):Promise<IResponse<BrandResponse>> {
    const brand = await this.brandService.updateAttachment(params.brandId, user , file);
    return successResponse<BrandResponse>({data:{brand}}) 
  }


  @Auth(endPoint.create)
  @Patch(':brandId/softDelete')
  async softDelete(
    @User()user:userDocument,
    @Param() params: BrandParamsDto,
  
  ):Promise<IResponse<BrandResponse>> {
     await this.brandService.softDelete(params.brandId, user );
    return successResponse() 
  }
 
  @Auth(endPoint.create)
  @Patch(':brandId/restore')
  async restore(
    @User()user:userDocument,
    @Param() params: BrandParamsDto,
  
  ):Promise<IResponse<BrandResponse>> {
    const brand = await this.brandService.restore(params.brandId, user );
    return successResponse() 
  }
 
  @Auth(endPoint.create)
  @Delete(':brandId')
  async delete(
    @User()user:userDocument,
    @Param() params: BrandParamsDto,
  
  ):Promise<IResponse<BrandResponse>> {
    const brand = await this.brandService.delete(params.brandId, user );
    return successResponse() 
  }


  @Get()
  async findAll(@Query() query:GetAllDTO):Promise<IResponse<GetAllResponse<IBrand>>> {
    const 
    result = await this.brandService.findAll(query);
   
    return successResponse<GetAllResponse<IBrand>>({data:{result}})

  }
  
  @Auth(endPoint.create)
  @Get('archive')
  async findAllArchive(@Query() query:GetAllDTO):Promise<IResponse<GetAllResponse<IBrand>>> {
    const 
    result = await this.brandService.findAllArchive(query , true);
   
    return successResponse<GetAllResponse<IBrand>>({data:{result}})

  }

  @Get(':brandId')
  async findOne(@Param() params: BrandParamsDto):Promise<IResponse<BrandResponse>> {
    const brand = await this.brandService.findOne(params.brandId);
    return successResponse<BrandResponse>({data:{brand}})
  }
  @Get(':brandId/archive')
  async findOneArchive(@Param() params: BrandParamsDto):Promise<IResponse<BrandResponse>>{
    const brand = await this.brandService.findOne(params.brandId , true);
    return successResponse<BrandResponse>({data:{brand}})
  }

  
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.brandService.remove(+id);
  }
}
