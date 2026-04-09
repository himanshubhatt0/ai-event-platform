import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { FeedService } from './feed.service';

@ApiTags('Feed')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('feed')
export class FeedController {
  constructor(private feedService: FeedService) {}

  @ApiOperation({ summary: 'Get personalized feed for authenticated user' })
  @ApiOkResponse({ description: 'Feed returned successfully.' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token.' })
  @Get()
  getFeed(@Request() req: any) {
    return this.feedService.getFeed(req.user.id);
  }
}
