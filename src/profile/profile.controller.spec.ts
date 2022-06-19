import { Test, TestingModule } from '@nestjs/testing';
import { PrismaClient, Profile } from '@prisma/client';
import { prismaMock } from '../../test/helpers/singleton';
import { UserDto } from '../auth/dtos';
import { UpsertProfileDto } from './dto/upsert-profile.dto';
import { ProfileController } from './profile.controller';
import { ProfileService } from './profile.service';
import { AuthService } from '../auth/auth.service';
import { SupabaseClient } from '@supabase/supabase-js';
import { MockSupabaseClient } from '../../test/helpers';

const defaultUser: UserDto = {
  id: 'id',
  email: 'test@test.com',
  app_metadata: {},
  user_metadata: {
    roles: ['user', 'admin'],
  },
  aud: 'aud',
  created_at: 'createdAt',
};

describe('ProfileController', () => {
  let controller: ProfileController;
  let service: ProfileService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProfileController],
      providers: [
        AuthService,
        ProfileService,
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

    controller = module.get<ProfileController>(ProfileController);
    service = module.get<ProfileService>(ProfileService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    let dto: UpsertProfileDto;

    beforeEach(() => {
      dto = {
        username: 'username',
        firstName: 'firstName',
        lastName: 'lastName',
        profileImgSrc: 'src',
      };
    });

    it('should call upsert', async () => {
      jest.spyOn(service, 'upsert').mockImplementation();
      await controller.create(defaultUser, dto);
      expect(service.upsert).toBeCalledWith({
        ...dto,
        userId: defaultUser.id,
      });
    });

    it('should call return result of upsert', async () => {
      const response: Profile = {
        ...dto,
        userId: defaultUser.id,
        id: 'id',
        profileImageSrc: null,
        isActive: true,
      };

      jest.spyOn(service, 'upsert').mockResolvedValue(response);
      const actual = await controller.create(defaultUser, dto);
      expect(actual).toMatchObject(response);
    });
  });

  describe('findOne', () => {
    let dto: UpsertProfileDto;

    beforeEach(() => {
      dto = {
        username: 'username',
        firstName: 'firstName',
        lastName: 'lastName',
        profileImgSrc: 'src',
      };
    });

    it('should call findOne', async () => {
      jest.spyOn(service, 'findOne').mockImplementation();
      await controller.findOne(defaultUser);
      expect(service.findOne).toBeCalledWith(defaultUser.id);
    });

    it('should call return result of findOne', async () => {
      const response: Profile = {
        ...dto,
        userId: defaultUser.id,
        id: 'id',
        profileImageSrc: null,
        isActive: true,
      };

      jest.spyOn(service, 'findOne').mockResolvedValue(response);
      const actual = await controller.findOne(defaultUser);
      expect(actual).toMatchObject(response);
    });
  });

  describe('remove', () => {
    it('should call remove', async () => {
      jest.spyOn(service, 'remove').mockImplementation();
      await controller.remove(defaultUser);
      expect(service.remove).toBeCalledWith(defaultUser.id);
    });
  });
});
