import { Type } from "class-transformer"
import { IsMongoId, IsNumber, IsOptional, IsPositive, IsString, Length } from "class-validator"
import { Types } from "mongoose"
import { IProduct } from "src/common"

export class CreateProductDto implements Partial<IProduct> {
    
    @IsString()
    @Length(2,2000, {message:'the user minLength is 2 and maxLength is 2000 '})          
    name: string
    
    @Length(2,50000, {message:'the user minLength is 2 and maxLength is 50000 '})          
    @IsString()
    @IsOptional()
    description: string
   
    @IsMongoId()
    brand: Types.ObjectId
    
    @IsMongoId()
    category: Types.ObjectId

    @Type(()=>Number)
    @IsPositive()
    @IsNumber()
    @IsOptional()
    discountPercent: number 
    
    @Type(() => Number)
    @IsPositive()
    @IsNumber()
    originalPrice: number 
    
    @Type(()=>Number)
    @IsPositive()
    @IsNumber()
    stock: number 

}
