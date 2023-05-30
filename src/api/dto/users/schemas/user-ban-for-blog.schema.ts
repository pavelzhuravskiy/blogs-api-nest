import { Prop, Schema } from '@nestjs/mongoose';

@Schema()
export class UserBanForBlogSchema {
  @Prop({ required: true })
  isBanned: boolean;

  @Prop({ required: true })
  banDate: Date;

  @Prop({ required: true })
  banReason: string;

  @Prop({ required: true })
  blogId: string;
}
