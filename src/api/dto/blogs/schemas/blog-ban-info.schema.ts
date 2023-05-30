import { Prop, Schema } from '@nestjs/mongoose';

@Schema()
export class BlogBanInfoSchema {
  @Prop({ required: true })
  isBanned: boolean;

  @Prop({ type: Date || null })
  banDate: Date | null;
}
