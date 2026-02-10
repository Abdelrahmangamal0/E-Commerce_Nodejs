import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';

import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { CategoryParamsDto, UpdateCategoryDto } from './dto/update-category.dto';
import { CategoryResponse } from './entities/category.entity';
import { endPoint } from './authorization.category';
import { Auth, cloudFileUpload, fileValidations, GetAllDTO, GetAllResponse, ICategory, IResponse, User } from 'src/common';
import type { userDocument } from 'src/DB';
import { successResponse } from 'src/common/utils/response';

@ApiTags('Categories')
@ApiBearerAuth()
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  // ========================= CREATE CATEGORY =========================
  @Auth(endPoint.create)
  @UseInterceptors(FileInterceptor('attachment', cloudFileUpload({ validation: fileValidations.Image })))
  @Post()
  @ApiOperation({ summary: 'Create new category', description: 'Create a category with optional image attachment' })
  @ApiBody({ type: CreateCategoryDto })
  @ApiResponse({ status: 201, description: 'Category created successfully', type: CategoryResponse })
  async create(
    @User() user: userDocument,
    @Body() createCategoryDto: CreateCategoryDto,
    @UploadedFile(ParseFilePipe) file: Express.Multer.File,
  ): Promise<IResponse<CategoryResponse>> {
    const category = await this.categoryService.create(createCategoryDto, file, user);
    return successResponse<CategoryResponse>({ data: { category } });
  }

  // ========================= UPDATE CATEGORY =========================
  @Auth(endPoint.create)
  @Patch(':categoryId')
  @ApiOperation({ summary: 'Update category', description: 'Update category details by ID' })
  @ApiParam({ name: 'categoryId', required: true, example: '63f8c3f9e13a9a23cdd12345' })
  @ApiBody({ type: UpdateCategoryDto })
  @ApiResponse({ status: 200, description: 'Category updated successfully', type: CategoryResponse })
  async update(
    @User() user: userDocument,
    @Param() params: CategoryParamsDto,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ): Promise<IResponse<CategoryResponse>> {
    const category = await this.categoryService.update(params.categoryId, updateCategoryDto, user);
    return successResponse<CategoryResponse>({ data: { category } });
  }

  // ========================= UPDATE CATEGORY ATTACHMENT =========================
  @Auth(endPoint.create)
  @UseInterceptors(FileInterceptor('attachment', cloudFileUpload({ validation: fileValidations.Image })))
  @Patch(':categoryId/attachment')
  @ApiOperation({ summary: 'Update category image', description: 'Upload or replace category image' })
  @ApiParam({ name: 'categoryId', required: true, example: '63f8c3f9e13a9a23cdd12345' })
  @ApiResponse({ status: 200, description: 'Category attachment updated', type: CategoryResponse })
  async updateAttachment(
    @User() user: userDocument,
    @Param() params: CategoryParamsDto,
    @UploadedFile(ParseFilePipe) file: Express.Multer.File,
  ): Promise<IResponse<CategoryResponse>> {
    const category = await this.categoryService.updateAttachment(params.categoryId, user, file);
    return successResponse<CategoryResponse>({ data: { category } });
  }

  // ========================= SOFT DELETE CATEGORY =========================
  @Auth(endPoint.create)
  @Patch(':categoryId/softDelete')
  @ApiOperation({ summary: 'Soft delete category', description: 'Mark category as deleted without removing from DB' })
  @ApiParam({ name: 'categoryId', required: true, example: '63f8c3f9e13a9a23cdd12345' })
  @ApiResponse({ status: 200, description: 'Category soft-deleted successfully' })
  async softDelete(
    @User() user: userDocument,
    @Param() params: CategoryParamsDto,
  ): Promise<IResponse<CategoryResponse>> {
    await this.categoryService.softDelete(params.categoryId, user);
    return successResponse();
  }

  // ========================= RESTORE CATEGORY =========================
  @Auth(endPoint.create)
  @Patch(':categoryId/restore')
  @ApiOperation({ summary: 'Restore category', description: 'Restore previously soft-deleted category' })
  @ApiParam({ name: 'categoryId', required: true, example: '63f8c3f9e13a9a23cdd12345' })
  @ApiResponse({ status: 200, description: 'Category restored successfully' })
  async restore(
    @User() user: userDocument,
    @Param() params: CategoryParamsDto,
  ): Promise<IResponse<CategoryResponse>> {
    const category = await this.categoryService.restore(params.categoryId, user);
    return successResponse();
  }

  // ========================= DELETE CATEGORY =========================
  @Auth(endPoint.create)
  @Delete(':categoryId')
  @ApiOperation({ summary: 'Delete category permanently', description: 'Remove category from DB' })
  @ApiParam({ name: 'categoryId', required: true, example: '63f8c3f9e13a9a23cdd12345' })
  @ApiResponse({ status: 200, description: 'Category deleted successfully' })
  async delete(
    @User() user: userDocument,
    @Param() params: CategoryParamsDto,
  ): Promise<IResponse<CategoryResponse>> {
    await this.categoryService.delete(params.categoryId);
    return successResponse();
  }

  // ========================= GET ALL CATEGORIES =========================
  @Get()
  @ApiOperation({ summary: 'Get all categories', description: 'Retrieve all active categories with optional filters' })
  @ApiResponse({ status: 200, description: 'List of categories', type: [CategoryResponse] })
  async findAll(@Query() query: GetAllDTO): Promise<IResponse<GetAllResponse<ICategory>>> {
    const result = await this.categoryService.findAll(query);
    return successResponse<GetAllResponse<ICategory>>({ data: { result } });
  }

  // ========================= GET ALL ARCHIVED CATEGORIES =========================
  @Auth(endPoint.create)
  @Get('archive')
  @ApiOperation({ summary: 'Get all archived categories', description: 'Retrieve soft-deleted categories' })
  @ApiResponse({ status: 200, description: 'List of archived categories', type: [CategoryResponse] })
  async findAllArchive(@Query() query: GetAllDTO): Promise<IResponse<GetAllResponse<ICategory>>> {
    const result = await this.categoryService.findAllArchive(query, true);
    return successResponse<GetAllResponse<ICategory>>({ data: { result } });
  }

  // ========================= GET ONE CATEGORY =========================
  @Get(':categoryId')
  @ApiOperation({ summary: 'Get category by ID', description: 'Retrieve a single category by its ID' })
  @ApiParam({ name: 'categoryId', required: true, example: '63f8c3f9e13a9a23cdd12345' })
  @ApiResponse({ status: 200, description: 'Category retrieved', type: CategoryResponse })
  async findOne(@Param() params: CategoryParamsDto): Promise<IResponse<CategoryResponse>> {
    const category = await this.categoryService.findOne(params.categoryId);
    return successResponse<CategoryResponse>({ data: { category } });
  }

  // ========================= GET ONE ARCHIVED CATEGORY =========================
  @Get(':categoryId/archive')
  @ApiOperation({ summary: 'Get archived category by ID', description: 'Retrieve a single soft-deleted category by its ID' })
  @ApiParam({ name: 'categoryId', required: true, example: '63f8c3f9e13a9a23cdd12345' })
  @ApiResponse({ status: 200, description: 'Archived category retrieved', type: CategoryResponse })
  async findOneArchive(@Param() params: CategoryParamsDto): Promise<IResponse<CategoryResponse>> {
    const category = await this.categoryService.findOne(params.categoryId, true);
    return successResponse<CategoryResponse>({ data: { category } });
  }
}
