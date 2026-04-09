import { Body, Controller, Post, Request, UseGuards } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { InteractionService } from './interaction.service';
import { CreateInteractionDto } from './dto/create-interaction.dto';

@ApiTags('Interaction')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('interaction')
export class InteractionController {
  constructor(private service: InteractionService) {}

  @ApiOperation({ summary: 'Create an interaction for event or product' })
  @ApiBody({ type: CreateInteractionDto })
  @ApiOkResponse({ description: 'Interaction recorded successfully.' })
  @ApiBadRequestResponse({ description: 'Validation failed for request body.' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token.' })
  @Post()
  interact(@Body() body: CreateInteractionDto, @Request() req: any) {
    return this.service.interact(req.user.id, body);
  }
}
