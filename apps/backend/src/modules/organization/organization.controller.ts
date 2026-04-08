import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
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

  @Get()
  getAll() {
    return this.orgService.getAllOrganizations();
  }

  @Get(':orgId')
  getOrganization(@Param('orgId', new ParseUUIDPipe()) orgId: string) {
    return this.orgService.getOrganization(orgId);
  }

  @Put(':orgId')
  update(
    @Param('orgId', new ParseUUIDPipe()) orgId: string,
    @Body() body: Partial<CreateOrgDto>,
  ) {
    return this.orgService.updateOrg(orgId, body);
  }

  @Delete(':orgId')
  delete(@Param('orgId', new ParseUUIDPipe()) orgId: string) {
    return this.orgService.deleteOrg(orgId);
  }

  @Post(':orgId/user/:userId')
  assignUser(
    @Param('orgId', new ParseUUIDPipe()) orgId: string,
    @Param('userId', new ParseUUIDPipe()) userId: string,
  ) {
    return this.orgService.assignUser(orgId, userId);
  }

  @Delete(':orgId/user/:userId')
  removeUser(@Param('userId', new ParseUUIDPipe()) userId: string) {
    return this.orgService.removeUserFromOrg(userId);
  }

  @Get(':orgId/users')
  getUsers(@Param('orgId', new ParseUUIDPipe()) orgId: string) {
    return this.orgService.getOrgUsers(orgId);
  }

  @Get(':orgId/events')
  getEvents(@Param('orgId', new ParseUUIDPipe()) orgId: string) {
    return this.orgService.getOrgEvents(orgId);
  }

  @Get(':orgId/products')
  getProducts(@Param('orgId', new ParseUUIDPipe()) orgId: string) {
    return this.orgService.getOrgProducts(orgId);
  }
}
