import { IsOptional, IsString, Length, validate } from "class-validator"
import { Types } from "mongoose"
import { IBrand, ICategory, isMongoDBIds, MongoDBIds } from "src/common"

export class CreateCategoryDto implements Partial<ICategory> {

    @IsString()
        @Length(2,26, {message:'the user minLength is 2 and maxLength is 26 '})          
        name: string
        
        @Length(2,50000, {message:'the user minLength is 2 and maxLength is 50000 '})          
        @IsString()
        @IsOptional()
        description: string
        
        @isMongoDBIds()
        @IsOptional()
        brands?: Types.ObjectId[]
        
    
}
