import { UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ApiError, SupabaseClient, User } from '@supabase/supabase-js';
import { AdminService } from './admin.service';
import { MockSupabaseClient } from '../../test/helpers';
import { SetAdminDto } from './dtos';

type SupabaseGetUserResult =
  | { data: User; error: null }
  | { data: null; error: ApiError };

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
        data: {
          id: 'id',
          app_metadata: {},
          user_metadata: {
            roles: ['user', 'admin'],
          },
          aud: 'aud',
          created_at: 'createdAt',
        },
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
        error: {
          status: 401,
          message: 'unauthorized',
        },
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
});
