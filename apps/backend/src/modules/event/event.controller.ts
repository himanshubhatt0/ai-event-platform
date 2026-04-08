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
  Request,
  UseGuards,
} from '@nestjs/common';
import { EventService } from './event.service';
import { CreateEventDto } from './dto/create-event.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { OrgGuard } from '../auth/org.guard';

@UseGuards(JwtAuthGuard)
@Controller('event')
export class EventController {
  constructor(private eventService: EventService) {}

  @Post()
  @UseGuards(OrgGuard)
  create(@Request() req, @Body() body: CreateEventDto) {
    // organizationId always comes from JWT — body value is ignored
    return this.eventService.createEvent({
      ...body,
      organizationId: req.user.organizationId,
    });
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
  @UseGuards(OrgGuard)
  update(
    @Request() req,
    @Param('eventId', new ParseUUIDPipe()) eventId: string,
    @Body() body: Partial<CreateEventDto>,
  ) {
    return this.eventService.updateEvent(eventId, body, req.user.organizationId);
  }

  @Delete(':eventId')
  @UseGuards(OrgGuard)
  delete(
    @Request() req,
    @Param('eventId', new ParseUUIDPipe()) eventId: string,
  ) {
    return this.eventService.deleteEvent(eventId, req.user.organizationId);
  }
}
