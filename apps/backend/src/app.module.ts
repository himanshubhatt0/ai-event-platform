import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TestController } from './test.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  controllers: [TestController],
})
export class AppModule {}
