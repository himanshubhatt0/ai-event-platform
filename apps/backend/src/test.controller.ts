import { Controller, Get } from '@nestjs/common';

@Controller()
export class TestController {
  @Get()
  getHome() {
    return { message: 'Backend is working 🚀' };
  }
}
