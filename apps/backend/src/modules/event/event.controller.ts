import {
  Body,
  Controller,
  Post,
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
}
