import { Prop, Schema } from '@nestjs/mongoose';

@Schema()
export class UserEmailSchema {
  @Prop()
  confirmationCode: string;

  @Prop()
  expirationDate: Date;

  @Prop({ required: true })
  isConfirmed: boolean;
}
