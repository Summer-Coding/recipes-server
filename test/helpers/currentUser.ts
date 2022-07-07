import { UserDto } from '../../src/auth/dtos';

export const currentUser: UserDto = {
  id: 'id',
  email: 'test@test.com',
  app_metadata: {},
  user_metadata: {
    roles: ['user', 'admin'],
  },
  aud: 'aud',
  created_at: 'createdAt',
};
