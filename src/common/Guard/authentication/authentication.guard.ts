import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { tokenName } from 'src/common/decorator';
import { tokenEnum } from 'src/common/enums';
import { TokenService } from 'src/common/services/token/token.service';
import { TokenRepository } from 'src/DB';
import { getSocketAuth } from 'src/modules/gateway/socket';

@Injectable()
export class AuthenticationGuard implements CanActivate {
  constructor(
    private readonly tokenService: TokenService,
    private readonly reflector: Reflector,
    private readonly tokenRepository: TokenRepository
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const token_type: tokenEnum = this.reflector.getAllAndOverride<tokenEnum>(
      tokenName,
      [context.getHandler()]
    ) ?? tokenEnum.access_token;

    let req: any;
    let authorization = '';
    switch (context.getType<string>()) {
      case 'http':
        const httpCtx = context.switchToHttp();
        req = httpCtx.getRequest();
        authorization = req.headers?.authorization || '';
        break;
      case 'ws':
        const ws_context = context.switchToWs()
        req = ws_context.getClient()
        authorization = req.handshake.headers.authorization;
        break; 
      
      case 'graphql':
      
        req = GqlExecutionContext.create(context).getContext().req
        authorization = req.headers.authorization
        
        break;
      
      default:
        break;
    }

    if (!authorization) {
      throw new UnauthorizedException('No token provided');
}
    const { user, decoded } = await this.tokenService.decodeToken(authorization, token_type);
    
    const revoked = await this.tokenRepository.findOne({ filter: { jti: decoded.jti } });
    if (revoked) throw new UnauthorizedException('Token revoked');

    req.credentials = { user, decoded };
    return true
    
   
  }
}
