  import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
  import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { log } from 'console';
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
         console.log(role);
         
          break;
       
        case 'ws':
          role = context.switchToWs().getClient().credentials?.user?.role ?? roleEnum.User
       
          break;
       
        case 'graphql':
          role = GqlExecutionContext.create(context).getContext().req.credentials?.user?.role ?? roleEnum.User
          break;
      
        default:
         console.log('default');
         
          break;
      }
     console.log(accessRole,accessRole.includes(role));
     
      return accessRole.includes(role);
    }
  }
  