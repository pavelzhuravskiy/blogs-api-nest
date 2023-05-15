import { Prop, Schema } from '@nestjs/mongoose';

@Schema()
export class BlogOwnerSchema {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  userLogin: string;
}
