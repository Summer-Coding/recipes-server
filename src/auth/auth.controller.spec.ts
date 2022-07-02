import { Test } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { SupabaseClient } from '@supabase/supabase-js';
import { PrismaClient } from '@prisma/client';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { prismaMock } from '../../test/helpers/singleton';
import { PasswordAuthDto } from './dtos';
import { TokenType } from './types';

describe('AuthController', () => {
  let controller: AuthController;
  let service: AuthService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        AuthService,
        {
          provide: ConfigService,
          useValue: {
            getOrThrow: jest.fn(),
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

    controller = moduleRef.get<AuthController>(AuthController);
    service = moduleRef.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    it('should call signIn', async () => {
      const authDto = {
        email: 'testEmail',
      };

      jest.spyOn(service, 'signInAndCreateIfNotExists').mockImplementation();

      await controller.login(authDto);
      expect(service.signInAndCreateIfNotExists).toBeCalledWith(authDto);
    });
  });

  describe('loginWithPassword', () => {
    let authDto: PasswordAuthDto;
    let response: TokenType;

    beforeEach(() => {
      authDto = {
        email: 'testEmail',
        password: 'password',
      };

      response = { accessToken: 'accessToken' };
      jest.spyOn(service, 'signInWithPassword').mockResolvedValue(response);
    });

    it('should call signIn', async () => {
      await controller.loginWithPassword(authDto);
      expect(service.signInWithPassword).toBeCalledWith(authDto);
    });

    it('should respond with signIn response', async () => {
      const actual = await controller.loginWithPassword(authDto);
      expect(actual).toBe(response);
    });
  });
});
