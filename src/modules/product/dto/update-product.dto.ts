import { PartialType } from '@nestjs/mapped-types';
import { CreateProductDto } from './create-product.dto';
import { Types } from 'mongoose';
import { IsArray, IsMongoId, IsOptional } from 'class-validator';
import { containField } from 'src/common';

@containField()
export class UpdateProductDto extends PartialType(CreateProductDto) {}
export class UpdateProductAttachmentDto {
    @IsArray()
    @IsOptional()
    removedAttachments: string[]
}


export class UpdateParamsProductDto {    
    @IsMongoId()
    productId: Types.ObjectId 
}
