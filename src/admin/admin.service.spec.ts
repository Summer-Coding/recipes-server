import { UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ApiError, SupabaseClient, User } from '@supabase/supabase-js';
import { AdminService } from './admin.service';
import { MockSupabaseClient } from '../../test/helpers';
import { SetAdminDto } from './dtos';

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

  describe('setUserToAdmin', () => {
    let authDto: SetAdminDto;
    let userResponse: SupabaseGetUserResult;

    beforeEach(() => {
      authDto = {
        currentUserId: 'currentUserId',
        newAdminId: 'newAdminId',
      };

      userResponse = {
        error: null,
        data: { ...defaultUser },
      };
    });

    it('should call getUserById', async () => {
      jest
        .spyOn(supabase.auth.api, 'getUserById')
        .mockImplementation(async () => userResponse);

      try {
        await service.setUserToAdmin(authDto);
      } catch {}
      expect(supabase.auth.api.getUserById).toBeCalledWith(
        authDto.currentUserId,
      );
    });

    it('should throw UnauthorizedException if error is not null', async () => {
      const unsuccessfulUserResponse: SupabaseGetUserResult = {
        error: { ...defaultError },
        data: null,
      };

      jest
        .spyOn(supabase.auth.api, 'getUserById')
        .mockImplementation(async () => unsuccessfulUserResponse);

      try {
        await service.setUserToAdmin(authDto);
      } catch (error) {
        expect(error).toBeInstanceOf(UnauthorizedException);
      }
    });

    it('should throw UnauthorizedException if user_metadata null', async () => {
      userResponse.data.user_metadata = null;

      jest
        .spyOn(supabase.auth.api, 'getUserById')
        .mockImplementation(async () => userResponse);

      try {
        await service.setUserToAdmin(authDto);
      } catch (error) {
        expect(error).toBeInstanceOf(UnauthorizedException);
      }
    });

    it('should throw UnauthorizedException if roles is null', async () => {
      userResponse.data.user_metadata.roles = null;

      jest
        .spyOn(supabase.auth.api, 'getUserById')
        .mockImplementation(async () => userResponse);

      try {
        await service.setUserToAdmin(authDto);
      } catch (error) {
        expect(error).toBeInstanceOf(UnauthorizedException);
      }
    });

    it('should throw UnauthorizedException if roles is empty array', async () => {
      userResponse.data.user_metadata.roles = [];

      jest
        .spyOn(supabase.auth.api, 'getUserById')
        .mockImplementation(async () => userResponse);

      try {
        await service.setUserToAdmin(authDto);
      } catch (error) {
        expect(error).toBeInstanceOf(UnauthorizedException);
      }
    });

    it('should throw UnauthorizedException if roles does not include admin', async () => {
      userResponse.data.user_metadata.roles = ['user'];

      jest
        .spyOn(supabase.auth.api, 'getUserById')
        .mockImplementation(async () => userResponse);

      try {
        await service.setUserToAdmin(authDto);
      } catch (error) {
        expect(error).toBeInstanceOf(UnauthorizedException);
      }
    });

    it('should call updateUserById if roles includes admin', async () => {
      userResponse.data.user_metadata.roles = ['user', 'admin'];

      jest
        .spyOn(supabase.auth.api, 'getUserById')
        .mockImplementation(async () => userResponse);

      jest
        .spyOn(supabase.auth.api, 'updateUserById')
        .mockImplementation(async () => null);

      await service.setUserToAdmin(authDto);
      expect(supabase.auth.api.updateUserById).toBeCalledWith(
        authDto.newAdminId,
        {
          user_metadata: {
            roles: ['user', 'admin'],
          },
        },
      );
    });
  });

  describe('getAllUsers', () => {
    let currentUserId: string;
    let userResponse: SupabaseGetUserResult;

    beforeEach(() => {
      currentUserId = 'currentUserId';

      userResponse = {
        error: null,
        data: { ...defaultUser },
      };
    });

    it('should call getUserById', async () => {
      jest
        .spyOn(supabase.auth.api, 'getUserById')
        .mockImplementation(async () => userResponse);

      try {
        await service.getAllUsers(currentUserId);
      } catch {}
      expect(supabase.auth.api.getUserById).toBeCalledWith(currentUserId);
    });

    it('should throw UnauthorizedException if error is not null', async () => {
      const unsuccessfulUserResponse: SupabaseGetUsersResult = {
        error: { ...defaultError },
        data: null,
      };

      jest
        .spyOn(supabase.auth.api, 'getUserById')
        .mockImplementation(async () => unsuccessfulUserResponse);

      try {
        await service.getAllUsers(currentUserId);
      } catch (error) {
        expect(error).toBeInstanceOf(UnauthorizedException);
      }
    });

    it('should throw UnauthorizedException if user_metadata null', async () => {
      userResponse.data.user_metadata = null;

      jest
        .spyOn(supabase.auth.api, 'getUserById')
        .mockImplementation(async () => userResponse);

      try {
        await service.getAllUsers(currentUserId);
      } catch (error) {
        expect(error).toBeInstanceOf(UnauthorizedException);
      }
    });

    it('should throw UnauthorizedException if roles is null', async () => {
      userResponse.data.user_metadata.roles = null;

      jest
        .spyOn(supabase.auth.api, 'getUserById')
        .mockImplementation(async () => userResponse);

      try {
        await service.getAllUsers(currentUserId);
      } catch (error) {
        expect(error).toBeInstanceOf(UnauthorizedException);
      }
    });

    it('should throw UnauthorizedException if roles is empty array', async () => {
      userResponse.data.user_metadata.roles = [];

      jest
        .spyOn(supabase.auth.api, 'getUserById')
        .mockImplementation(async () => userResponse);

      try {
        await service.getAllUsers(currentUserId);
      } catch (error) {
        expect(error).toBeInstanceOf(UnauthorizedException);
      }
    });

    it('should throw UnauthorizedException if roles does not include admin', async () => {
      userResponse.data.user_metadata.roles = ['user'];

      jest
        .spyOn(supabase.auth.api, 'getUserById')
        .mockImplementation(async () => userResponse);

      try {
        await service.getAllUsers(currentUserId);
      } catch (error) {
        expect(error).toBeInstanceOf(UnauthorizedException);
      }
    });

    it('should call listUsers if roles includes admin', async () => {
      userResponse.data.user_metadata.roles = ['user', 'admin'];

      jest
        .spyOn(supabase.auth.api, 'getUserById')
        .mockImplementation(async () => userResponse);

      jest.spyOn(supabase.auth.api, 'listUsers').mockImplementation();

      try {
        await service.getAllUsers(currentUserId);
      } catch {}

      expect(supabase.auth.api.listUsers).toBeCalled();
    });

    it('should throw error if error is returned', async () => {
      userResponse.data.user_metadata.roles = ['user', 'admin'];

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
        await service.getAllUsers(currentUserId);
      } catch (error) {
        expect(error).toMatchObject(new Error('could not get users'));
      }
    });

    it('should return data from result', async () => {
      userResponse.data.user_metadata.roles = ['user', 'admin'];

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

      const actual = await service.getAllUsers(currentUserId);
      expect(actual).toMatchObject([defaultUser]);
    });
  });
});
