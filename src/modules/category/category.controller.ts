import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, ParseFilePipe, UploadedFile, Query, UsePipes, ValidationPipe } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { CategoryParamsDto, UpdateCategoryDto } from './dto/update-category.dto';
import { CategoryResponse } from './entities/category.entity';
import { endPoint } from '../category/authorization.category';
import { Auth, cloudFileUpload, fileValidations, GetAllDTO, GetAllResponse, ICategory, IResponse, User } from 'src/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { userDocument } from 'src/DB';
import { successResponse } from 'src/common/utils/response';

@UsePipes(new ValidationPipe({whitelist:true , forbidNonWhitelisted:true}))
@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

   @Auth(endPoint.create)
   @UseInterceptors(FileInterceptor('attachment', cloudFileUpload({ validation: fileValidations.Image })))
   @Post()
   async create(
     @User() user:userDocument,
     @Body() createCategoryDto: CreateCategoryDto,
     @UploadedFile(ParseFilePipe) file:Express.Multer.File 
   ):Promise<IResponse<CategoryResponse>> {
     const category = await this.categoryService.create(createCategoryDto, file , user);
     return successResponse<CategoryResponse>({data:{category}})
   }
 
   @Auth(endPoint.create)
   @Patch(':categoryId')
  async update(
     @User()user:userDocument,
     @Param() params: CategoryParamsDto,
    @Body() updateCategoryDto: UpdateCategoryDto
  
   ):Promise<IResponse<CategoryResponse>> {
     const category = await this.categoryService.update(params.categoryId, updateCategoryDto, user);
     return successResponse<CategoryResponse>({data:{category}}) 
   }
 
   @Auth(endPoint.create)
   @UseInterceptors(FileInterceptor('attachment',cloudFileUpload({validation:fileValidations.Image})))
   @Patch(':categoryId/attachment')
  async updateAttachment(
     @User()user:userDocument,
     @Param() params: CategoryParamsDto,
     @UploadedFile(ParseFilePipe) file:Express.Multer.File
   ):Promise<IResponse<CategoryResponse>> {
     const category = await this.categoryService.updateAttachment(params.categoryId, user , file);
     return successResponse<CategoryResponse>({data:{category}}) 
   }
 
 
   @Auth(endPoint.create)
   @Patch(':categoryId/softDelete')
   async softDelete(
     @User()user:userDocument,
     @Param() params: CategoryParamsDto,
   
   ):Promise<IResponse<CategoryResponse>> {
      await this.categoryService.softDelete(params.categoryId, user );
     return successResponse() 
   }
  
   @Auth(endPoint.create)
   @Patch(':categoryId/restore')
   async restore(
     @User()user:userDocument,
     @Param() params: CategoryParamsDto,
   
   ):Promise<IResponse<CategoryResponse>> {
     const category = await this.categoryService.restore(params.categoryId, user );
     return successResponse() 
   }
  
   @Auth(endPoint.create)
   @Delete(':categoryId')
   async delete(
     @User()user:userDocument,
     @Param() params: CategoryParamsDto,
   
   ):Promise<IResponse<CategoryResponse>> {
     const category = await this.categoryService.delete(params.categoryId );
     return successResponse() 
   }
 
 
   @Get()
   async findAll(@Query() query:GetAllDTO):Promise<IResponse<GetAllResponse<ICategory>>> {
     const 
     result = await this.categoryService.findAll(query);
    
     return successResponse<GetAllResponse<ICategory>>({data:{result}})
 
   }
   
   @Auth(endPoint.create)
   @Get('archive')
   async findAllArchive(@Query() query:GetAllDTO):Promise<IResponse<GetAllResponse<ICategory>>> {
     const 
     result = await this.categoryService.findAllArchive(query , true);
    
     return successResponse<GetAllResponse<ICategory>>({data:{result}})
 
   }
 
   @Get(':categoryId')
   async findOne(@Param() params: CategoryParamsDto):Promise<IResponse<CategoryResponse>> {
     const category = await this.categoryService.findOne(params.categoryId);
     return successResponse<CategoryResponse>({data:{category}})
   }
   @Get(':categoryId/archive')
   async findOneArchive(@Param() params: CategoryParamsDto):Promise<IResponse<CategoryResponse>>{
     const category = await this.categoryService.findOne(params.categoryId , true);
     return successResponse<CategoryResponse>({data:{category}})
   }
 
   
    }
 