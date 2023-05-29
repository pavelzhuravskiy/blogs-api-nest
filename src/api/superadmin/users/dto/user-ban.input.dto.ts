import { IsBoolean, MinLength } from 'class-validator';

export class SAUserBanInputDto {
  @IsBoolean()
  isBanned: boolean;

  @MinLength(20)
  banReason: string;
}
