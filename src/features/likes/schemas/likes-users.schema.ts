import { Prop, Schema } from '@nestjs/mongoose';

@Schema()
export class UsersLikesSchema {
  @Prop({ required: true })
  addedAt: Date;

  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  userLogin: string;

  @Prop({ required: true })
  likeStatus: string;
}
