import { Prop, Schema } from '@nestjs/mongoose';

@Schema()
export class LikesUsersSchema {
  @Prop({ required: true })
  addedAt: Date;

  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  userLogin: string;

  @Prop({ required: true })
  isBanned: boolean;

  @Prop({ required: true })
  likeStatus: string;
}
