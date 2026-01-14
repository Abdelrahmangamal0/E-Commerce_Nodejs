import { IsNotEmpty, IsString, IsStrongPassword } from "class-validator"
import { isMatch } from "src/common"

export class UpdateUserDto{
   
    @IsString()
    @IsNotEmpty()
    oldPassword: string
    @IsStrongPassword()
    @IsString()
    @IsNotEmpty()
    newPassword: string
    @isMatch(['newPassword'])
    confirmPassword: string
}