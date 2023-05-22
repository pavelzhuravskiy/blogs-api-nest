import { IsBoolean, MinLength } from 'class-validator';

export class UserBanInputDto {
  @IsBoolean()
  isBanned: boolean;

  @MinLength(20)
  banReason: string;
}
