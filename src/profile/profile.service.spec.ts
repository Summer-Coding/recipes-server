import { Test, TestingModule } from '@nestjs/testing';
import { Prisma, PrismaClient, Profile } from '@prisma/client';
import { prismaMock } from '../../test/helpers/singleton';
import { ProfileService } from './profile.service';

const defaultProfile: Profile = {
  id: 'id',
  username: 'username',
  firstName: 'firstName',
  lastName: 'lastName',
  profileImageSrc: null,
  userId: 'userId',
  isActive: true,
};

describe('ProfileService', () => {
  let service: ProfileService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProfileService,
        {
          provide: PrismaClient,
          useValue: prismaMock,
        },
      ],
    }).compile();

    service = module.get<ProfileService>(ProfileService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findOne', () => {
    const userId = 'userId';

    it('should call findUnique', async () => {
      prismaMock.profile.findUnique.mockResolvedValue(defaultProfile);
      await service.findOne(userId);

      expect(prismaMock.profile.findUnique).toBeCalledWith({
        where: {
          userId,
        },
      });
    });

    it('should return response from prisma', async () => {
      prismaMock.profile.findUnique.mockResolvedValue(defaultProfile);
      const actual = await service.findOne(userId);
      expect(actual).toMatchObject(defaultProfile);
    });
  });

  describe('upsert', () => {
    let data: Prisma.ProfileUncheckedCreateInput;

    beforeEach(() => {
      data = {
        ...defaultProfile,
      };
    });

    it('should call upsert', async () => {
      prismaMock.profile.upsert.mockResolvedValue(defaultProfile);
      await service.upsert(data);

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
      const actual = await service.upsert(data);
      expect(actual).toMatchObject(data);
    });
  });

  describe('remove', () => {
    it('should call update', async () => {
      const userId = 'userId';
      prismaMock.profile.update;
      await service.remove(userId);

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
