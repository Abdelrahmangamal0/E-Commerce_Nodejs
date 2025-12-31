import { Type } from "class-transformer";
import { IsDateString, IsEnum, IsNumber, IsOptional, IsPositive, Length } from "class-validator";
import { Types } from "mongoose";
import { CouponEnum, isMongoDBIds, IUser } from "src/common";
import { CouponDocument } from "src/DB";

export class CreateCouponDto implements Partial<CouponDocument> {
   
    @Length(2,26, {message:'the name minLength is 2 and maxLength is 26 '})          
    name: string
    
    @Type(()=>Number)
    @IsPositive()
    @IsNumber()   
    discount: number
    
    // @isMongoDBIds()
    // usedBy: Types.ObjectId[]
    
    @Type(()=>Number)
    @IsPositive()
    @IsNumber()
    @IsOptional()
    duration?: number
   
    @IsEnum(CouponEnum)
    type?: CouponEnum
    
    @IsDateString()
    startDate: Date
   
    @IsDateString()
    endDate:Date
}
