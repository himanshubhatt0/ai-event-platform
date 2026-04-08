import { Body, Controller, Post, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { InteractionService } from './interaction.service';
import { CreateInteractionDto } from './dto/create-interaction.dto';

@UseGuards(JwtAuthGuard)
@Controller('interaction')
export class InteractionController {
  constructor(private service: InteractionService) {}

  @Post()
  interact(@Body() body: CreateInteractionDto, @Request() req: any) {
    return this.service.interact(req.user.id, body);
  }
}
