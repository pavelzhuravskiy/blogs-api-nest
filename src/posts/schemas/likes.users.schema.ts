import { Prop, Schema } from '@nestjs/mongoose';

@Schema()
class UsersLikesSchema {
  @Prop({ required: true })
  addedAt: Date;

  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  userLogin: string;

  @Prop({ required: true })
  likeStatus: string;
}

@Schema()
export class UsersLikesInfo {
  @Prop([UsersLikesSchema])
  users: UsersLikesSchema[];
}
