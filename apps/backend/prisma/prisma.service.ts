import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

let prisma: PrismaClient;

function getPrismaClient() {
  if (!prisma) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error('DATABASE_URL is not defined. Make sure the backend .env file is loaded and contains a valid DATABASE_URL.');
    }

    const safeUrl = connectionString.replace(/:\/\/([^:]+):[^@]+@/, '://$1:***@');
    console.log('Prisma connecting with DATABASE_URL:', safeUrl);

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
    try {
      console.log('PrismaService initializing database connection...');
      await getPrismaClient().$connect();
      console.log('PrismaService connected successfully');
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error('PrismaService failed to connect:', message);
      throw error;
    }
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