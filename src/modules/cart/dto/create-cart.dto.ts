import { Type } from "class-transformer";
import { IsMongoId, IsNumber, IsPositive, Min } from "class-validator";
import { Types } from "mongoose";
import { ICartProduct } from "src/common";

export class CreateCartDto implements Partial<ICartProduct> {
    @IsMongoId()
    productId: Types.ObjectId

    // @Type(()=>Number)
    @Min(1)
    @IsPositive()
    @IsNumber()
    quantity: number 
}
