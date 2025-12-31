import { IsString, Length } from "class-validator"
import { IBrand } from "src/common/interface/brand.interface"

export class CreateBrandDto implements Partial<IBrand> {

    @IsString()
    @Length(2,26, {message:'the user minLength is 2 and maxLength is 26 '})          
    name: string
    
    @IsString()
    @Length(2,26, {message:'the user minLength is 2 and maxLength is 26 '})          
    slogan: string
    

}
