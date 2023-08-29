import { FileValidator } from '@nestjs/common';
import sharp from 'sharp';

type ImageOptions = {
  width: number; // px
  height: number; // px
  maxSize: number; // bytes
};

export class ImageValidator extends FileValidator<ImageOptions> {
  constructor(
    public width: number, // px
    public height: number, // px
    public maxSize: number, // bytes
  ) {
    super({ width, height, maxSize });
  }
  async isValid(file?: any): Promise<boolean> {
    const image = sharp(file.buffer);
    let metadata;

    try {
      metadata = await image.metadata();
    } catch (e) {
      console.error(e);
      return false;
    }

    return !(
      metadata.width !== this.width ||
      metadata.height !== this.height ||
      metadata.size > this.maxSize ||
      (metadata.format !== 'jpeg' &&
        metadata.format !== 'jpg' &&
        metadata.format !== 'png')
    );
  }
  buildErrorMessage(): string {
    return 'Image width, height, max size or format is incorrect';
  }
}
