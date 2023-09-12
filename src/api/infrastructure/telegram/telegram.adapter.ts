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
  async setWebhook(url: string) {
    await this.axiosInstance.post(`setWebhook`, {
      url: url,
    });
  }
  async sendMessage(text: string, recipientId: number) {
    await this.axiosInstance.post(`sendMessage`, {
      chat_id: recipientId,
      text: text,
    });
  }
}

// type TelegramMessage = {
//   message: {
//     from: {
//       first_name: string;
//       last_name: string;
//     };
//     text: string;
//   };
// };
