import { Module } from '@nestjs/common';
import { BrandService } from './brand.service';
import { BrandController } from './brand.controller';
import { BrandModel, BrandRepository } from 'src/DB';
import { S3Service, SharedAuthModule, TokenService } from 'src/common';

@Module({
  imports:[BrandModel , SharedAuthModule],
  controllers: [BrandController],
  providers: [BrandService, BrandRepository , S3Service ],
})
export class BrandModule {}
