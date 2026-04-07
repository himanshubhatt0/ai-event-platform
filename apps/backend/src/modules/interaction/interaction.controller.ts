import { Body, Controller, Post } from '@nestjs/common';
import { InteractionService } from './interaction.service';
import { CreateInteractionDto } from './dto/create-interaction.dto';

@Controller('interaction')
export class InteractionController {
  constructor(private service: InteractionService) {}

  @Post()
  interact(@Body() body: CreateInteractionDto) {
    return this.service.interact(body);
  }
}
