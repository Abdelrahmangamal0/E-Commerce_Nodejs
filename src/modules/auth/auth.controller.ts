import { Controller, Post ,Body, ValidationPipe, Patch, HttpCode, HttpStatus, UseGuards, UsePipes } from "@nestjs/common";
import { authServices } from "./auth.services";
import type { userDocument } from "src/DB";
import { authLoginDTO, authSignupDTO, confirmEmailDTO, resendEmailDTO, resetPasswordDTO } from "./dto/auth.signup.dto";
import { AuthenticationGuard } from "src/common/Guard/authentication/authentication.guard";
import { successResponse } from "src/common/utils/response";
import { IResponse } from "src/common/interface/response.interface";
import { LoginResponse } from "./auth.entity";

@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true })) 
@Controller('auth')
export class authController{
    constructor(private readonly authServices:authServices) { }
    @Post('signup')  
    async signup(@Body() body: authSignupDTO):Promise< { Message: string , data:{user:userDocument}}>{
        console.log(body);
        
     const user =  await this.authServices.signup(body)
        return {Message:'Done' , data:{user} }
    }
   
   
    @Post('resend_email_otp')
    async resendEmailOtp(@Body() body: resendEmailDTO): Promise<IResponse> {
        console.log(body);
        
        await this.authServices.resendEmail(body)
        return successResponse()
    }
      
    
    @Patch('confirm_email')
        async confirmEmail(@Body() body: confirmEmailDTO):Promise< IResponse>{
            
           await this.authServices.confirmEmail(body)
            return successResponse()
        }
   
 
 
        @Post('forgot-password')
        async sendForgotPassword(@Body() body: resendEmailDTO): Promise<IResponse> {
            console.log(body);
            
            await this.authServices.sendForgotPassword(body)
            return successResponse()
        }
       
        @Post('verify-password')
        async verifyForgotPassword(@Body() body: confirmEmailDTO): Promise<IResponse> {
            console.log(body);
            
            await this.authServices.verifyForgotPassword(body)
            return successResponse()
        }
       
        @Post('reset-password')
        async resetForgotPassword(@Body() body: resetPasswordDTO): Promise<IResponse> {
            console.log(body);
            
            await this.authServices.resetForgotPassword(body)
            return successResponse()
        }
       
 
 
 
 
    @HttpCode(HttpStatus.OK)
    @Post('login')  
   async login(@Body() body: authLoginDTO): Promise<IResponse<LoginResponse>>{
      const credentials =  await this.authServices.login(body)
        return successResponse<LoginResponse>({data:{credentials}})
    }
    
}