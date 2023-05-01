import { Prop, Schema } from '@nestjs/mongoose';

@Schema()
export class UserPasswordSchema {
  @Prop()
  recoveryCode: string;

  @Prop()
  expirationDate: Date;
}
