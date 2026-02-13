import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { S3Service, SharedAuthModule } from 'src/common';
import { BrandModel, BrandRepository, CategoryModel, CategoryRepository, ProductModel, ProductRepository } from 'src/DB';
import { S3Client } from '@aws-sdk/client-s3';

@Module({
  imports:[SharedAuthModule , ProductModel , BrandModel , CategoryModel],
  controllers: [ProductController ],
  providers: [
    ProductService,
    BrandRepository,
    S3Service,
    ProductRepository,
    CategoryRepository,
    S3Client
   
  ],
})
export class ProductModule {}
