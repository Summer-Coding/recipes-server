import { IsNotEmpty } from 'class-validator';

export class SetAdminRequest {
  @IsNotEmpty()
  id: string;
}
