  import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
  import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
  import { roleName } from 'src/common/decorator/role.decorator';
  import { roleEnum } from 'src/common/enums';
  
  @Injectable()
  export class AuthorizationGuard implements CanActivate {
    constructor(private readonly reflector: Reflector) {}
  
    async canActivate(context: ExecutionContext): Promise<boolean> {
      const accessRole: roleEnum[] = this.reflector.getAllAndOverride<roleEnum[]>(
        roleName,
        [context.getHandler()]
      ) ?? [];
  
      let role: roleEnum = roleEnum.User;
  
      switch (context.getType<string>()) {
        case 'http':
          const httpCtx = context.switchToHttp();
          role = httpCtx.getRequest()?.credentials?.user?.role ?? roleEnum.User;
          break;
          case 'ws':
                role = context.switchToWs().getClient().credentials?.user?.role ?? roleEnum.User
          case 'graphql':
                role = GqlExecutionContext.create(context).getContext().req.credentials?.user?.role ?? roleEnum.User
        default:
          break;
      }
  
      return accessRole.includes(role);
    }
  }
  