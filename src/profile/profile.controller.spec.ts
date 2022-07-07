import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { PrismaClient, Profile } from '@prisma/client';
import { SupabaseClient } from '@supabase/supabase-js';
import { AuthService } from '../auth/auth.service';
import { UpsertProfileDto } from './dtos';
import { ProfileController } from './profile.controller';
import { ProfileService } from './profile.service';
import { currentUser, prismaMock } from '../../test/helpers';

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
          useValue: new SupabaseClient('test', 'test'),
        },
        {
          provide: ConfigService,
          useValue: {
            getOrThrow: jest.fn(),
          },
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
      await controller.create(currentUser, dto);
      expect(service.upsert).toBeCalledWith({
        ...dto,
        userId: currentUser.id,
      });
    });

    it('should call return result of upsert', async () => {
      const response: Profile = {
        ...dto,
        userId: currentUser.id,
        id: 'id',
        profileImageSrc: null,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(service, 'upsert').mockResolvedValue(response);
      const actual = await controller.create(currentUser, dto);
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
      await controller.findOne(currentUser);
      expect(service.findOne).toBeCalledWith(currentUser.id);
    });

    it('should call return result of findOne', async () => {
      const response: Profile = {
        ...dto,
        userId: currentUser.id,
        id: 'id',
        profileImageSrc: null,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(service, 'findOne').mockResolvedValue(response);
      const actual = await controller.findOne(currentUser);
      expect(actual).toMatchObject(response);
    });
  });

  describe('remove', () => {
    it('should call remove', async () => {
      jest.spyOn(service, 'remove').mockImplementation();
      await controller.remove(currentUser);
      expect(service.remove).toBeCalledWith(currentUser.id);
    });
  });
});
