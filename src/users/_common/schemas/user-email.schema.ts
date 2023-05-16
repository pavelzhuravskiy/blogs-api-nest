import { Prop, Schema } from '@nestjs/mongoose';

@Schema()
export class UserEmailSchema {
  @Prop({ type: String || null })
  confirmationCode: string | null;

  @Prop({ type: Date || null })
  expirationDate: Date | null;

  @Prop({ required: true })
  isConfirmed: boolean;
}
