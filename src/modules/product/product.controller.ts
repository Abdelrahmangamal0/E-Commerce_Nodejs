import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UsePipes,
  ValidationPipe,
  UseInterceptors,
  UploadedFiles,
  Query,
  Inject,
} from '@nestjs/common';

import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
  ApiBody,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';

import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import {
  UpdateParamsProductDto,
  UpdateProductAttachmentDto,
  UpdateProductDto,
} from './dto/update-product.dto';

import {
  Auth,
  cloudFileUpload,
  fileValidations,
  GetAllDTO,
  GetAllResponse,
  IProduct,
  IResponse,
  roleEnum,
  storageEnum,
  TTL,
  User,
} from 'src/common';

import { endPoint } from 'src/modules/brand/authorization.brand';
import type { userDocument } from 'src/DB';
import { ProductResponse } from './entities/product.entity';
import { successResponse } from 'src/common/utils/response';
import { FilesInterceptor } from '@nestjs/platform-express';
import type { RedisClientType } from 'redis';
import { RedisCacheInterceptor } from 'src/common/interceptors/cach.intercepto';

@ApiTags('Product')
@ApiBearerAuth()
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
@Controller('product')
export class ProductController {
  constructor(
    private readonly productService: ProductService,
    @Inject('REDIS_CLIENT') private redisClient: RedisClientType,
  ) {}

  // ================= CREATE PRODUCT =================
  @ApiOperation({ summary: 'Create new product' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        attachments: {
          type: 'array',
          items: { type: 'string', format: 'binary' },
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Product created successfully' })
  @Auth(endPoint.create)
  @UseInterceptors(
    FilesInterceptor(
      'attachments',
      5,
      cloudFileUpload({
        validation: fileValidations.Image,
        storageApproach: storageEnum.disk,
      }),
    ),
  )
  @Post()
  async create(
    @User() user: userDocument,
    @Body() createProductDto: CreateProductDto,
    @UploadedFiles() files: Express.Multer.File[],
  ): Promise<IResponse<ProductResponse>> {
    const product = await this.productService.create(
      createProductDto,
      files,
      user,
    );
    return successResponse<ProductResponse>({ data: { product } });
  }

  // ================= UPDATE PRODUCT =================
  @ApiOperation({ summary: 'Update product data' })
  @ApiParam({ name: 'productId', example: '65af12e1b1e3a9f12caa22aa' })
  @ApiResponse({ status: 200, description: 'Product updated successfully' })
  @Auth(endPoint.create)
  @Patch(':productId')
  async update(
    @Param() params: UpdateParamsProductDto,
    @User() user: userDocument,
    @Body() updateProductDto: UpdateProductDto,
  ): Promise<IResponse<ProductResponse>> {
    const product = await this.productService.update(
      params.productId,
      updateProductDto,
      user,
    );
    return successResponse<ProductResponse>({ data: { product } });
  }

  // ================= UPDATE ATTACHMENTS =================
  @ApiOperation({ summary: 'Update product attachments' })
  @ApiConsumes('multipart/form-data')
  @ApiParam({ name: 'productId' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        attachments: {
          type: 'array',
          items: { type: 'string', format: 'binary' },
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Attachments updated successfully' })
  @UseInterceptors(
    FilesInterceptor(
      'attachments',
      5,
      cloudFileUpload({
        validation: fileValidations.Image,
        storageApproach: storageEnum.disk,
      }),
    ),
  )
  @Auth(endPoint.create)
  @Patch(':productId/attachments')
  async updateAttachment(
    @Param() params: UpdateParamsProductDto,
    @User() user: userDocument,
    @Body() updateProductAttachmentDto: UpdateProductAttachmentDto,
    @UploadedFiles() files: Express.Multer.File[],
  ): Promise<IResponse<ProductResponse>> {
    const product = await this.productService.updateAttachment(
      params.productId,
      files,
      updateProductAttachmentDto,
      user,
    );
    return successResponse<ProductResponse>({ data: { product } });
  }

  // ================= SOFT DELETE =================
  @ApiOperation({ summary: 'Soft delete product' })
  @ApiParam({ name: 'productId' })
  @Auth(endPoint.create)
  @Patch(':productId/softDelete')
  async softDelete(
    @User() user: userDocument,
    @Param() params: UpdateParamsProductDto,
  ): Promise<IResponse> {
    await this.productService.softDelete(params.productId, user);
    return successResponse();
  }

  // ================= RESTORE =================
  @ApiOperation({ summary: 'Restore deleted product' })
  @ApiParam({ name: 'productId' })
  @Auth(endPoint.create)
  @Patch(':productId/restore')
  async restore(
    @User() user: userDocument,
    @Param() params: UpdateParamsProductDto,
  ): Promise<IResponse> {
    await this.productService.restore(params.productId, user);
    return successResponse();
  }

  // ================= DELETE =================
  @ApiOperation({ summary: 'Delete product permanently' })
  @ApiParam({ name: 'productId' })
  @Auth(endPoint.create)
  @Delete(':productId')
  async delete(
    @Param() params: UpdateParamsProductDto,
  ): Promise<IResponse> {
    await this.productService.delete(params.productId);
    return successResponse();
  }

  // ================= GET ALL =================
  @ApiOperation({ summary: 'Get all products' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @TTL(20)
  @UseInterceptors(RedisCacheInterceptor)
  @Get()
  async findAll(
    @Query() query: GetAllDTO,
  ): Promise<IResponse<GetAllResponse<IProduct>>> {
    const result = await this.productService.findAll(query);
    return successResponse<GetAllResponse<IProduct>>({ data: { result } });
  }

  // ================= ARCHIVE =================
  @ApiOperation({ summary: 'Get archived products' })
  @Auth(endPoint.create)
  @Get('archive')
  async findAllArchive(
    @Query() query: GetAllDTO,
  ): Promise<IResponse<GetAllResponse<IProduct>>> {
    const result = await this.productService.findAllArchive(query, true);
    return successResponse<GetAllResponse<IProduct>>({ data: { result } });
  }

  // ================= FIND ONE =================
  @ApiOperation({ summary: 'Get product by ID' })
  @ApiParam({ name: 'productId' })
  @Get(':productId')
  async findOne(
    @Param() params: UpdateParamsProductDto,
  ): Promise<IResponse<ProductResponse>> {
    const product = await this.productService.findOne(params.productId);
    return successResponse<ProductResponse>({ data: { product } });
  }

  // ================= FIND ONE ARCHIVE =================
  @ApiOperation({ summary: 'Get archived product by ID' })
  @ApiParam({ name: 'productId' })
  @Get(':productId/archive')
  async findOneArchive(
    @Param() params: UpdateParamsProductDto,
  ): Promise<IResponse<ProductResponse>> {
    const product = await this.productService.findOne(params.productId, true);
    return successResponse<ProductResponse>({ data: { product } });
  }

  // ================= WISHLIST =================
  @ApiOperation({ summary: 'Add product to wishlist' })
  @ApiParam({ name: 'productId' })
  @Auth([roleEnum.User])
  @Patch(':productId/addToWishList')
  async addToWishList(
    @User() user: userDocument,
    @Param() params: UpdateParamsProductDto,
  ): Promise<IResponse<ProductResponse>> {
    const product = await this.productService.addToWishList(
      params.productId,
      user,
    );
    return successResponse<ProductResponse>({ data: { product } });
  }

  @ApiOperation({ summary: 'Remove product from wishlist' })
  @ApiParam({ name: 'productId' })
  @Auth([roleEnum.User])
  @Patch(':productId/removeFromWishList')
  async removeFromWishList(
    @User() user: userDocument,
    @Param() params: UpdateParamsProductDto,
  ): Promise<IResponse> {
    await this.productService.removeFromWishList(params.productId, user);
    return successResponse();
  }
}
