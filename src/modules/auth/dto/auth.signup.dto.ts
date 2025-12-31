import { IsEmail, IsString, IsStrongPassword, Length, ValidateIf} from "class-validator"
import { isMatch } from "src/common"


export class resendEmailDTO {
    @IsEmail()    
    email:string
    
    
}
export class confirmEmailDTO extends resendEmailDTO {
    @IsString()  
    otp: string
    
    
}

export class authLoginDTO extends resendEmailDTO {
    @IsStrongPassword()
    password:string
   
}
export class authSignupDTO extends authLoginDTO {
    @IsString()   
    @Length(2,52, {message:'the userName minLength is 2 and maxLength is 52 '})     
    userName: string
   
    @ValidateIf((data: authSignupDTO) => {
        return Boolean(data.password)
    })
    @isMatch<string>(['password'])
    confirmPassword:string
}


export class resetPasswordDTO extends confirmEmailDTO{
    @IsStrongPassword()    
    password:string
    @isMatch<string>(['password'])
    confirmPassword:string
    
}
