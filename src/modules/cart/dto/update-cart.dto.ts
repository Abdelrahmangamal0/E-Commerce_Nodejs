import { PartialType } from '@nestjs/mapped-types';
import { CreateCartDto } from './create-cart.dto';
import { Types } from 'mongoose';
import { containField, isMongoDBIds } from 'src/common';

@containField()
export class UpdateCartDto extends PartialType(CreateCartDto) {}
export class RemoveItemsFromCartDto {
   
    @isMongoDBIds()
    productIds: Types.ObjectId[]
}


