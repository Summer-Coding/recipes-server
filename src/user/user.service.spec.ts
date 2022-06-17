import { Test, TestingModule } from '@nestjs/testing';
import { Prisma, PrismaClient, User } from '@prisma/client';
import { prismaMock } from '../../test/helpers/singleton';
import { UserService } from './user.service';

const defaultUser: User = {
  id: 'id',
  email: 'email',
  isActive: true,
};

describe('UserService', () => {
  let service: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: PrismaClient,
          useValue: prismaMock,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createIfNotExists', () => {
    let userCreateInput: Prisma.UserCreateInput;

    beforeEach(() => {
      userCreateInput = {
        id: 'id',
        email: 'email',
      };

      prismaMock.user.create.mockResolvedValue(defaultUser);
    });

    it('should call count', async () => {
      prismaMock.user.count.mockResolvedValue(0);
      await service.createIfNotExists(userCreateInput);

      expect(prismaMock.user.count).toBeCalledWith({
        where: {
          id: userCreateInput.id,
        },
      });
    });

    it('should not call create when count is 1', async () => {
      prismaMock.user.count.mockResolvedValue(1);
      prismaMock.user.create.mockImplementation();
      await service.createIfNotExists(userCreateInput);
      expect(prismaMock.user.create).not.toBeCalled();
    });

    it('should not call create when count is 0', async () => {
      prismaMock.user.count.mockResolvedValue(0);
      prismaMock.user.create.mockImplementation();
      await service.createIfNotExists(userCreateInput);

      expect(prismaMock.user.create).toBeCalledWith({
        data: {
          id: userCreateInput.id,
          email: userCreateInput.email,
        },
      });
    });
  });

  describe('findOne', () => {
    let userWhereUnique: Prisma.UserWhereUniqueInput;

    beforeEach(() => {
      userWhereUnique = {
        id: 'id',
      };

      prismaMock.user.findUnique.mockResolvedValue(defaultUser);
    });

    it('should call findUnique', async () => {
      await service.findOne(userWhereUnique);
      expect(prismaMock.user.findUnique).toBeCalledWith({
        where: userWhereUnique,
        include: {
          roles: true,
        },
      });
    });

    it('should return result', async () => {
      const actual = await service.findOne(userWhereUnique);
      expect(actual).toMatchObject(defaultUser);
    });
  });

  describe('updateEmail', () => {
    let userWhereUnique: Prisma.UserWhereUniqueInput;
    let email: string;

    beforeEach(() => {
      userWhereUnique = {
        id: 'id',
      };

      email: 'email1';

      prismaMock.user.update.mockResolvedValue(defaultUser);
    });

    it('should call update', async () => {
      await service.updateEmail(userWhereUnique, email);
      expect(prismaMock.user.update).toBeCalledWith({
        where: userWhereUnique,
        data: {
          email: email,
        },
      });
    });

    it('should return result', async () => {
      const actual = await service.updateEmail(userWhereUnique, email);
      expect(actual).toMatchObject(defaultUser);
    });
  });

  describe('remove', () => {
    it('should call update', async () => {
      const userWhereUnique: Prisma.UserWhereUniqueInput = {
        id: 'id',
      };

      prismaMock.user.update.mockImplementation();
      await service.remove(userWhereUnique);

      expect(prismaMock.user.update).toBeCalledWith({
        where: userWhereUnique,
        data: {
          isActive: false,
        },
      });
    });
  });
});
