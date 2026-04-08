import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { EventService } from './event.service';
import { CreateEventDto } from './dto/create-event.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
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

  @Delete(':eventId')
  delete(@Param('eventId', new ParseUUIDPipe()) eventId: string) {
    return this.eventService.deleteEvent(eventId);
  }
}
