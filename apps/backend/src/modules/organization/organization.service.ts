import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class OrganizationService {
  constructor(private prisma: PrismaService) {}

  async createOrg(data: any) {
    return this.prisma.organization.create({
      data: {
        name: data.name,
      },
    });
  }

  async assignUser(orgId: string, userId: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        organizationId: orgId,
      },
    });
  }

  async getOrgUsers(orgId: string) {
    return this.prisma.organization.findUnique({
      where: { id: orgId },
      include: {
        users: true,
      },
    });
  }
}
