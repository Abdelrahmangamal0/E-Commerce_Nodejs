
import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class applyLangInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
     
      context.switchToHttp().getRequest().headers['access-language'] =  'AR'
   
   
      return next
      .handle()
      .pipe(
        tap(() => console.log(`done`)),
      );
  }
}
