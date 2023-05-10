import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { PostViewModel } from '../schemas/post.view';

@Injectable()
export class PostTransformInterceptor<T>
  implements NestInterceptor<T, PostViewModel>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<PostViewModel> {
    return next.handle().pipe(
      map((post) => {
        return {
          id: post.id,
          title: post.title,
          shortDescription: post.shortDescription,
          content: post.content,
          blogId: post.blogId,
          blogName: post.blogName,
          createdAt: post.createdAt.toISOString(),
          extendedLikesInfo: {
            likesCount: post.extendedLikesInfo.likesCount,
            dislikesCount: post.extendedLikesInfo.dislikesCount,
            myStatus: 'None',
            newestLikes: [],
          },
        };
      }),
    );
  }
}
