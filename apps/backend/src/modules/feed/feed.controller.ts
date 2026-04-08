import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { FeedService } from './feed.service';

@UseGuards(JwtAuthGuard)
@Controller('feed')
export class FeedController {
  constructor(private feedService: FeedService) {}

  @Get()
  getFeed(@Request() req: any) {
    return this.feedService.getFeed(req.user.id);
  }
}
