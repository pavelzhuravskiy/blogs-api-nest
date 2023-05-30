import { IsBoolean } from 'class-validator';

export class SABlogBanInputDto {
  @IsBoolean()
  isBanned: boolean;
}
