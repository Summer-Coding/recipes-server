import { Test, TestingModule } from '@nestjs/testing';
import { PrismaClient, Profile } from '@prisma/client';
import { UserService } from '../user/user.service';
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
  let profileService: ProfileService;
  let userService: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProfileController],
      providers: [
        AuthService,
        ProfileService,
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

    controller = module.get<ProfileController>(ProfileController);
    profileService = module.get<ProfileService>(ProfileService);
    userService = module.get<UserService>(UserService);
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

    it('should call createIfNotExists', async () => {
      jest.spyOn(userService, 'createIfNotExists').mockImplementation();
      await controller.create(defaultUser, dto);
      expect(userService.createIfNotExists).toBeCalledWith({
        id: defaultUser.id,
        email: defaultUser.email as string,
      });
    });

    it('should call upsert', async () => {
      jest.spyOn(profileService, 'upsert').mockImplementation();
      await controller.create(defaultUser, dto);
      expect(profileService.upsert).toBeCalledWith({
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

      jest.spyOn(profileService, 'upsert').mockResolvedValue(response);
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
      jest.spyOn(profileService, 'findOne').mockImplementation();
      await controller.findOne(defaultUser);
      expect(profileService.findOne).toBeCalledWith(defaultUser.id);
    });

    it('should call return result of findOne', async () => {
      const response: Profile = {
        ...dto,
        userId: defaultUser.id,
        id: 'id',
        profileImageSrc: null,
        isActive: true,
      };

      jest.spyOn(profileService, 'findOne').mockResolvedValue(response);
      const actual = await controller.findOne(defaultUser);
      expect(actual).toMatchObject(response);
    });
  });

  describe('remove', () => {
    it('should call remove', async () => {
      jest.spyOn(profileService, 'remove').mockImplementation();
      await controller.remove(defaultUser);
      expect(profileService.remove).toBeCalledWith(defaultUser.id);
    });
  });
});
