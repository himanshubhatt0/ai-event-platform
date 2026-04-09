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
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { OrganizationService } from './organization.service';
import { CreateOrgDto } from './dto/create-org.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AuthService } from '../auth/auth.service';
import { ORGANIZATION_CONSTANTS } from './organization.constants';

@ApiTags('Organization')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('organization')
export class OrganizationController {
  constructor(
    private orgService: OrganizationService,
    private authService: AuthService,
  ) {}

  @ApiOperation({ summary: 'Create organization for current user and refresh auth token' })
  @ApiBody({ type: CreateOrgDto })
  @ApiOkResponse({ description: 'Organization created and new access token returned.' })
  @ApiBadRequestResponse({ description: 'Validation failed for request body.' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token.' })
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

  @ApiOperation({ summary: 'Get organization by id' })
  @ApiParam({ name: 'orgId', description: 'Organization UUID', format: 'uuid' })
  @ApiOkResponse({ description: 'Organization found successfully.' })
  @ApiBadRequestResponse({ description: 'Invalid organization id format.' })
  @Get(':orgId')
  getOrganization(@Param('orgId', new ParseUUIDPipe()) orgId: string) {
    return this.orgService.getOrganization(orgId);
  }

  @ApiOperation({ summary: 'Get all events for organization by id' })
  @ApiParam({ name: 'orgId', description: 'Organization UUID', format: 'uuid' })
  @ApiOkResponse({ description: 'Organization events fetched successfully.' })
  @ApiBadRequestResponse({ description: 'Invalid organization id format.' })
  @Get(':orgId/events')
  getEvents(@Param('orgId', new ParseUUIDPipe()) orgId: string) {
    return this.orgService.getOrgEvents(orgId);
  }

  @ApiOperation({ summary: 'Get all products for organization by id' })
  @ApiParam({ name: 'orgId', description: 'Organization UUID', format: 'uuid' })
  @ApiOkResponse({ description: 'Organization products fetched successfully.' })
  @ApiBadRequestResponse({ description: 'Invalid organization id format.' })
  @Get(':orgId/products')
  getProducts(@Param('orgId', new ParseUUIDPipe()) orgId: string) {
    return this.orgService.getOrgProducts(orgId);
  }
}
