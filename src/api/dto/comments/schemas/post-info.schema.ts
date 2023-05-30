import { Prop, Schema } from '@nestjs/mongoose';

@Schema()
export class PostInfoSchema {
  @Prop({ required: true })
  id: string;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  blogId: string;

  @Prop({ required: true })
  blogName: string;

  @Prop({ required: true })
  blogOwnerId: string;
}
