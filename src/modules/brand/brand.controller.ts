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
  UsePipes,
  ValidationPipe,
  Query,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';

import { BrandService } from './brand.service';
import { CreateBrandDto } from './dto/create-brand.dto';
import { BrandParamsDto, UpdateBrandDto } from './dto/update-brand.dto';
import { BrandResponse } from './entities/brand.entity';
import { Auth, cloudFileUpload, fileValidations, GetAllDTO, GetAllResponse, IBrand, IResponse, User } from 'src/common';
import { endPoint } from './authorization.brand';
import type { userDocument } from 'src/DB';
import { successResponse } from 'src/common/utils/response';

@ApiTags('Brands')
@ApiBearerAuth()
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
@Controller('brand')
export class BrandController {
  constructor(private readonly brandService: BrandService) {}

  // ========================= CREATE BRAND =========================
  @Auth(endPoint.create)
  @UseInterceptors(FileInterceptor('attachment', cloudFileUpload({ validation: fileValidations.Image })))
  @Post()
  @ApiOperation({ summary: 'Create new brand', description: 'Create a new brand with optional image attachment' })
  @ApiBody({ type: CreateBrandDto })
  @ApiResponse({ status: 201, description: 'Brand created successfully', type: BrandResponse })
  async create(
    @User() user: userDocument,
    @Body() createBrandDto: CreateBrandDto,
    @UploadedFile(ParseFilePipe) file: Express.Multer.File,
  ): Promise<IResponse<BrandResponse>> {
    const brand = await this.brandService.create(createBrandDto, file, user);
    return successResponse<BrandResponse>({ data: { brand } });
  }

  // ========================= UPDATE BRAND =========================
  @Auth(endPoint.create)
  @Patch(':brandId')
  @ApiOperation({ summary: 'Update brand', description: 'Update brand details by ID' })
  @ApiParam({ name: 'brandId', required: true, example: '63f8c3f9e13a9a23cdd12345' })
  @ApiBody({ type: UpdateBrandDto })
  @ApiResponse({ status: 200, description: 'Brand updated successfully', type: BrandResponse })
  async update(
    @User() user: userDocument,
    @Param() params: BrandParamsDto,
    @Body() updateBrandDto: UpdateBrandDto,
  ): Promise<IResponse<BrandResponse>> {
    const brand = await this.brandService.update(params.brandId, updateBrandDto, user);
    return successResponse<BrandResponse>({ data: { brand } });
  }

  // ========================= UPDATE BRAND ATTACHMENT =========================
  @Auth(endPoint.create)
  @UseInterceptors(FileInterceptor('attachment', cloudFileUpload({ validation: fileValidations.Image })))
  @Patch(':brandId/attachment')
  @ApiOperation({ summary: 'Update brand image', description: 'Upload or replace brand image' })
  @ApiParam({ name: 'brandId', required: true, example: '63f8c3f9e13a9a23cdd12345' })
  @ApiResponse({ status: 200, description: 'Brand attachment updated', type: BrandResponse })
  async updateAttachment(
    @User() user: userDocument,
    @Param() params: BrandParamsDto,
    @UploadedFile(ParseFilePipe) file: Express.Multer.File,
  ): Promise<IResponse<BrandResponse>> {
    const brand = await this.brandService.updateAttachment(params.brandId, user, file);
    return successResponse<BrandResponse>({ data: { brand } });
  }

  // ========================= SOFT DELETE BRAND =========================
  @Auth(endPoint.create)
  @Patch(':brandId/softDelete')
  @ApiOperation({ summary: 'Soft delete brand', description: 'Mark brand as deleted without removing from DB' })
  @ApiParam({ name: 'brandId', required: true, example: '63f8c3f9e13a9a23cdd12345' })
  @ApiResponse({ status: 200, description: 'Brand soft-deleted successfully' })
  async softDelete(
    @User() user: userDocument,
    @Param() params: BrandParamsDto,
  ): Promise<IResponse<BrandResponse>> {
    await this.brandService.softDelete(params.brandId, user);
    return successResponse();
  }

  // ========================= RESTORE BRAND =========================
  @Auth(endPoint.create)
  @Patch(':brandId/restore')
  @ApiOperation({ summary: 'Restore brand', description: 'Restore previously soft-deleted brand' })
  @ApiParam({ name: 'brandId', required: true, example: '63f8c3f9e13a9a23cdd12345' })
  @ApiResponse({ status: 200, description: 'Brand restored successfully' })
  async restore(
    @User() user: userDocument,
    @Param() params: BrandParamsDto,
  ): Promise<IResponse<BrandResponse>> {
    const brand = await this.brandService.restore(params.brandId, user);
    return successResponse();
  }

  // ========================= DELETE BRAND =========================
  @Auth(endPoint.create)
  @Delete(':brandId')
  @ApiOperation({ summary: 'Delete brand permanently', description: 'Remove brand from DB' })
  @ApiParam({ name: 'brandId', required: true, example: '63f8c3f9e13a9a23cdd12345' })
  @ApiResponse({ status: 200, description: 'Brand deleted successfully' })
  async delete(
    @User() user: userDocument,
    @Param() params: BrandParamsDto,
  ): Promise<IResponse<BrandResponse>> {
    const brand = await this.brandService.delete(params.brandId, user);
    return successResponse();
  }

  // ========================= GET ALL BRANDS =========================
  @Get()
  @ApiOperation({ summary: 'Get all brands', description: 'Retrieve all active brands with optional filters' })
  @ApiResponse({ status: 200, description: 'List of brands', type: [BrandResponse] })
  async findAll(@Query() query: GetAllDTO): Promise<IResponse<GetAllResponse<IBrand>>> {
    const result = await this.brandService.findAll(query);
    return successResponse<GetAllResponse<IBrand>>({ data: { result } });
  }

  // ========================= GET ALL ARCHIVED BRANDS =========================
  @Auth(endPoint.create)
  @Get('archive')
  @ApiOperation({ summary: 'Get all archived brands', description: 'Retrieve soft-deleted brands' })
  @ApiResponse({ status: 200, description: 'List of archived brands', type: [BrandResponse] })
  async findAllArchive(@Query() query: GetAllDTO): Promise<IResponse<GetAllResponse<IBrand>>> {
    const result = await this.brandService.findAllArchive(query, true);
    return successResponse<GetAllResponse<IBrand>>({ data: { result } });
  }

  // ========================= GET ONE BRAND =========================
  @Get(':brandId')
  @ApiOperation({ summary: 'Get brand by ID', description: 'Retrieve a single brand by its ID' })
  @ApiParam({ name: 'brandId', required: true, example: '63f8c3f9e13a9a23cdd12345' })
  @ApiResponse({ status: 200, description: 'Brand retrieved', type: BrandResponse })
  async findOne(@Param() params: BrandParamsDto): Promise<IResponse<BrandResponse>> {
    const brand = await this.brandService.findOne(params.brandId);
    return successResponse<BrandResponse>({ data: { brand } });
  }

  // ========================= GET ONE ARCHIVED BRAND =========================
  @Get(':brandId/archive')
  @ApiOperation({ summary: 'Get archived brand by ID', description: 'Retrieve a soft-deleted brand by its ID' })
  @ApiParam({ name: 'brandId', required: true, example: '63f8c3f9e13a9a23cdd12345' })
  @ApiResponse({ status: 200, description: 'Archived brand retrieved', type: BrandResponse })
  async findOneArchive(@Param() params: BrandParamsDto): Promise<IResponse<BrandResponse>> {
    const brand = await this.brandService.findOne(params.brandId, true);
    return successResponse<BrandResponse>({ data: { brand } });
  }
}
