import { Test } from '@nestjs/testing';
import { SupabaseClient, ApiError, Session, User } from '@supabase/supabase-js';
import { AuthService } from './auth.service';
import { AuthDto } from './dtos';
import { MockSupabaseClient } from '../../test/helpers';

type SupabaseResult =
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
  let service: AuthService;
  let supabase: SupabaseClient;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: SupabaseClient,
          useValue: new MockSupabaseClient('test', 'test'),
        },
      ],
    }).compile();

    service = moduleRef.get<AuthService>(AuthService);
    supabase = moduleRef.get<SupabaseClient>(SupabaseClient);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('signIn', () => {
    const authDto: AuthDto = {
      email: 'testEmail',
      password: 'password',
    };

    let session: Session;

    let signInResult: SupabaseResult;

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
        await service.signIn(authDto);
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
        await service.signIn(authDto);
      } catch (error) {
        expect(error).toMatchObject(
          new Error('user with email testEmail was unable to sign in'),
        );
      }
    });

    it('should throw error if session null', async () => {
      jest.spyOn(supabase.auth, 'signIn').mockResolvedValue(signInResult);

      try {
        await service.signIn(authDto);
      } catch (error) {
        expect(error).toMatchObject(
          new Error('user with email testEmail was unable to sign in'),
        );
      }
    });

    it('should return accessToken if successful', async () => {
      signInResult.session = session;
      jest.spyOn(supabase.auth, 'signIn').mockResolvedValue(signInResult);

      const result = await service.signIn(authDto);

      expect(result).toMatchObject({
        accessToken: signInResult.session.access_token,
      });
    });
  });
});
