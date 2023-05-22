import { Prop, Schema } from '@nestjs/mongoose';

@Schema()
export class UserPasswordSchema {
  @Prop({ type: String || null })
  recoveryCode: string | null;

  @Prop({ type: Date || null })
  expirationDate: Date | null;
}
