import { Test, TestingModule } from '@nestjs/testing';
import { SupabaseClient } from '@supabase/supabase-js';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { MockSupabaseClient } from '../../test/helpers';
import { UserDto } from '../auth/dtos';
import { PrismaClient, Role } from '@prisma/client';
import { SetAdminDto, UserProfileListItemDto } from './dtos';

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
        PrismaClient,
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
    let currentUser: UserDto;
    let currentUserProfile: UserProfileListItemDto;

    beforeEach(() => {
      currentUser = {
        id: 'id',
        app_metadata: {},
        user_metadata: {
          roles: [Role.USER],
        },
        aud: 'aud',
        created_at: 'createdAt',
      };

      currentUserProfile = {
        id: 'id',
        roles: [Role.USER],
        isActive: true,
        firstName: 'firstName',
        lastName: 'lastName',
        username: 'username',
        email: 'test@test.com',
        userId: 'userId',
      };
    });

    it('should call getAllUserIds', async () => {
      jest
        .spyOn(service, 'getAllUserIds')
        .mockImplementation(async () => [currentUser.id]);

      await controller.getAllUsers();
      expect(service.getAllUserIds).toBeCalled();
    });

    it('should call getAllProfiles', async () => {
      jest
        .spyOn(service, 'getAllUserIds')
        .mockImplementation(async () => [currentUser.id]);

      jest
        .spyOn(service, 'getAllProfiles')
        .mockImplementation(async () => [currentUserProfile]);

      await controller.getAllUsers();
      expect(service.getAllProfiles).toBeCalledWith([currentUser.id]);
    });

    it('should return result of getAllUserIds', async () => {
      jest
        .spyOn(service, 'getAllUserIds')
        .mockImplementation(async () => [currentUser.id]);

      jest
        .spyOn(service, 'getAllProfiles')
        .mockImplementation(async () => [currentUserProfile]);

      const actual = await controller.getAllUsers();
      expect(actual).toMatchObject([currentUserProfile]);
    });
  });

  describe('setUserToAdmin', () => {
    it('should call create', async () => {
      const dto: SetAdminDto = { id: 'id' };
      jest.spyOn(service, 'setUserToAdmin');

      await controller.create(dto);
      expect(service.setUserToAdmin).toBeCalledWith({
        id: dto.id,
      });
    });
  });
});
