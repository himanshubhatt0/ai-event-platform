import { Body, Controller, Post, Get, UseGuards, Request } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './jwt-auth.guard';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @ApiOperation({ summary: 'Register a new user account' })
  @ApiBody({ type: RegisterDto })
  @ApiOkResponse({ description: 'User registered successfully with access token.' })
  @Post('register')
  register(@Body() body: RegisterDto) {
    return this.authService.register(body);
  }

  @ApiOperation({ summary: 'Login with email and password' })
  @ApiBody({ type: LoginDto })
  @ApiOkResponse({ description: 'User authenticated successfully with access token.' })
  @ApiUnauthorizedResponse({ description: 'Invalid credentials.' })
  @Post('login')
  login(@Body() body: LoginDto) {
    return this.authService.login(body);
  }

  @ApiOperation({ summary: 'Get current authenticated user profile' })
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Authenticated user profile.' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token.' })
  @UseGuards(JwtAuthGuard)
  @Get('me')
  getProfile(@Request() req) {
    return req.user;
  }
}
