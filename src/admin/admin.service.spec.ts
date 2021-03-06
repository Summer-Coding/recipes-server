import { Test, TestingModule } from '@nestjs/testing';
import { SupabaseClient } from '@supabase/supabase-js';
import { PrismaClient, Profile, Role } from '@prisma/client';
import { DateTime } from 'luxon';
import { AdminService } from './admin.service';
import { UserDto } from '../auth/dtos';
import { SetAdminDto, UserProfileListItemDto } from './dtos';
import { defaultUser, prismaMock } from '../../test/helpers';

type UserProfileType = Profile & {
  user: {
    roles: Role[];
    email: string;
  };
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
          useValue: new SupabaseClient('test', 'test'),
        },
      ],
    }).compile();

    service = module.get<AdminService>(AdminService);
    supabase = module.get<SupabaseClient>(SupabaseClient);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAllProfiles', () => {
    let profile: UserProfileType;

    beforeEach(() => {
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
          roles: [Role.USER],
        },
        createdAt: DateTime.now().toJSDate(),
        updatedAt: DateTime.now().toJSDate(),
      };
    });

    it('should call findMany', async () => {
      prismaMock.profile.findMany.mockResolvedValue([profile]);
      await service.getAllProfiles();

      expect(prismaMock.profile.findMany).toBeCalledWith({
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
              roles: true,
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
      const actual = await service.getAllProfiles();
      expect(actual[0]).toMatchObject(userProfiles);
    });
  });

  describe('setUserToAdmin', () => {
    let authDto: SetAdminDto;
    let userData: UserDto;

    beforeEach(() => {
      authDto = {
        id: 'newAdminId',
      };

      userData = {
        id: authDto.id,
        aud: 'aud',
        app_metadata: {},
        user_metadata: {},
        created_at: 'createdAt',
      };

      prismaMock.user.update.mockImplementation();
    });

    it('should call updateUserById', async () => {
      jest.spyOn(supabase.auth.api, 'updateUserById').mockResolvedValue({
        user: userData,
        error: null,
        data: userData,
      });

      await service.setUserToAdmin(authDto);

      expect(supabase.auth.api.updateUserById).toBeCalledWith(authDto.id, {
        user_metadata: {
          roles: ['USER', 'ADMIN'],
        },
      });
    });

    it('should throw error when error', async () => {
      jest.spyOn(supabase.auth.api, 'updateUserById').mockResolvedValue({
        user: null,
        error: {
          status: 404,
          message: 'User not found',
        },
        data: null,
      });

      try {
        await service.setUserToAdmin(authDto);
      } catch (error) {
        expect(error).toMatchObject(new Error('could not set user to admin'));
      }
    });
  });
});
