import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { BlogViewModel } from '../schemas/blog.view';

@Injectable()
export class BlogTransformInterceptor<T>
  implements NestInterceptor<T, BlogViewModel>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<BlogViewModel> {
    return next.handle().pipe(
      map((blog) => {
        return {
          id: blog.id,
          name: blog.name,
          description: blog.description,
          websiteUrl: blog.websiteUrl,
          createdAt: blog.createdAt,
          isMembership: blog.isMembership,
        };
      }),
    );
  }
}
