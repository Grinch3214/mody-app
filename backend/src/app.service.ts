import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): { message: string; timestamp: number; testMessage: string } {
    return {
      message: 'Hello World!',
      timestamp: Date.now(),
      testMessage: 'test',
    };
  }
}
