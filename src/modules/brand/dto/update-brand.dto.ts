import { PartialType } from '@nestjs/mapped-types';
import { CreateBrandDto } from './create-brand.dto';
import { Types } from 'mongoose';
import { Allow, IsMongoId } from 'class-validator';
import { containField } from 'src/common';

@containField()
export class UpdateBrandDto extends PartialType(CreateBrandDto) { 
    
}

export class BrandParamsDto {
    @IsMongoId()
    brandId: Types.ObjectId
}
