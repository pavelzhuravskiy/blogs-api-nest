import { Prop, Schema } from '@nestjs/mongoose';

@Schema()
export class BlogInfoSchema {
  @Prop({ required: true })
  blogId: string;

  @Prop({ required: true })
  blogName: string;

  @Prop({ required: true })
  blogIsBanned: boolean;

  @Prop({ type: String || null })
  blogOwnerId: string | null;

  @Prop({ type: String || null })
  blogOwnerLogin: string | null;

  @Prop({ required: true })
  blogOwnerIsBanned: boolean;
}
