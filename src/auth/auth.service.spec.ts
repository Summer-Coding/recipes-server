import { Test } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { SupabaseClient, Session } from '@supabase/supabase-js';
import { PrismaClient } from '@prisma/client';
import { AuthService } from './auth.service';
import { AuthDto, PasswordAuthDto } from './dtos';
import { WebConfig } from '../environment/web.config';
import {
  defaultError,
  defaultUser,
  defaultSession,
  prismaMock,
  SupabaseSignInResult,
  SupabaseSignUpResult,
} from '../../test/helpers';

describe('AuthService', () => {
  let service: AuthService;
  let supabase: SupabaseClient;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: ConfigService,
          useValue: {
            getOrThrow: jest.fn((key: string) => {
              if (key === 'web') {
                const config: WebConfig = {
                  webUrl: 'webUrl',
                };
                return config;
              }
            }),
          },
        },
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

    service = moduleRef.get<AuthService>(AuthService);
    supabase = moduleRef.get<SupabaseClient>(SupabaseClient);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('signInWithPassword', () => {
    const authDto: PasswordAuthDto = {
      email: 'testEmail@email.com',
      password: 'password',
    };

    let session: Session;

    let signInResult: SupabaseSignInResult;

    beforeEach(() => {
      signInResult = {
        user: { ...defaultUser },
        session: { ...defaultSession },
        error: null,
      };

      session = {
        access_token: 'accessToken',
        refresh_token: 'refreshToken',
        token_type: 'type',
        user: {
          id: 'id',
          app_metadata: {},
          user_metadata: {},
          aud: 'aud',
          created_at: 'createdAt',
        },
      };
    });

    it('should call signIn', async () => {
      jest.spyOn(supabase.auth, 'signIn').mockResolvedValue(signInResult);

      try {
        await service.signInWithPassword(authDto);
      } catch {}

      expect(supabase.auth.signIn).toBeCalledWith(
        { ...authDto },
        {
          shouldCreateUser: false,
        },
      );
    });

    it('should throw error if error returned', async () => {
      const result: SupabaseSignInResult = {
        user: null,
        session: null,
        error: { ...defaultError },
      };

      jest.spyOn(supabase.auth, 'signIn').mockResolvedValue(result);

      expect(service.signInWithPassword(authDto)).rejects.toThrowError(
        'user with email testEmail@email.com was unable to sign in',
      );
    });

    it('should throw error if session null', async () => {
      const result: SupabaseSignInResult = {
        user: { ...defaultUser },
        session: null,
        error: null,
      };

      jest.spyOn(supabase.auth, 'signIn').mockResolvedValue(result);

      expect(service.signInWithPassword(authDto)).rejects.toThrowError(
        'user with email testEmail@email.com was unable to sign in',
      );
    });

    it('should return accessToken if successful', async () => {
      signInResult.session = session;
      jest.spyOn(supabase.auth, 'signIn').mockResolvedValue(signInResult);

      const result = await service.signInWithPassword(authDto);

      expect(result).toMatchObject({
        accessToken: signInResult.session.access_token,
      });
    });
  });

  describe('signInAndCreateIfNotExists', () => {
    let authDto: AuthDto;
    let signUpResult: SupabaseSignUpResult;
    let signInResult: SupabaseSignInResult;
    const errorMessage =
      'user with email testEmail@email.com was unable to sign in';
    const webUrl = 'webUrl';

    beforeEach(() => {
      authDto = {
        email: 'testEmail@email.com',
      };
      signUpResult = {
        user: { ...defaultUser },
        data: { ...defaultUser },
        error: null,
      };
      signInResult = {
        user: { ...defaultUser },
        session: { ...defaultSession },
        error: null,
      };
    });

    it('should call count', async () => {
      jest.spyOn(prismaMock.user, 'count').mockResolvedValue(1);

      try {
        await service.signInAndCreateIfNotExists(authDto);
      } catch {}

      expect(prismaMock.user.count).toBeCalledWith({
        where: {
          email: authDto.email,
        },
      });
    });

    it('should call createUser when count is 0', async () => {
      jest.spyOn(prismaMock.user, 'count').mockResolvedValue(0);

      jest
        .spyOn(supabase.auth.api, 'createUser')
        .mockResolvedValue(signUpResult);

      try {
        await service.signInAndCreateIfNotExists(authDto);
      } catch {}

      expect(supabase.auth.api.createUser).toBeCalledWith({
        email: authDto.email,
        user_metadata: {
          roles: ['USER'],
        },
      });
    });

    it('should throw error when error returned from createUser', async () => {
      const result: SupabaseSignUpResult = {
        user: null,
        data: null,
        error: { ...defaultError },
      };

      jest.spyOn(prismaMock.user, 'count').mockResolvedValue(0);
      jest.spyOn(supabase.auth.api, 'createUser').mockResolvedValue(result);

      expect(service.signInAndCreateIfNotExists(authDto)).rejects.toThrowError(
        errorMessage,
      );
    });

    it('should call signIn when userCount is 0', async () => {
      jest.spyOn(prismaMock.user, 'count').mockResolvedValue(0);

      jest
        .spyOn(supabase.auth.api, 'createUser')
        .mockResolvedValue(signUpResult);

      jest.spyOn(supabase.auth, 'signIn').mockResolvedValue(signInResult);

      try {
        await service.signInAndCreateIfNotExists(authDto);
      } catch {}

      expect(supabase.auth.signIn).toBeCalledWith(
        {
          email: authDto.email,
        },
        {
          redirectTo: `${webUrl}/profile/`,
          shouldCreateUser: false,
        },
      );
    });

    it('should not call createUser when userCount is 1', async () => {
      jest.spyOn(prismaMock.user, 'count').mockResolvedValue(1);
      jest.spyOn(supabase.auth.api, 'createUser').mockImplementation();
      jest.spyOn(supabase.auth, 'signIn').mockResolvedValue(signInResult);

      await service.signInAndCreateIfNotExists(authDto);
      expect(supabase.auth.api.createUser).not.toBeCalled();
    });

    it('should call signIn when userCount is 1', async () => {
      jest.spyOn(prismaMock.user, 'count').mockResolvedValue(1);
      jest.spyOn(supabase.auth, 'signIn').mockResolvedValue(signInResult);

      await service.signInAndCreateIfNotExists(authDto);
      expect(supabase.auth.signIn).toBeCalledWith(
        {
          email: authDto.email,
        },
        {
          redirectTo: webUrl,
          shouldCreateUser: false,
        },
      );
    });

    it('should throw error when error returned from signIn', async () => {
      const result: SupabaseSignInResult = {
        user: null,
        session: null,
        error: { ...defaultError },
      };

      jest.spyOn(prismaMock.user, 'count').mockResolvedValue(1);
      jest.spyOn(supabase.auth, 'signIn').mockResolvedValue(result);

      expect(service.signInAndCreateIfNotExists(authDto)).rejects.toThrowError(
        errorMessage,
      );
    });
  });

  describe('setUsername', () => {
    it('calls updateUserById', async () => {
      const username = 'username';
      jest.spyOn(supabase.auth.api, 'updateUserById').mockImplementation();

      await service.setUsername(defaultUser.id, username);
      expect(supabase.auth.api.updateUserById).toBeCalledWith(defaultUser.id, {
        user_metadata: {
          username,
        },
      });
    });
  });
});
