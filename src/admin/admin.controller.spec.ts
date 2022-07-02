import { Test, TestingModule } from '@nestjs/testing';
import { SupabaseClient } from '@supabase/supabase-js';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { PrismaClient, Role } from '@prisma/client';
import { SetAdminDto, UserProfileListItemDto } from './dtos';
import { prismaMock } from '../../test/helpers/singleton';
import { ConfigService } from '@nestjs/config';

describe('AdminController', () => {
  let controller: AdminController;
  let adminService: AdminService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminController],
      providers: [
        AdminService,
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

    controller = module.get<AdminController>(AdminController);
    adminService = module.get<AdminService>(AdminService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getAllUsers', () => {
    let currentUserProfile: UserProfileListItemDto;

    beforeEach(() => {
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

      jest
        .spyOn(adminService, 'getAllProfiles')
        .mockResolvedValue([currentUserProfile]);
    });

    it('should call getAllProfiles', async () => {
      await controller.getAllUsers();
      expect(adminService.getAllProfiles).toBeCalled();
    });

    it('should return result of getAllProfiles', async () => {
      const actual = await controller.getAllUsers();
      expect(actual).toMatchObject([currentUserProfile]);
    });
  });

  describe('setUserToAdmin', () => {
    it('should call create', async () => {
      const dto: SetAdminDto = { id: 'id' };
      jest.spyOn(adminService, 'setUserToAdmin').mockImplementation();

      await controller.setUserToAdmin(dto);
      expect(adminService.setUserToAdmin).toBeCalledWith({
        id: dto.id,
      });
    });
  });
});
