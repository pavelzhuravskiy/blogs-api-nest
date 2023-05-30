import { Prop, Schema } from '@nestjs/mongoose';

@Schema()
export class BlogBannedUsersInfoSchema {
  @Prop({ required: true })
  isBanned: boolean;

  @Prop({ required: true })
  banDate: Date;

  @Prop({ required: true })
  banReason: string;
}
