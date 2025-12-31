import { Module } from '@nestjs/common';
import { CouponService } from './coupon.service';
import { CouponController } from './coupon.controller';
import { S3Service, SharedAuthModule } from 'src/common';
import { BrandModel, BrandRepository, CategoryModel, CouponModel, CouponRepository } from 'src/DB';

@Module({
  imports: [CouponModel , SharedAuthModule],
  controllers: [CouponController],
  providers: [CouponService , CouponRepository , S3Service] ,
})
export class CouponModule {}
