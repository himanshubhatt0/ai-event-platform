import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Request,
  UseGuards,
} from '@nestjs/common';
import { OrganizationService } from './organization.service';
import { CreateOrgDto } from './dto/create-org.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AuthService } from '../auth/auth.service';
import { ORGANIZATION_CONSTANTS } from './organization.constants';

@UseGuards(JwtAuthGuard)
@Controller('organization')
export class OrganizationController {
  constructor(
    private orgService: OrganizationService,
    private authService: AuthService,
  ) {}

  @Post('mine')
  async createMine(@Body() body: CreateOrgDto, @Request() req) {
    const result = await this.orgService.createOrgForUser(req.user.id, body);
    const accessToken = this.authService.createAccessToken(
      result.user.id,
      result.user.organizationId,
    );

    return {
      access_token: accessToken,
      user: {
        id: result.user.id,
        email: result.user.email,
        name: result.user.name,
        organizationId: result.user.organizationId,
      },
      organization: result.organization,
      message: ORGANIZATION_CONSTANTS.SUCCESS.ORGANIZATION_CREATED,
    };
  }

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
