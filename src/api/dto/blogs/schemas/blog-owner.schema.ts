import { Prop, Schema } from '@nestjs/mongoose';

@Schema()
export class BlogOwnerSchema {
  @Prop({ type: String || null })
  userId: string | null;

  @Prop({ type: String || null })
  userLogin: string | null;

  @Prop({ required: true })
  isBanned: boolean;
}
