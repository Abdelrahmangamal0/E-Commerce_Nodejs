import { Module } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CategoryController } from './category.controller';
import { BrandModel, BrandRepository, CategoryModel } from 'src/DB';
import { S3Service, SharedAuthModule } from 'src/common';
import { CategoryRepository } from 'src/DB/repository/category.repository';

@Module({
  imports:[BrandModel ,CategoryModel , SharedAuthModule],
  controllers: [CategoryController],
  providers: [CategoryService , BrandRepository,CategoryRepository , S3Service],
  exports:[]
})
export class CategoryModule {}
