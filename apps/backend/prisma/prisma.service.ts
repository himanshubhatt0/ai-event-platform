import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

let prisma: PrismaClient;

function getPrismaClient() {
  if (!prisma) {
    const connectionString = process.env.DATABASE_URL;
    const pool = new Pool({ connectionString });
    const adapter = new PrismaPg(pool);
    
    prisma = new PrismaClient({ adapter });
  }
  return prisma;
}

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  constructor() {}

  async onModuleInit() {
    await getPrismaClient().$connect();
  }

  async onModuleDestroy() {
    await getPrismaClient().$disconnect();
  }

  get user() {
    return getPrismaClient().user;
  }

  get organization() {
    return getPrismaClient().organization;
  }

  get event() {
    return getPrismaClient().event;
  }

  get product() {
    return getPrismaClient().product;
  }

  get interaction() {
    return getPrismaClient().interaction;
  }

  get $transaction() {
    return getPrismaClient().$transaction;
  }

  get $on() {
    return getPrismaClient().$on;
  }
}