import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';
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
  getAll(@Query('organizationId') organizationId?: string) {
    if (organizationId) {
      return this.eventService.getEventsByOrganization(organizationId);
    }
    return this.eventService.getEvents();
  }

  @Get(':eventId')
  getById(@Param('eventId', new ParseUUIDPipe()) eventId: string) {
    return this.eventService.getEventById(eventId);
  }

  @Put(':eventId')
  update(
    @Param('eventId', new ParseUUIDPipe()) eventId: string,
    @Body() body: Partial<CreateEventDto>,
  ) {
    return this.eventService.updateEvent(eventId, body);
  }
}
