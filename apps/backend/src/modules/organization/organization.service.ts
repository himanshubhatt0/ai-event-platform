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

  async createOrg(data: CreateOrgDto): Promise<Organization> {
    if (!data?.name || data.name.trim() === '') {
      throw new BadRequestException(ORGANIZATION_CONSTANTS.ERRORS.NAME_REQUIRED);
    }

    const normalizedName = data.name.trim();

    const existingOrganization = await this.prisma.organization.findFirst({
      where: { name: normalizedName },
    });

    if (existingOrganization) {
      throw new BadRequestException(
        ORGANIZATION_CONSTANTS.ERRORS.ORGANIZATION_NAME_ALREADY_EXISTS,
      );
    }

    try {
      return await this.prisma.organization.create({
        data: {
          name: normalizedName,
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

  async getAllOrganizations(): Promise<Organization[]> {
    try {
      return await this.prisma.organization.findMany({
        include: {
          users: true,
          events: true,
          products: true,
        },
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

  async updateOrg(orgId: string, data: Partial<CreateOrgDto>): Promise<Organization> {
    if (!orgId?.trim()) {
      throw new BadRequestException(ORGANIZATION_CONSTANTS.ERRORS.INVALID_ORG_ID);
    }

    try {
      const existingOrg = await this.prisma.organization.findUnique({
        where: { id: orgId.trim() },
      });

      if (!existingOrg) {
        throw new NotFoundException(
          ORGANIZATION_CONSTANTS.ERRORS.ORGANIZATION_NOT_FOUND,
        );
      }

      if (data.name && data.name.trim() !== existingOrg.name) {
        const nameExists = await this.prisma.organization.findFirst({
          where: { name: data.name.trim() },
        });

        if (nameExists) {
          throw new BadRequestException(
            ORGANIZATION_CONSTANTS.ERRORS.ORGANIZATION_NAME_ALREADY_EXISTS,
          );
        }
      }

      return await this.prisma.organization.update({
        where: { id: orgId.trim() },
        data: {
          name: data.name?.trim() || existingOrg.name,
        },
      });
    } catch (error: unknown) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new InternalServerErrorException(
        ORGANIZATION_CONSTANTS.ERRORS.CREATE_ORGANIZATION_FAILED,
      );
    }
  }

  async deleteOrg(orgId: string): Promise<Organization> {
    if (!orgId?.trim()) {
      throw new BadRequestException(ORGANIZATION_CONSTANTS.ERRORS.INVALID_ORG_ID);
    }

    try {
      const existingOrg = await this.prisma.organization.findUnique({
        where: { id: orgId.trim() },
      });

      if (!existingOrg) {
        throw new NotFoundException(
          ORGANIZATION_CONSTANTS.ERRORS.ORGANIZATION_NOT_FOUND,
        );
      }

      return await this.prisma.organization.delete({
        where: { id: orgId.trim() },
      });
    } catch (error: unknown) {
      if (error instanceof HttpException) {
        throw error;
      }

      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new NotFoundException(
          ORGANIZATION_CONSTANTS.ERRORS.ORGANIZATION_NOT_FOUND,
        );
      }

      throw new InternalServerErrorException(
        ORGANIZATION_CONSTANTS.ERRORS.CREATE_ORGANIZATION_FAILED,
      );
    }
  }

  async removeUserFromOrg(userId: string): Promise<User> {
    if (!userId?.trim()) {
      throw new BadRequestException(ORGANIZATION_CONSTANTS.ERRORS.INVALID_USER_ID);
    }

    try {
      return await this.prisma.user.update({
        where: { id: userId.trim() },
        data: {
          organizationId: null,
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

  private handlePrismaError(error: Prisma.PrismaClientKnownRequestError, fallbackMessage: string): never {
    if (error.code === 'P2002') {
      throw new BadRequestException(
        ORGANIZATION_CONSTANTS.ERRORS.ORGANIZATION_NAME_ALREADY_EXISTS,
      );
    }

    throw new InternalServerErrorException(fallbackMessage);
  }
}
