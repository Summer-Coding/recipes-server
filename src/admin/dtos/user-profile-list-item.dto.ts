import { Role } from '@prisma/client';

export class UserProfileListItemDto {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  roles: Role[];
  isActive: boolean;
}
