import { PartialType } from '@nestjs/mapped-types';
import { IsNotEmpty } from 'class-validator';
import { AuthDto } from './auth.dto';

export class PasswordAuthDto extends PartialType(AuthDto) {
  @IsNotEmpty()
  password: string;
}
