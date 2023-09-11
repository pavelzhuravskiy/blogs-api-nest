import { Injectable } from '@nestjs/common';
import process from 'process';
import { AxiosInstance } from 'axios';
// eslint-disable-next-line @typescript-eslint/no-var-requires
import axios from 'axios';

@Injectable()
export class TelegramAdapter {
  private axiosInstance: AxiosInstance;
  constructor() {
    this.axiosInstance = axios.create({
      baseURL: `https://api.telegram.org/bot${process.env.TELEGRAM_TOKEN}`,
    });
  }
  async setWebhook(url: string) {
    await this.axiosInstance.post(`setWebhook`, {
      url: url,
    });
  }
}
