import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';
import { OrganizationService } from './organization.service';
import { CreateOrgDto } from './dto/create-org.dto';

@Controller('organization')
export class OrganizationController {
  constructor(private orgService: OrganizationService) {}

  @Post()
  create(@Body() body: CreateOrgDto) {
    return this.orgService.createOrg(body);
  }

  @Post(':orgId/user/:userId')
  assignUser(
    @Param('orgId', new ParseUUIDPipe()) orgId: string,
    @Param('userId', new ParseUUIDPipe()) userId: string,
  ) {
    return this.orgService.assignUser(orgId, userId);
  }

  @Get(':orgId/users')
  getUsers(@Param('orgId', new ParseUUIDPipe()) orgId: string) {
    return this.orgService.getOrgUsers(orgId);
  }
}
