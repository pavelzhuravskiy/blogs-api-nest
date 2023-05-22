import { Prop, Schema } from '@nestjs/mongoose';
import { LikesUsersSchema } from './likes-users.schema';

@Schema()
export class LikesInfoSchema {
  @Prop({ required: true })
  likesCount: number;

  @Prop({ required: true })
  dislikesCount: number;

  @Prop({ default: [] })
  users: [LikesUsersSchema];
}
