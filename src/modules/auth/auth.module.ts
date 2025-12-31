import { Module } from "@nestjs/common";
import { authServices } from "./auth.services";
import { authController } from "./auth.controller";
import {otpModel } from "src/DB";
import { OtpRepository } from "src/DB/repository/otp.repository";
import { SharedAuthModule } from "src/common/services/modules/auth.module";
import { JwtService } from "@nestjs/jwt";


@Module({
    imports: [SharedAuthModule,otpModel],
    providers: [authServices , OtpRepository , JwtService],
    controllers:[authController],
    exports: []
})

export class authModule{}
