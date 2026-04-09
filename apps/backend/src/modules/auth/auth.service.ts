import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  HttpException,
} from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AUTH_CONSTANTS } from './auth.constants';
import { Prisma } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(data: RegisterDto) {
    try {
      // Validate email format
      if (!data.email || !this.isValidEmail(data.email)) {
        throw new BadRequestException(
          AUTH_CONSTANTS.ERRORS.INVALID_EMAIL_FORMAT,
        );
      }

      // Check if email already exists
      const existingUser = await this.prisma.user.findUnique({
        where: { email: data.email },
      });

      if (existingUser) {
        throw new BadRequestException(
          AUTH_CONSTANTS.ERRORS.EMAIL_ALREADY_EXISTS,
        );
      }

      // Validate password
      if (
        !data.password ||
        data.password.length < AUTH_CONSTANTS.VALIDATION.PASSWORD_MIN_LENGTH
      ) {
        throw new BadRequestException(AUTH_CONSTANTS.ERRORS.PASSWORD_TOO_SHORT);
      }

      // Validate name
      if (!data.name || data.name.trim() === '') {
        throw new BadRequestException(AUTH_CONSTANTS.ERRORS.NAME_REQUIRED);
      }

      const hashedPassword = await bcrypt.hash(data.password, 10);

      const user = await this.prisma.user.create({
        data: {
          email: data.email,
          password: hashedPassword,
          name: data.name,
        },
      });

      return {
        message: AUTH_CONSTANTS.SUCCESS.REGISTRATION_SUCCESSFUL,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
      };
    } catch (error: unknown) {
      // If already a NestJS exception → rethrow
      if (error instanceof HttpException) {
        throw error;
      }

      // Prisma error handling
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new BadRequestException(
            AUTH_CONSTANTS.ERRORS.EMAIL_ALREADY_EXISTS,
          );
        }
      }

      // fallback
      throw new BadRequestException(AUTH_CONSTANTS.ERRORS.REGISTER_FAILED);
    }
  }

  async login(data: LoginDto) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { email: data.email },
      });

      if (!user) {
        throw new UnauthorizedException(
          AUTH_CONSTANTS.ERRORS.INVALID_CREDENTIALS,
        );
      }

      const isMatch = await bcrypt.compare(data.password, user.password);

      if (!isMatch) {
        throw new UnauthorizedException(
          AUTH_CONSTANTS.ERRORS.INVALID_CREDENTIALS,
        );
      }

      const token = this.createAccessToken(user.id, user.organizationId);

      return {
        access_token: token,
        message: AUTH_CONSTANTS.SUCCESS.LOGIN_SUCCESSFUL,
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new BadRequestException(error.message);
      }

      throw new BadRequestException(AUTH_CONSTANTS.ERRORS.LOGIN_FAILED);
    }
  }

  createAccessToken(userId: string, organizationId?: string | null): string {
    return this.jwtService.sign({
      userId,
      organizationId: organizationId ?? null,
    });
  }

  private isValidEmail(email: string): boolean {
    return AUTH_CONSTANTS.VALIDATION.EMAIL_REGEX.test(email);
  }
}
