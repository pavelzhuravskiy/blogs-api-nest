import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { UserViewModel } from '../schemas/user.view';

@Injectable()
export class UserTransformInterceptor<T>
  implements NestInterceptor<T, UserViewModel>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<UserViewModel> {
    return next.handle().pipe(
      map((user) => {
        return {
          id: user.id,
          login: user.accountData.login,
          email: user.accountData.email,
          createdAt: user.accountData.createdAt.toISOString(),
        };
      }),
    );
  }
}
