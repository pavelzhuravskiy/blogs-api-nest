import { Injectable } from '@nestjs/common';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import * as process from 'process';

@Injectable()
export class S3Adapter {
  s3Client: S3Client;
  constructor() {
    this.s3Client = new S3Client({
      region: 'eu-north-1',
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY_ID,
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
      },
    });
  }
  async uploadBlogMainImage(key: string, buffer: Buffer, mimetype: string) {
    const command = new PutObjectCommand({
      Bucket: 'blogs-api',
      Key: key,
      Body: buffer,
      ContentType: mimetype,
    });

    try {
      console.log(`SENT TO AMAZON S3!`);
      // const response = await this.s3Client.send(command);
      // console.log(response);
    } catch (err) {
      console.error(err);
    }
  }
}
