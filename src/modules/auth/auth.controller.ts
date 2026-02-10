import {
    Controller,
    Post,
    Body,
    ValidationPipe,
    UsePipes,
    HttpCode,
    HttpStatus,
  } from '@nestjs/common';
  import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
  
  import { authServices } from './auth.services';
  import type { userDocument } from 'src/DB';
  import { authLoginDTO, authSignupDTO, confirmEmailDTO, resendEmailDTO, resetPasswordDTO } from './dto/auth.signup.dto';
  import { successResponse } from 'src/common/utils/response';
  import { IResponse } from 'src/common/interface/response.interface';
  import { LoginResponse } from './auth.entity';
  
  @ApiTags('Authentication')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  @Controller('auth')
  export class authController {
    constructor(private readonly authServices: authServices) {}
  
    // ========================= SIGNUP =========================
    @Post('signup')
    @ApiOperation({ summary: 'User signup', description: 'Register a new user' })
    @ApiBody({ type: authSignupDTO })
    @ApiResponse({ status: 201, description: 'User signed up successfully' })
    async signup(
      @Body() body: authSignupDTO,
    ): Promise<{ Message: string; data: { user: userDocument } }> {
      const user = await this.authServices.signup(body);
      return { Message: 'Done', data: { user } };
    }
  
    // ========================= RESEND EMAIL OTP =========================
    @Post('resend_email_otp')
    @ApiOperation({ summary: 'Resend email OTP', description: 'Resend verification OTP to user email' })
    @ApiBody({ type: resendEmailDTO })
    @ApiResponse({ status: 200, description: 'OTP sent successfully' })
    async resendEmailOtp(@Body() body: resendEmailDTO): Promise<IResponse> {
      await this.authServices.resendEmail(body);
      return successResponse();
    }
  
    // ========================= CONFIRM EMAIL =========================
    @Post('confirm_email')
    @ApiOperation({ summary: 'Confirm email', description: 'Confirm user email with OTP' })
    @ApiBody({ type: confirmEmailDTO })
    @ApiResponse({ status: 200, description: 'Email confirmed successfully' })
    async confirmEmail(@Body() body: confirmEmailDTO): Promise<IResponse> {
      await this.authServices.confirmEmail(body);
      return successResponse();
    }
    

  
    // ========================= FORGOT PASSWORD =========================
    @Post('forgot-password')
    @ApiOperation({ summary: 'Forgot password', description: 'Send OTP for password reset' })
    @ApiBody({ type: resendEmailDTO })
    @ApiResponse({ status: 200, description: 'OTP sent for password reset' })
    async sendForgotPassword(@Body() body: resendEmailDTO): Promise<IResponse> {
      await this.authServices.sendForgotPassword(body);
      return successResponse();
    }
  
    // ========================= VERIFY FORGOT PASSWORD =========================
    @Post('verify-password')
    @ApiOperation({ summary: 'Verify password OTP', description: 'Verify OTP before resetting password' })
    @ApiBody({ type: confirmEmailDTO })
    @ApiResponse({ status: 200, description: 'OTP verified successfully' })
    async verifyForgotPassword(@Body() body: confirmEmailDTO): Promise<IResponse> {
      await this.authServices.verifyForgotPassword(body);
      return successResponse();
    }
  
    // ========================= RESET PASSWORD =========================
    @Post('reset-password')
    @ApiOperation({ summary: 'Reset password', description: 'Reset password after OTP verification' })
    @ApiBody({ type: resetPasswordDTO })
    @ApiResponse({ status: 200, description: 'Password reset successfully' })
    async resetForgotPassword(@Body() body: resetPasswordDTO): Promise<IResponse> {
      await this.authServices.resetForgotPassword(body);
      return successResponse();
    }
  
    // ========================= LOGIN =========================
    @HttpCode(HttpStatus.OK)
    @Post('login')
    @ApiOperation({ summary: 'User login', description: 'Authenticate user and return credentials' })
    @ApiBody({ type: authLoginDTO })
    @ApiResponse({ status: 200, description: 'User logged in successfully', type: LoginResponse })
    async login(@Body() body: authLoginDTO): Promise<IResponse<LoginResponse>> {
      const credentials = await this.authServices.login(body);
      return successResponse<LoginResponse>({ data: { credentials } });
    }
  }
  
