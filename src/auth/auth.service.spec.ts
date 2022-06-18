import { Test } from '@nestjs/testing';
import { SupabaseClient, ApiError, Session, User } from '@supabase/supabase-js';
import { AuthService } from './auth.service';
import { AuthDto, DevAuthDto } from './dtos';
import { MockSupabaseClient } from '../../test/helpers';
import { UserService } from '../user/user.service';
import { PrismaClient } from '@prisma/client';
import { prismaMock } from '../../test/helpers/singleton';

type SupabaseSignInResult =
  | {
      user: User;
      session: Session;
      error: null;
    }
  | {
      user: null;
      session: null;
      error: ApiError;
    };

type SupabaseSignUpResult =
  | {
      user: User;
      data: User;
      error: null;
    }
  | {
      user: null;
      data: null;
      error: ApiError;
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

const defaultSession: Session = {
  access_token: 'accessToken',
  token_type: 'tokenType',
  user: { ...defaultUser },
};

describe('AuthService', () => {
  let authService: AuthService;
  let supabase: SupabaseClient;
  let userService: UserService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        AuthService,
        UserService,
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

    authService = moduleRef.get<AuthService>(AuthService);
    supabase = moduleRef.get<SupabaseClient>(SupabaseClient);
    userService = moduleRef.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
  });

  describe('signIn', () => {
    const authDto: DevAuthDto = {
      email: 'testEmail',
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
        await authService.signIn(authDto);
      } catch {}

      expect(supabase.auth.signIn).toBeCalledWith(authDto);
    });

    it('should throw error if error returned', async () => {
      signInResult.error = {
        status: 401,
        message: 'unauthorized',
      };

      jest.spyOn(supabase.auth, 'signIn').mockResolvedValue(signInResult);

      try {
        await authService.signIn(authDto);
      } catch (error) {
        expect(error).toMatchObject(
          new Error('user with email testEmail was unable to sign in'),
        );
      }
    });

    it('should throw error if session null', async () => {
      jest.spyOn(supabase.auth, 'signIn').mockResolvedValue(signInResult);

      try {
        await authService.signIn(authDto);
      } catch (error) {
        expect(error).toMatchObject(
          new Error('user with email testEmail was unable to sign in'),
        );
      }
    });

    it('should return accessToken if successful', async () => {
      signInResult.session = session;
      jest.spyOn(supabase.auth, 'signIn').mockResolvedValue(signInResult);

      const result = await authService.signIn(authDto);

      expect(result).toMatchObject({
        accessToken: signInResult.session.access_token,
      });
    });
  });

  describe('signUp', () => {
    const authDto: AuthDto = {
      email: 'testEmail',
    };

    let signUpResult: SupabaseSignUpResult;

    beforeEach(() => {
      signUpResult = {
        user: { ...defaultUser },
        data: { ...defaultUser },
        error: null,
      };
    });

    it('should call createUser', async () => {
      jest
        .spyOn(supabase.auth.api, 'createUser')
        .mockResolvedValue(signUpResult);

      try {
        await authService.signUp(authDto);
      } catch {}

      expect(supabase.auth.api.createUser).toBeCalledWith({
        email: authDto.email,
        user_metadata: {
          roles: ['USER'],
        },
      });
    });

    it('should throw error if error returned', async () => {
      const result: SupabaseSignUpResult = {
        user: null,
        data: null,
        error: {
          status: 401,
          message: 'unauthorized',
        },
      };

      jest.spyOn(supabase.auth.api, 'createUser').mockResolvedValue(result);

      try {
        await authService.signUp(authDto);
      } catch (error) {
        expect(error).toMatchObject(
          new Error('User with email testEmail was unable to sign up'),
        );
      }
    });

    it('should throw error if user null', async () => {
      jest
        .spyOn(supabase.auth.api, 'createUser')
        .mockResolvedValue(signUpResult);

      try {
        await authService.signUp(authDto);
      } catch (error) {
        expect(error).toMatchObject(
          new Error('user with email testEmail was unable to sign in'),
        );
      }
    });

    it('should call createIfNotExists', async () => {
      jest
        .spyOn(supabase.auth.api, 'createUser')
        .mockResolvedValue(signUpResult);

      jest.spyOn(userService, 'createIfNotExists').mockImplementation();

      await authService.signUp(authDto);
      expect(userService.createIfNotExists).toBeCalledWith({
        id: signUpResult.user?.id,
        email: authDto.email,
      });
    });
  });

  describe('setUsername', () => {
    it('calls updateUserById', async () => {
      const username = 'username';
      jest.spyOn(supabase.auth.api, 'updateUserById').mockImplementation();

      await authService.setUsername(defaultUser.id, username);
      expect(supabase.auth.api.updateUserById).toBeCalledWith(defaultUser.id, {
        user_metadata: {
          username,
        },
      });
    });
  });
});
