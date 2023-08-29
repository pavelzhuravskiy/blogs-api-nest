class BlogImageViewDto {
  url: string;
  width: number;
  height: number;
  fileSize: number;
}

export class BlogImagesViewDto {
  wallpaper: BlogImageViewDto;
  main: BlogImageViewDto[];
}
