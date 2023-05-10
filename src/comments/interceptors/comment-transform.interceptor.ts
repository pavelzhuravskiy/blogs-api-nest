import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { CommentViewModel } from '../schemas/comment.view';

@Injectable()
export class CommentTransformInterceptor<T>
  implements NestInterceptor<T, CommentViewModel>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<CommentViewModel> {
    return next.handle().pipe(
      map((comment) => {
        return {
          id: comment.id,
          content: comment.content,
          commentatorInfo: {
            userId: comment.commentatorInfo.userId,
            userLogin: comment.commentatorInfo.userLogin,
          },
          createdAt: comment.createdAt.toISOString(),
          likesInfo: {
            likesCount: comment.extendedLikesInfo.likesCount,
            dislikesCount: comment.extendedLikesInfo.dislikesCount,
            myStatus: 'None',
          },
        };
      }),
    );
  }
}
