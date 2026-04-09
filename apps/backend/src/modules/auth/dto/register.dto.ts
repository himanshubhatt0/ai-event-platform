import { IsEmail, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'john@example.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'StrongP@ssw0rd' })
  @IsString()
  password!: string;

  @ApiProperty({ example: 'John Doe' })
  @IsString()
  name!: string;
}
