import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): { message: string; timestamp: number } {
    return {
      message: 'Hello World!',
      timestamp: Date.now(),
    };
  }
}
