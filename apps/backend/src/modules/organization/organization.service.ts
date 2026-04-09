import {
  BadRequestException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, Organization, User } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateOrgDto } from './dto/create-org.dto';
import { ORGANIZATION_CONSTANTS } from './organization.constants';

export interface CreateOrgForUserResult {
  organization: Organization;
  user: User;
}

@Injectable()
export class OrganizationService {
  constructor(private prisma: PrismaService) {}

  async createOrgForUser(userId: string, data: CreateOrgDto): Promise<CreateOrgForUserResult> {
    if (!userId?.trim()) {
      throw new BadRequestException(ORGANIZATION_CONSTANTS.ERRORS.INVALID_USER_ID);
    }

    if (!data?.name || data.name.trim() === '') {
      throw new BadRequestException(ORGANIZATION_CONSTANTS.ERRORS.NAME_REQUIRED);
    }

    const normalizedName = data.name.trim();

    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId.trim() },
      });

      if (!user) {
        throw new NotFoundException(ORGANIZATION_CONSTANTS.ERRORS.USER_NOT_FOUND);
      }

      if (user.organizationId) {
        throw new BadRequestException(
          ORGANIZATION_CONSTANTS.ERRORS.USER_ALREADY_HAS_ORGANIZATION,
        );
      }

      const existingOrganization = await this.prisma.organization.findFirst({
        where: { name: normalizedName },
      });

      if (existingOrganization) {
        throw new BadRequestException(
          ORGANIZATION_CONSTANTS.ERRORS.ORGANIZATION_NAME_ALREADY_EXISTS,
        );
      }

      const { organization, userWithOrg } = await this.prisma.$transaction(async (tx) => {
        const organization = await tx.organization.create({
          data: {
            name: normalizedName,
          },
        });

        const userWithOrg = await tx.user.update({
          where: { id: user.id },
          data: {
            organizationId: organization.id,
          },
        });

        return { organization, userWithOrg };
      });

      return {
        organization,
        user: userWithOrg,
      };
    } catch (error: unknown) {
      if (error instanceof HttpException) {
        throw error;
      }

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        this.handlePrismaError(error, ORGANIZATION_CONSTANTS.ERRORS.CREATE_ORGANIZATION_FAILED);
      }

      throw new InternalServerErrorException(
        ORGANIZATION_CONSTANTS.ERRORS.CREATE_ORGANIZATION_FAILED,
      );
    }
  }

  async getOrganization(orgId: string) {
    if (!orgId?.trim()) {
      throw new BadRequestException(ORGANIZATION_CONSTANTS.ERRORS.INVALID_ORG_ID);
    }

    try {
      const organization = await this.prisma.organization.findUnique({
        where: { id: orgId.trim() },
        include: {
          users: true,
          events: true,
          products: true,
        },
      });

      if (!organization) {
        throw new NotFoundException(
          ORGANIZATION_CONSTANTS.ERRORS.ORGANIZATION_NOT_FOUND,
        );
      }

      return organization;
    } catch (error: unknown) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new InternalServerErrorException(
        ORGANIZATION_CONSTANTS.ERRORS.FETCH_USERS_FAILED,
      );
    }
  }

  async getOrgEvents(orgId: string) {
    if (!orgId?.trim()) {
      throw new BadRequestException(ORGANIZATION_CONSTANTS.ERRORS.INVALID_ORG_ID);
    }

    try {
      const organization = await this.prisma.organization.findUnique({
        where: { id: orgId.trim() },
      });

      if (!organization) {
        throw new NotFoundException(
          ORGANIZATION_CONSTANTS.ERRORS.ORGANIZATION_NOT_FOUND,
        );
      }

      return await this.prisma.event.findMany({
        where: { organizationId: orgId.trim() },
        orderBy: { createdAt: 'desc' },
      });
    } catch (error: unknown) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new InternalServerErrorException(
        ORGANIZATION_CONSTANTS.ERRORS.FETCH_USERS_FAILED,
      );
    }
  }

  async getOrgProducts(orgId: string) {
    if (!orgId?.trim()) {
      throw new BadRequestException(ORGANIZATION_CONSTANTS.ERRORS.INVALID_ORG_ID);
    }

    try {
      const organization = await this.prisma.organization.findUnique({
        where: { id: orgId.trim() },
      });

      if (!organization) {
        throw new NotFoundException(
          ORGANIZATION_CONSTANTS.ERRORS.ORGANIZATION_NOT_FOUND,
        );
      }

      return await this.prisma.product.findMany({
        where: { organizationId: orgId.trim() },
        orderBy: { createdAt: 'desc' },
      });
    } catch (error: unknown) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new InternalServerErrorException(
        ORGANIZATION_CONSTANTS.ERRORS.FETCH_USERS_FAILED,
      );
    }
  }

  private handlePrismaError(error: Prisma.PrismaClientKnownRequestError, fallbackMessage: string): never {
    if (error.code === 'P2002') {
      throw new BadRequestException(
        ORGANIZATION_CONSTANTS.ERRORS.ORGANIZATION_NAME_ALREADY_EXISTS,
      );
    }

    throw new InternalServerErrorException(fallbackMessage);
  }
}
