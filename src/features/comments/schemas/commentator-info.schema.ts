import { Prop, Schema } from '@nestjs/mongoose';

@Schema()
export class CommentatorInfoSchema {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  userLogin: string;

  @Prop({ required: true })
  isBanned: boolean;
}
