import { PartialType } from '@nestjs/mapped-types';
import { CreateCategoryDto } from './create-category.dto';
import { IsMongoId, IsOptional } from 'class-validator';
import { Types } from 'mongoose';
import { containField, isMongoDBIds } from 'src/common';

@containField()
export class UpdateCategoryDto extends PartialType(CreateCategoryDto) {
   
    @isMongoDBIds()
    @IsOptional()
    removeBrands?:Types.ObjectId[]
}

export class CategoryParamsDto {
    @IsMongoId()
    categoryId: Types.ObjectId
}
