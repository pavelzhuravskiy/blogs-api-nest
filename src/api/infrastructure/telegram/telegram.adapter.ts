import { Injectable } from '@nestjs/common';
import process from 'process';
import axios, { AxiosInstance } from 'axios';

@Injectable()
export class TelegramAdapter {
  private axiosInstance: AxiosInstance;
  constructor() {
    this.axiosInstance = axios.create({
      baseURL: `https://api.telegram.org/bot${process.env.TELEGRAM_TOKEN}`,
    });
  }
  async setWebhook() {
    await this.axiosInstance.post(`setWebhook`, {
      url: `${process.env.DEPLOYMENT_URL}/api/integrations/telegram/webhook`,
    });
  }
}
