import { Controller, Get, Query, Request, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SearchService } from './search.service';

@ApiTags('Search')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('search')
export class SearchController {
  constructor(private service: SearchService) {}

  @ApiOperation({ summary: 'Search content for authenticated user' })
  @ApiQuery({ name: 'q', description: 'Search query text', required: true, example: 'ai summit' })
  @ApiOkResponse({ description: 'Search results returned successfully.' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token.' })
  @Get()
  search(@Query('q') q: string, @Request() req: any) {
    return this.service.search(q, req.user.id);
  }
}
