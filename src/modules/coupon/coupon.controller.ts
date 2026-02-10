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

import { CouponService } from './coupon.service';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto, UpdateParamsCouponDto } from './dto/update-coupon.dto';
import { CouponResponse } from './entities/coupon.entity';
import { Auth, cloudFileUpload, fileValidations, GetAllDTO, GetAllResponse, ICoupon, IResponse, User } from 'src/common';
import { endPoint } from './authorization.coupon';
import type { userDocument } from 'src/DB';
import { successResponse } from 'src/common/utils/response';

@ApiTags('Coupons') // Swagger tag
@ApiBearerAuth() // Requires authentication
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
@Controller('coupon')
export class CouponController {
  constructor(private readonly couponService: CouponService) {}

  // ========================= CREATE COUPON =========================
  @UseInterceptors(FileInterceptor('attachment', cloudFileUpload({ validation: fileValidations.Image })))
  @Auth(endPoint.create)
  @Post()
  @ApiOperation({
    summary: 'Create new coupon',
    description: 'Create a new coupon with optional image attachment for authenticated user',
  })
  @ApiBody({ type: CreateCouponDto })
  @ApiResponse({ status: 201, description: 'Coupon created successfully', type: CouponResponse })
  async create(
    @User() user: userDocument,
    @Body() createCouponDto: CreateCouponDto,
    @UploadedFile(ParseFilePipe) file: Express.Multer.File,
  ): Promise<IResponse<CouponResponse>> {
    const coupon = await this.couponService.create(createCouponDto, user, file);
    return successResponse<CouponResponse>({ data: { coupon } });
  }

  // ========================= UPDATE COUPON =========================
  @Auth(endPoint.create)
  @Patch(':couponId')
  @ApiOperation({ summary: 'Update coupon details', description: 'Update coupon info by couponId' })
  @ApiParam({ name: 'couponId', required: true, example: '63f8c3f9e13a9a23cdd12345' })
  @ApiBody({ type: UpdateCouponDto })
  @ApiResponse({ status: 200, description: 'Coupon updated successfully', type: CouponResponse })
  async update(
    @User() user: userDocument,
    @Param() param: UpdateParamsCouponDto,
    @Body() updateCouponDto: UpdateCouponDto,
  ): Promise<IResponse<CouponResponse>> {
    const coupon = await this.couponService.update(param.couponId, updateCouponDto, user);
    return successResponse<CouponResponse>({ data: { coupon } });
  }

  // ========================= UPDATE COUPON ATTACHMENT =========================
  @UseInterceptors(FileInterceptor('attachment', cloudFileUpload({ validation: fileValidations.Image })))
  @Auth(endPoint.create)
  @Patch(':couponId/attachment')
  @ApiOperation({ summary: 'Update coupon attachment', description: 'Upload/replace coupon image' })
  @ApiParam({ name: 'couponId', required: true, example: '63f8c3f9e13a9a23cdd12345' })
  @ApiResponse({ status: 200, description: 'Coupon attachment updated', type: CouponResponse })
  async updateAttachment(
    @Param() params: UpdateParamsCouponDto,
    @User() user: userDocument,
    @UploadedFile(ParseFilePipe) file: Express.Multer.File,
  ): Promise<IResponse<CouponResponse>> {
    const coupon = await this.couponService.updateAttachment(params.couponId, file, user);
    return successResponse<CouponResponse>({ data: { coupon } });
  }

  // ========================= SOFT DELETE COUPON =========================
  @Auth(endPoint.create)
  @Patch(':couponId/softDelete')
  @ApiOperation({ summary: 'Soft delete coupon', description: 'Mark coupon as deleted without removing from DB' })
  @ApiParam({ name: 'couponId', required: true, example: '63f8c3f9e13a9a23cdd12345' })
  @ApiResponse({ status: 200, description: 'Coupon soft-deleted successfully' })
  async softDelete(
    @User() user: userDocument,
    @Param() params: UpdateParamsCouponDto,
  ): Promise<IResponse<CouponResponse>> {
    await this.couponService.softDelete(params.couponId, user);
    return successResponse();
  }

  // ========================= RESTORE COUPON =========================
  @Auth(endPoint.create)
  @Patch(':couponId/restore')
  @ApiOperation({ summary: 'Restore coupon', description: 'Restore previously soft-deleted coupon' })
  @ApiParam({ name: 'couponId', required: true, example: '63f8c3f9e13a9a23cdd12345' })
  @ApiResponse({ status: 200, description: 'Coupon restored successfully' })
  async restore(
    @User() user: userDocument,
    @Param() params: UpdateParamsCouponDto,
  ): Promise<IResponse<CouponResponse>> {
    const coupon = await this.couponService.restore(params.couponId, user);
    return successResponse();
  }

  // ========================= DELETE COUPON =========================
  @Auth(endPoint.create)
  @Delete(':couponId')
  @ApiOperation({ summary: 'Delete coupon permanently', description: 'Remove coupon from DB' })
  @ApiParam({ name: 'couponId', required: true, example: '63f8c3f9e13a9a23cdd12345' })
  @ApiResponse({ status: 200, description: 'Coupon deleted successfully' })
  async delete(
    @User() user: userDocument,
    @Param() params: UpdateParamsCouponDto,
  ): Promise<IResponse<CouponResponse>> {
    await this.couponService.delete(params.couponId);
    return successResponse();
  }

  // ========================= GET ALL COUPONS =========================
  @Get()
  @ApiOperation({ summary: 'Get all coupons', description: 'Retrieve all active coupons with optional filters' })
  @ApiResponse({ status: 200, description: 'List of coupons', type: [CouponResponse] })
  async findAll(@Query() query: GetAllDTO): Promise<IResponse<GetAllResponse<ICoupon>>> {
    const result = await this.couponService.findAll(query);
    return successResponse<GetAllResponse<ICoupon>>({ data: { result } });
  }

  // ========================= GET ALL ARCHIVED COUPONS =========================
  @Auth(endPoint.create)
  @Get('archive')
  @ApiOperation({ summary: 'Get all archived coupons', description: 'Retrieve soft-deleted coupons' })
  @ApiResponse({ status: 200, description: 'List of archived coupons', type: [CouponResponse] })
  async findAllArchive(@Query() query: GetAllDTO): Promise<IResponse<GetAllResponse<ICoupon>>> {
    const result = await this.couponService.findAllArchive(query, true);
    return successResponse<GetAllResponse<ICoupon>>({ data: { result } });
  }

  // ========================= GET ONE COUPON =========================
  @Get(':couponId')
  @ApiOperation({ summary: 'Get coupon by ID', description: 'Retrieve a single coupon by its ID' })
  @ApiParam({ name: 'couponId', required: true, example: '63f8c3f9e13a9a23cdd12345' })
  @ApiResponse({ status: 200, description: 'Coupon retrieved', type: CouponResponse })
  async findOne(@Param() params: UpdateParamsCouponDto): Promise<IResponse<CouponResponse>> {
    const coupon = await this.couponService.findOne(params.couponId);
    return successResponse<CouponResponse>({ data: { coupon } });
  }

  // ========================= GET ONE ARCHIVED COUPON =========================
  @Get(':couponId/archive')
  @ApiOperation({ summary: 'Get archived coupon by ID', description: 'Retrieve a single soft-deleted coupon by its ID' })
  @ApiParam({ name: 'couponId', required: true, example: '63f8c3f9e13a9a23cdd12345' })
  @ApiResponse({ status: 200, description: 'Archived coupon retrieved', type: CouponResponse })
  async findOneArchive(@Param() params: UpdateParamsCouponDto): Promise<IResponse<CouponResponse>> {
    const coupon = await this.couponService.findOne(params.couponId, true);
    return successResponse<CouponResponse>({ data: { coupon } });
  }
}
