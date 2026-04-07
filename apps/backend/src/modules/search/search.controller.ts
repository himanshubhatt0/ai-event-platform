import { Controller, Get, Query } from '@nestjs/common';
import { SearchService } from './search.service';

@Controller('search')
export class SearchController {
  constructor(private service: SearchService) {}

  @Get()
  search(@Query('q') q: string) {
    return this.service.search(q);
  }
}
