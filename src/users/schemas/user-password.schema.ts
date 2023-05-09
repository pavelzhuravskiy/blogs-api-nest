import { Prop, Schema } from '@nestjs/mongoose';

@Schema()
export class UserPasswordSchema {
  @Prop({ type: String || null })
  recoveryCode: string | null;

  @Prop({ type: String || null })
  expirationDate: Date | null;
}
