import { Module } from '@nestjs/common';
import { CouponService } from './coupon.service';
import { CouponController } from './coupon.controller';
import { S3Service, SharedAuthModule } from 'src/common';
import {  CouponModel, CouponRepository, NotificationModel, NotificationRepository } from 'src/DB';
// import { RealTimeModule } from '../gateway/gateway.module';
import { RealTimeGateway } from '../gateway/gateway';
import { S3Client } from '@aws-sdk/client-s3';

@Module({
  imports: [CouponModel , SharedAuthModule  , NotificationModel],
  controllers: [CouponController],
  providers: [CouponService , CouponRepository , S3Service , S3Client, RealTimeGateway , NotificationRepository] ,
})
export class CouponModule {}
