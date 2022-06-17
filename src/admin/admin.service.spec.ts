import { Test, TestingModule } from '@nestjs/testing';
import { ApiError, SupabaseClient, User } from '@supabase/supabase-js';
import { AdminService } from './admin.service';
import { MockSupabaseClient } from '../../test/helpers';
import { PrismaClient, Role } from '@prisma/client';
import { UserDto } from 'src/auth/dtos';
import { SetAdminDto, UserProfileListItemDto } from './dtos';
import { prismaMock } from '../../test/helpers/singleton';

type UserProfileType = {
  userId: string;
  user: {
    roles: {
      role: Role;
    }[];
    email: string;
  };
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  isActive: boolean;
  profileImageSrc: string | null;
};

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
  id: 'userId',
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

      jest
        .spyOn(supabase.auth.api, 'getUserById')
        .mockResolvedValue(userResponse);
    });

    it('should call listUsers if roles includes admin', async () => {
      jest.spyOn(supabase.auth.api, 'listUsers').mockImplementation();

      try {
        await service.getAllUserIds();
      } catch {}

      expect(supabase.auth.api.listUsers).toBeCalled();
    });

    it('should throw error if error is returned', async () => {
      const listUsersResponse: SupabaseGetUsersResult = {
        error: { ...defaultError },
        data: null,
      };

      jest
        .spyOn(supabase.auth.api, 'listUsers')
        .mockImplementation(async () => listUsersResponse);

      try {
        await service.getAllUserIds();
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
        .spyOn(supabase.auth.api, 'listUsers')
        .mockImplementation(async () => listUsersResponse);

      const actual = await service.getAllUserIds();
      expect(actual).toMatchObject([defaultUser.id]);
    });
  });

  describe('getAllProfiles', () => {
    let users: UserDto[];
    let profile: UserProfileType;

    beforeEach(() => {
      users = [defaultUser];
      profile = {
        id: 'profileId',
        firstName: 'firstName',
        lastName: 'lastName',
        username: 'username',
        isActive: true,
        userId: defaultUser.id,
        profileImageSrc: null,
        user: {
          email: defaultUser.email as string,
          roles: [
            {
              role: Role.USER,
            },
          ],
        },
      };
    });

    it('should call findMany', async () => {
      prismaMock.profile.findMany.mockResolvedValue([profile]);
      await service.getAllProfiles([defaultUser.id]);

      expect(prismaMock.profile.findMany).toBeCalledWith({
        where: {
          userId: {
            in: [defaultUser.id],
          },
        },
        orderBy: {
          username: 'desc',
        },
        select: {
          id: true,
          userId: true,
          firstName: true,
          lastName: true,
          username: true,
          isActive: true,
          user: {
            select: {
              email: true,
              roles: {
                select: {
                  role: true,
                },
              },
            },
          },
        },
      });
    });

    it('should return data from result and from users', async () => {
      const userProfiles: UserProfileListItemDto = {
        id: 'profileId',
        userId: defaultUser.id,
        firstName: profile.firstName,
        lastName: profile.lastName,
        username: profile.username,
        isActive: profile.isActive,
        email: defaultUser.email as string,
        roles: [Role.USER],
      };

      prismaMock.profile.findMany.mockResolvedValue([profile]);
      const actual = await service.getAllProfiles([defaultUser.id]);
      expect(actual[0]).toMatchObject(userProfiles);
    });
  });

  describe('setUserToAdmin', () => {
    let authDto: SetAdminDto;

    beforeEach(() => {
      authDto = {
        id: 'newAdminId',
      };

      jest.spyOn(supabase.auth.api, 'updateUserById').mockImplementation();
      prismaMock.userRole.create.mockImplementation();
    });

    it('should call updateUserById', async () => {
      await service.setUserToAdmin(authDto);

      expect(supabase.auth.api.updateUserById).toBeCalledWith(authDto.id, {
        user_metadata: {
          roles: ['user', 'admin'],
        },
      });
    });

    it('should call create', async () => {
      await service.setUserToAdmin(authDto);

      expect(prismaMock.userRole.create).toBeCalledWith({
        data: {
          userId: authDto.id,
          role: Role.ADMIN,
        },
      });
    });
  });
});
