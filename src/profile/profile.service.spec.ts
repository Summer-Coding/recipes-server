import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { Prisma, PrismaClient, Profile } from '@prisma/client';
import { SupabaseClient } from '@supabase/supabase-js';
import { prismaMock } from '../../test/helpers/singleton';
import { AuthService } from '../auth/auth.service';
import { ProfileService } from './profile.service';

const defaultProfile: Profile = {
  id: 'id',
  username: 'username',
  firstName: 'firstName',
  lastName: 'lastName',
  profileImageSrc: null,
  userId: 'userId',
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('ProfileService', () => {
  let profileService: ProfileService;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        ProfileService,
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

    profileService = module.get<ProfileService>(ProfileService);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(profileService).toBeDefined();
  });

  describe('findOne', () => {
    const userId = 'userId';

    it('should call findUnique', async () => {
      prismaMock.profile.findUnique.mockResolvedValue(defaultProfile);
      await profileService.findOne(userId);

      expect(prismaMock.profile.findUnique).toBeCalledWith({
        where: {
          userId,
        },
      });
    });

    it('should return response from prisma', async () => {
      prismaMock.profile.findUnique.mockResolvedValue(defaultProfile);
      const actual = await profileService.findOne(userId);
      expect(actual).toMatchObject(defaultProfile);
    });
  });

  describe('upsert', () => {
    let data: Prisma.ProfileUncheckedCreateInput;

    beforeEach(() => {
      data = {
        ...defaultProfile,
      };

      jest.spyOn(authService, 'setUsername').mockImplementation();
    });

    it('should call setUsername', async () => {
      await profileService.upsert(data);
      expect(authService.setUsername).toBeCalledWith(
        data.userId,
        data.username,
      );
    });

    it('should call upsert', async () => {
      prismaMock.profile.upsert.mockResolvedValue(defaultProfile);
      await profileService.upsert(data);

      expect(prismaMock.profile.upsert).toBeCalledWith({
        where: {
          userId: data.userId,
        },
        update: {
          username: data.username,
          firstName: data.firstName,
          lastName: data.lastName,
          profileImageSrc: data.profileImageSrc,
        },
        create: {
          userId: data.userId,
          username: data.username,
          firstName: data.firstName,
          lastName: data.lastName,
          profileImageSrc: data.profileImageSrc,
        },
      });
    });

    it('should return response from prisma', async () => {
      prismaMock.profile.upsert.mockResolvedValue(defaultProfile);
      const actual = await profileService.upsert(data);
      expect(actual).toMatchObject(data);
    });
  });

  describe('remove', () => {
    it('should call update', async () => {
      const userId = 'userId';
      prismaMock.profile.update;
      await profileService.remove(userId);

      expect(prismaMock.profile.update).toBeCalledWith({
        where: {
          userId,
        },
        data: {
          isActive: false,
        },
      });
    });
  });
});
