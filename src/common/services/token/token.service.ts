import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { userDocument } from 'src/DB';
import { UserRepository } from 'src/DB/repository/user.repository';
import { SignatureService } from './signature.token';
import { v4 as uuid } from 'uuid';
import { tokenEnum } from 'src/common/enums';
import { TokenRepository } from 'src/DB/repository/token.repository';
import { JwtPayload } from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config'; // تعليق: استخدام ConfigService لقراءة أزمنة انتهاء التوكن من الإعدادات

@Injectable()
export class TokenService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly tokenRepository: TokenRepository,
    private readonly signatureService: SignatureService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService, // تعليق: حقن ConfigService بدلاً من الاعتماد المباشر على process.env
  ) {}

  async generateToken({
    payload,
    secret,
    options,
  }: {
    payload: object;
    secret: string;
    options?: JwtSignOptions;
  }): Promise<string> {
    return await this.jwtService.signAsync(payload, {
      secret,
      ...options,
    });
  }

  async createLoginCredentials(
    user: userDocument,
  ): Promise<{ access_token: string; refresh_token: string }> {
    const signatureLevel = this.signatureService.detectSignatureLevel(
      user.role,
    );

    const signatures = this.signatureService.getSignature(signatureLevel);
    const jwtid = uuid();

    const accessExpiresIn = Number(
      this.configService.get<string>('ACCESS_TOKEN_EXPIRES_IN'),
    ); // تعليق: قراءة زمن انتهاء access token من env مع تحويله لرقم

    const refreshExpiresIn = Number(
      this.configService.get<string>('REFRESH_TOKEN_EXPIRES_IN'),
    ); // تعليق: قراءة زمن انتهاء refresh token من env مع تحويله لرقم

    const access_token = await this.generateToken({
      payload: { _id: user._id },
      secret: signatures.access as string,
      options: {
        expiresIn: accessExpiresIn,
        jwtid,
      },
    });

    const refresh_token = await this.generateToken({
      payload: { _id: user._id },
      secret: signatures.refresh as string,
      options: {
        expiresIn: refreshExpiresIn,
        jwtid,
      },
    });

    return { access_token, refresh_token };
  }

  async verifyToken(token: string, secret: string): Promise<JwtPayload> {
    // تعليق: تحديد نوع القيمة المعادة لتجنّب إرجاع any من verifyAsync
    try {
      const decoded = await this.jwtService.verifyAsync<JwtPayload>(token, {
        secret,
      });
      return decoded;
    } catch (error) {
      throw new UnauthorizedException(`Invalid or expired token ${error} `);
    }
  }

  async decodeToken(
    authorization: string,
    token_type: tokenEnum = tokenEnum.access_token,
  ) {
    const [signature, token] = authorization.split(' ') || '';

    if (!signature || !token) {
      throw new UnauthorizedException('Missing token parts');
    }

    const signatures = this.signatureService.getSignature(signature);

    const decoded = await this.verifyToken(
      token,
      (token_type === tokenEnum.refresh_token
        ? signatures.refresh
        : signatures.access) as string,
    );

    if (!decoded?._id || !decoded?.iat) {
      throw new BadRequestException('Invalid token payload');
    }

    const user = await this.userRepository.findOne({
      filter: { _id: decoded._id },
    });

    if (!user) {
      throw new UnauthorizedException('Account not found');
    }

    if ((user?.changeCredentialsTime?.getTime() || 0) > decoded.iat * 1000) {
      throw new UnauthorizedException('Old login credential');
    }

    return { user, decoded };
  }

  async revokeToken(decoded: JwtPayload) {
    const refreshExpiresIn = Number(
      this.configService.get<string>('REFRESH_TOKEN_EXPIRES_IN'),
    ); // تعليق: استخدام نفس قيمة انتهاء refresh token لحساب مدة حفظ الـ jti في قاعدة البيانات

    const expires = (decoded.iat as number) + refreshExpiresIn;

    await this.tokenRepository.create({
      Data: [
        {
          jti: decoded.jti,
          expireAt: expires,
          createdBy: decoded._id,
        },
      ],
    });
  }
}
