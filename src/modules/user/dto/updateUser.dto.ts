import { IsMongoId, IsNotEmpty, IsString, IsStrongPassword } from "class-validator"
import { Types } from "mongoose"
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

export class UpdateParamsUserDto {
   @IsMongoId()
    notificationId: Types.ObjectId
}