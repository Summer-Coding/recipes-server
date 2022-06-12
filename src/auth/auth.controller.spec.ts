import { Test } from '@nestjs/testing';
import { SupabaseClient } from '@supabase/supabase-js';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthDto } from './dtos';
import { TokenType } from './types';
import { MockSupabaseClient } from '../../test/helpers';

describe('AuthController', () => {
  let controller: AuthController;
  let service: AuthService;
  const OLD_ENV = process.env;

  beforeEach(async () => {
    jest.resetModules();
    process.env = {
      ...OLD_ENV,
      SUPABASE_URL: 'supabaseUrl',
      SUPABASE_KEY: 'supabaseKey',
      SUPABASE_JWT_SECRET: 'jwt',
    };

    const moduleRef = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        AuthService,
        {
          provide: SupabaseClient,
          useValue: new MockSupabaseClient('test', 'test'),
        },
      ],
    }).compile();

    controller = moduleRef.get<AuthController>(AuthController);
    service = moduleRef.get<AuthService>(AuthService);
  });

  afterAll(() => {
    process.env = OLD_ENV;
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    let authDto: AuthDto;
    let response: TokenType;

    beforeEach(() => {
      authDto = {
        email: 'testEmail',
        password: 'password',
      };

      response = { accessToken: 'accessToken' };
    });

    it('should call signIn', async () => {
      jest.spyOn(service, 'signIn').mockImplementation(async () => response);

      await controller.login(authDto);
      expect(service.signIn).toBeCalledWith(authDto);
    });

    it('should respond with signIn response', async () => {
      jest.spyOn(service, 'signIn').mockImplementation(async () => response);

      const actual = await controller.login(authDto);
      expect(actual).toBe(response);
    });
  });
});
