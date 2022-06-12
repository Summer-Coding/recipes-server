import { IsNotEmpty } from 'class-validator';

export class SetAdminDto {
  @IsNotEmpty()
  id: string;
}
