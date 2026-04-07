import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TestController } from './test.controller';
import { AuthModule } from './modules/auth/auth.module';
import { OrganizationModule } from './modules/organization/organization.module';
import { EventModule } from './modules/event/event.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule,
    OrganizationModule,
    EventModule,
  ],
  controllers: [TestController],
})
export class AppModule {}
