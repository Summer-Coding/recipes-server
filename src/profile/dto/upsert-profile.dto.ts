import { IsNotEmpty } from 'class-validator';

export class UpsertProfileDto {
  @IsNotEmpty()
  username: string;

  @IsNotEmpty()
  firstName: string;

  @IsNotEmpty()
  lastName: string;

  profileImgSrc: string;
}
