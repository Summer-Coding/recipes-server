import { Test, TestingModule } from '@nestjs/testing';
import { ApiError, SupabaseClient, User } from '@supabase/supabase-js';
import { AdminService } from './admin.service';
import { MockSupabaseClient } from '../../test/helpers';
import { PrismaClient, Profile } from '@prisma/client';
import { UserDto } from 'src/auth/dtos';
import { UserProfileListItemDto } from './dtos';
import { prismaMock } from '../../test/helpers/singleton';

type SupabaseGetUserResult =
  | { data: User; error: null }
  | { data: null; error: ApiError };

type SupabaseGetUsersResult =
  | { data: User[]; error: null }
  | { data: null; error: ApiError };

const defaultError: ApiError = {
  status: 401,
  message: 'unauthorized',
};

const defaultUser: User = {
  id: 'id',
  email: 'test@test.com',
  app_metadata: {},
  user_metadata: {
    roles: ['user', 'admin'],
  },
  aud: 'aud',
  created_at: 'createdAt',
};

describe('AdminService', () => {
  let service: AdminService;
  let supabase: SupabaseClient;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminService,
        {
          provide: PrismaClient,
          useValue: prismaMock,
        },
        {
          provide: SupabaseClient,
          useValue: new MockSupabaseClient('test', 'test'),
        },
      ],
    }).compile();

    service = module.get<AdminService>(AdminService);
    supabase = module.get<SupabaseClient>(SupabaseClient);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAllUsers', () => {
    let userResponse: SupabaseGetUserResult;

    beforeEach(() => {
      userResponse = {
        error: null,
        data: { ...defaultUser },
      };
    });

    it('should call listUsers if roles includes admin', async () => {
      jest
        .spyOn(supabase.auth.api, 'getUserById')
        .mockImplementation(async () => userResponse);

      jest.spyOn(supabase.auth.api, 'listUsers');

      try {
        await service.getAllUsers();
      } catch {}

      expect(supabase.auth.api.listUsers).toBeCalled();
    });

    it('should throw error if error is returned', async () => {
      const listUsersResponse: SupabaseGetUsersResult = {
        error: { ...defaultError },
        data: null,
      };

      jest
        .spyOn(supabase.auth.api, 'getUserById')
        .mockImplementation(async () => userResponse);

      jest
        .spyOn(supabase.auth.api, 'listUsers')
        .mockImplementation(async () => listUsersResponse);

      try {
        await service.getAllUsers();
      } catch (error) {
        expect(error).toMatchObject(new Error('could not get users'));
      }
    });

    it('should return data from result', async () => {
      const listUsersResponse: SupabaseGetUsersResult = {
        error: null,
        data: [{ ...defaultUser }],
      };

      jest
        .spyOn(supabase.auth.api, 'getUserById')
        .mockImplementation(async () => userResponse);

      jest
        .spyOn(supabase.auth.api, 'listUsers')
        .mockImplementation(async () => listUsersResponse);

      const actual = await service.getAllUsers();
      expect(actual).toMatchObject([defaultUser]);
    });
  });

  describe('getAllProfiles', () => {
    let users: UserDto[];
    let profile: Profile;

    beforeEach(() => {
      users = [defaultUser];
      profile = {
        id: 'id',
        firstName: 'firstName',
        lastName: 'lastName',
        username: 'username',
        isActive: true,
        profileImageSrc: '',
        userId: defaultUser.id,
      };
    });

    it('should call findMany', async () => {
      prismaMock.profile.findMany.mockResolvedValue([profile]);
      await service.getAllProfiles([defaultUser]);

      expect(prismaMock.profile.findMany).toBeCalledWith({
        where: {
          userId: {
            in: users.map((x) => x.id),
          },
        },
        select: {
          firstName: true,
          lastName: true,
          username: true,
          userId: true,
          isActive: true,
        },
      });
    });

    it('should return data from result and from users', async () => {
      const userProfiles: UserProfileListItemDto = {
        id: defaultUser.id,
        firstName: profile.firstName as string,
        lastName: profile.lastName as string,
        username: profile.username,
        isActive: profile.isActive,
        email: defaultUser.email as string,
        roles: defaultUser.user_metadata.roles,
      };

      prismaMock.profile.findMany.mockResolvedValue([profile]);
      const actual = await service.getAllProfiles([defaultUser]);
      expect(actual[0]).toMatchObject(userProfiles);
    });
  });

  describe('setUserToAdmin', () => {
    it('should call updateUserById', async () => {
      const authDto = {
        id: 'newAdminId',
      };
      jest.spyOn(supabase.auth.api, 'updateUserById');

      await service.setUserToAdmin(authDto);
      expect(supabase.auth.api.updateUserById).toBeCalledWith(authDto.id, {
        user_metadata: {
          roles: ['user', 'admin'],
        },
      });
    });
  });
});
