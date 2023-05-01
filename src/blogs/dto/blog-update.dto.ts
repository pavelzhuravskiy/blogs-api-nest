import { IsString, IsUrl, Length } from 'class-validator';

export class BlogUpdateDto {
  @IsString()
  @Length(1, 15)
  name: string;

  @IsString()
  @Length(1, 500)
  description: string;

  @IsUrl()
  @Length(1, 100)
  websiteUrl: string;
}
