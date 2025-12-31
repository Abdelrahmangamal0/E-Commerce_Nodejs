
import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import {userDocument } from 'src/DB';
import {UserRepository } from 'src/DB/repository/user.repository';
import { SignatureService } from './signature.token';
import { v4 as uuid } from 'uuid';
import { tokenEnum } from 'src/common/enums';
import { TokenRepository } from 'src/DB/repository/token.repository';
import { JwtPayload } from 'jsonwebtoken';

@Injectable()
export class TokenService {
  constructor(
    
    private readonly userRepository: UserRepository,
    private readonly tokenRepository: TokenRepository,
    private readonly signatureService: SignatureService,
    private readonly jwtService: JwtService
  ) { }

  async generateToken(
    {
      payload,
      secret,
      options
    }:
      {
        payload: Object,
        secret: string,
        options?: JwtSignOptions
      }
  ): Promise<string> {
    
    return await this.jwtService.signAsync(payload, {
      secret,
      ...options
    })
  }

  async createLoginCredentials(user: userDocument): Promise<{ access_token: string, refresh_token: string }> {
    
    const signatureLevel = await this.signatureService.detectSignatureLevel(user.role)
    
    const signatures = await this.signatureService.getSignature(signatureLevel)
    const jwtid = uuid()
    const access_token = await this.generateToken({
      payload: { _id: user._id },
      secret: signatures.access as string,
      options: {
        expiresIn: Number(process.env.ACCESS_TOKEN_EXPIRES_IN),
        jwtid
      }
    })
    const refresh_token = await this.generateToken({
      payload: { _id: user._id },
      secret: signatures.refresh as string,
      options: {
        expiresIn: Number(process.env.REFRESH_TOKEN_EXPIRES_IN),
        jwtid
      }
    })

    return { access_token, refresh_token }
  }


  async verifyToken(token: string, secret: string) {
    try {
     
     
      return await this.jwtService.verifyAsync(token, { secret })
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token');
    }
    
  }

  async decodeToken(authorization: string, token_type: tokenEnum = tokenEnum.access_token) {
    
    const [signature, token] = authorization.split(' ') || ''
    
    if (!signature || !token) {
      throw new UnauthorizedException('Missing token parts');
    }
    
    const signatures =  this.signatureService.getSignature(signature)

    
    const decoded = await this.verifyToken(token, (token_type === tokenEnum.refresh_token ? signatures.refresh : signatures.access) as string)

    if (!decoded?._id || !decoded?.iat) {
      throw new BadRequestException('Invalid token payload');
    }

    const user = await this.userRepository.findOne({ filter: { _id: decoded._id } })
    console.log(user);
    
    if (!user) {
      throw new UnauthorizedException('Account not found');
    }
   console.log(user?.changeCredentialsTime?.getTime() || 0);
   console.log(decoded.iat * 1000)
    console.log((user?.changeCredentialsTime?.getTime() || 0) > decoded.iat * 1000);
    
    if ((user?.changeCredentialsTime?.getTime() || 0) > decoded.iat * 1000) {
      
      throw new UnauthorizedException('Old login credential');
    }

    return { user, decoded }
  }
    
  async revokeToken(decoded: JwtPayload) {
   
    const expires =
      (decoded.iat as number) + Number(process.env.REFRESH_TOKEN_EXPIRES_IN);

    const result = await this.tokenRepository.create({
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
