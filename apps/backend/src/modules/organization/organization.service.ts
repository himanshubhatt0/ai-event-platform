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

@Injectable()
export class OrganizationService {
  constructor(private prisma: PrismaService) {}

  async createOrg(data: CreateOrgDto): Promise<Organization> {
    if (!data?.name || data.name.trim() === '') {
      throw new BadRequestException(ORGANIZATION_CONSTANTS.ERRORS.NAME_REQUIRED);
    }

    try {
      return await this.prisma.organization.create({
        data: {
          name: data.name.trim(),
        },
      });
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

  async assignUser(orgId: string, userId: string): Promise<User> {
    if (!orgId?.trim()) {
      throw new BadRequestException(ORGANIZATION_CONSTANTS.ERRORS.INVALID_ORG_ID);
    }

    if (!userId?.trim()) {
      throw new BadRequestException(ORGANIZATION_CONSTANTS.ERRORS.INVALID_USER_ID);
    }

    try {
      return await this.prisma.user.update({
        where: { id: userId },
        data: {
          organizationId: orgId.trim(),
        },
      });
    } catch (error: unknown) {
      if (error instanceof HttpException) {
        throw error;
      }

      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new NotFoundException(ORGANIZATION_CONSTANTS.ERRORS.USER_NOT_FOUND);
      }

      throw new InternalServerErrorException(
        ORGANIZATION_CONSTANTS.ERRORS.ASSIGN_USER_FAILED,
      );
    }
  }

  async getOrgUsers(
    orgId: string,
  ): Promise<Prisma.OrganizationGetPayload<{ include: { users: true } }>> {
    if (!orgId?.trim()) {
      throw new BadRequestException(ORGANIZATION_CONSTANTS.ERRORS.INVALID_ORG_ID);
    }

    try {
      const organization = await this.prisma.organization.findUnique({
        where: { id: orgId.trim() },
        include: {
          users: true,
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

  private handlePrismaError(
    error: Prisma.PrismaClientKnownRequestError,
    fallbackMessage: string,
  ): never {
    if (error.code === 'P2002') {
      throw new BadRequestException(fallbackMessage);
    }

    throw new InternalServerErrorException(fallbackMessage);
  }
}
