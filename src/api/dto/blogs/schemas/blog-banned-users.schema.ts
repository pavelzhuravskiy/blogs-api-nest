import { Prop, Schema } from '@nestjs/mongoose';
import { BlogBannedUsersInfoSchema } from './blog-banned-users-info.schema';

@Schema()
export class BlogBannedUsersSchema {
  @Prop({ required: true })
  id: string;

  @Prop({ required: true })
  login: string;

  @Prop({ required: true })
  banInfo: BlogBannedUsersInfoSchema;
}
