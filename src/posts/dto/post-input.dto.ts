import { IsNotEmpty, IsOptional, MaxLength } from 'class-validator';

export class PostInputDto {
  @IsNotEmpty()
  @MaxLength(30)
  title: string;

  @IsNotEmpty()
  @MaxLength(100)
  shortDescription: string;

  @IsNotEmpty()
  @MaxLength(1000)
  content: string;

  @IsOptional()
  blogId: string;
}
