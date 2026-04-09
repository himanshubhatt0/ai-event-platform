import {
  Body,
  Controller,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { EventService } from './event.service';
import { CreateEventDto } from './dto/create-event.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { OrgGuard } from '../auth/org.guard';

@ApiTags('Event')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('event')
export class EventController {
  constructor(private eventService: EventService) {}

  @ApiOperation({ summary: 'Create an event for the authenticated organization' })
  @ApiBody({ type: CreateEventDto })
  @ApiCreatedResponse({ description: 'Event created successfully.' })
  @ApiBadRequestResponse({ description: 'Validation failed for request body.' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token.' })
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
