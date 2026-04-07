import { Body, Controller, Get, Post } from '@nestjs/common';
import { EventService } from './event.service';
import { CreateEventDto } from './dto/create-event.dto';

@Controller('event')
export class EventController {
  constructor(private eventService: EventService) {}

  @Post()
  create(@Body() body: CreateEventDto) {
    return this.eventService.createEvent(body);
  }

  @Get()
  getAll() {
    return this.eventService.getEvents();
  }
}
