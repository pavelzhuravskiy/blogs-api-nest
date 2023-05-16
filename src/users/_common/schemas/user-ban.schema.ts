import { Prop, Schema } from '@nestjs/mongoose';

@Schema()
export class UserBanSchema {
  @Prop()
  isBanned: boolean;

  @Prop({ type: Date || null })
  banDate: Date | null;

  @Prop({ type: String || null })
  banReason: string | null;
}
