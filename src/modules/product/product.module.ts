import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { S3Service, SharedAuthModule } from 'src/common';
import { BrandModel, BrandRepository, CategoryModel, CategoryRepository, ProductModel, ProductRepository } from 'src/DB';

@Module({
  imports:[SharedAuthModule , ProductModel , BrandModel , CategoryModel],
  controllers: [ProductController ],
  providers: [
    ProductService,
    BrandRepository,
    S3Service,
    ProductRepository,
    CategoryRepository,
   
  ],
})
export class ProductModule {}
