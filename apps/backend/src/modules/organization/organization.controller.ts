import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
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

  @Get(':orgId')
  getOrganization(@Param('orgId', new ParseUUIDPipe()) orgId: string) {
    return this.orgService.getOrganization(orgId);
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
