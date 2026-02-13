import { Module } from '@nestjs/common';
import { BrandService } from './brand.service';
import { BrandController } from './brand.controller';
import { BrandModel, BrandRepository } from 'src/DB';
import { S3Service, SharedAuthModule, TokenService } from 'src/common';
import { S3Client } from '@aws-sdk/client-s3';

@Module({
  imports:[BrandModel , SharedAuthModule],
  controllers: [BrandController],
  providers: [BrandService, BrandRepository , S3Service , S3Client ],
})
export class BrandModule {}
