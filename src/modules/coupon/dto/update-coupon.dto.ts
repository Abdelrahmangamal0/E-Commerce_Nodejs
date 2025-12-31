import { PartialType } from '@nestjs/mapped-types';
import { CreateCouponDto } from './create-coupon.dto';
import { Types } from 'mongoose';
import { IsMongoId } from 'class-validator';
import { containField } from 'src/common';

@containField()
export class UpdateCouponDto extends PartialType(CreateCouponDto) {}

export class UpdateParamsCouponDto {
   @IsMongoId()
    couponId: Types.ObjectId
}
