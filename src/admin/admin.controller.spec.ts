import { Test, TestingModule } from '@nestjs/testing';
import { SupabaseClient } from '@supabase/supabase-js';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { MockSupabaseClient } from '../../test/helpers';
import { SetAdminRequest } from './dtos';
import { UserDto } from '../auth/dtos';

const currentUser: UserDto = {
  id: 'id',
  app_metadata: {},
  user_metadata: {
    roles: ['user'],
  },
  aud: 'aud',
  created_at: 'createdAt',
};

describe('AdminController', () => {
  let controller: AdminController;
  let service: AdminService;
  const OLD_ENV = process.env;

  beforeEach(async () => {
    process.env = {
      ...OLD_ENV,
      SUPABASE_URL: 'supabaseUrl',
      SUPABASE_PRIVATE_KEY: 'supabaseKey',
      SUPABASE_JWT_SECRET: 'jwt',
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminController],
      providers: [
        AdminService,
        {
          provide: SupabaseClient,
          useValue: new MockSupabaseClient('test', 'test'),
        },
      ],
    }).compile();

    controller = module.get<AdminController>(AdminController);
    service = module.get<AdminService>(AdminService);
  });

  afterAll(() => {
    process.env = OLD_ENV;
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getAll', () => {
    it('should call getAllUsers', async () => {
      jest.spyOn(service, 'getAllUsers').mockImplementation();

      await controller.getAllUsers(currentUser);
      expect(service.getAllUsers).toBeCalledWith(currentUser.id);
    });

    it('should return result of getAllUsers', async () => {
      jest
        .spyOn(service, 'getAllUsers')
        .mockImplementation(async () => [currentUser]);

      const actual = await controller.getAllUsers(currentUser);
      expect(actual).toMatchObject([currentUser]);
    });
  });

  describe('setUserToAdmin', () => {
    it('should call create', async () => {
      const request: SetAdminRequest = { id: 'id' };
      jest.spyOn(service, 'setUserToAdmin').mockImplementation();

      await controller.create(currentUser, request);
      expect(service.setUserToAdmin).toBeCalledWith({
        currentUserId: currentUser.id,
        newAdminId: request.id,
      });
    });
  });
});
