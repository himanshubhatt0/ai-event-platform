import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TestController } from './test.controller';
import { AuthModule } from './modules/auth/auth.module';
import { OrganizationModule } from './modules/organization/organization.module';
import { EventModule } from './modules/event/event.module';
import { ProductModule } from './modules/product/product.module';
import { FeedModule } from './modules/feed/feed.module';
import { InteractionModule } from './modules/interaction/interaction.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule,
    OrganizationModule,
    EventModule,
    ProductModule,
    FeedModule,
    InteractionModule,
  ],
  controllers: [TestController],
})
export class AppModule {}
