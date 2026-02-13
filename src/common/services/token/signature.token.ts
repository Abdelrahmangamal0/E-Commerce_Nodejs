import { roleEnum, SignatureLevel } from 'src/common/enums';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config'; // تعليق: استخدام ConfigService لإدارة مفاتيح التوقيع من مكان واحد

@Injectable() // تعليق: جعل خدمة التوقيع قابلة للحقن في TokenService بسهولة
export class SignatureService {
  constructor(private readonly configService: ConfigService) {}

  detectSignatureLevel(role: roleEnum) {
    switch (role) {
      case roleEnum.Admin:
      case roleEnum.superAdmin:
        return SignatureLevel.System;

      default:
        return SignatureLevel.Bearer;
    }
  }

  getSignature(Level: string) {
    if (Level === SignatureLevel.System) {
      return {
        access: this.configService.get<string>(
          'ACCESS_SYSTEM_TOKEN_SIGNATURE',
        ) as string, // تعليق: استخدام مفاتيح التوقيع الخاصة بحساب النظام من env
        refresh: this.configService.get<string>(
          'REFRESH_SYSTEM_TOKEN_SIGNATURE',
        ) as string,
      };
    }

    return {
      access: this.configService.get<string>('ACCESS_USER_TOKEN_SIGNATURE'), // تعليق: مفاتيح توقيع توكنات المستخدمين العاديين
      refresh: this.configService.get<string>('REFRESH_USER_TOKEN_SIGNATURE'),
    };
  }
}