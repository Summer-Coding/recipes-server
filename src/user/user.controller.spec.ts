import { Test, TestingModule } from '@nestjs/testing';
import { PrismaClient, User } from '@prisma/client';
import { UserDto } from 'src/auth/dtos';
import { UserController } from './user.controller';
import { UserService } from './user.service';

const defaultUserDto: UserDto = {
  id: 'id',
  email: 'email',
  app_metadata: {
    provider: undefined,
  },
  user_metadata: {},
  aud: 'aud',
  created_at: 'createdAt',
};

const defaultPrismaUser: User = {
  id: 'userId',
  email: 'email',
  role: 'USER',
  isActive: true,
};

describe('UserController', () => {
  let controller: UserController;
  let service: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [UserService, PrismaClient],
    }).compile();

    controller = module.get<UserController>(UserController);
    service = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    let currentUser: UserDto;

    beforeEach(() => {
      currentUser = { ...defaultUserDto };

      jest
        .spyOn(service, 'create')
        .mockImplementation(async () => defaultPrismaUser);
    });

    it('should call create', async () => {
      await controller.create(currentUser);
      expect(service.create).toBeCalledWith({
        id: defaultUserDto.id,
        email: defaultUserDto.email,
      });
    });

    it('should respond with User', async () => {
      const actual = await controller.create(currentUser);
      expect(actual).toMatchObject(defaultPrismaUser);
    });
  });

  describe('findOne', () => {
    let currentUser: UserDto;

    beforeEach(() => {
      currentUser = { ...defaultUserDto };

      jest
        .spyOn(service, 'findOne')
        .mockImplementation(async () => defaultPrismaUser);
    });

    it('should call findOne', async () => {
      await controller.findOne(currentUser);
      expect(service.findOne).toBeCalledWith({
        id: defaultUserDto.id,
      });
    });

    it('should respond with User', async () => {
      const actual = await controller.findOne(currentUser);
      expect(actual).toMatchObject(defaultPrismaUser);
    });
  });

  describe('update', () => {
    let currentUser: UserDto;

    beforeEach(() => {
      currentUser = { ...defaultUserDto };

      jest
        .spyOn(service, 'updateEmail')
        .mockImplementation(async () => defaultPrismaUser);
    });

    it('should call updateEmail', async () => {
      await controller.update(currentUser);
      expect(service.updateEmail).toBeCalledWith(
        {
          id: defaultUserDto.id,
        },
        defaultUserDto.email,
      );
    });

    it('should respond with User', async () => {
      const actual = await controller.update(currentUser);
      expect(actual).toMatchObject(defaultPrismaUser);
    });
  });

  describe('remove', () => {
    it('should call remove', async () => {
      jest.spyOn(service, 'remove').mockImplementation();
      await controller.remove(defaultUserDto);
      expect(service.remove).toBeCalledWith({
        id: defaultUserDto.id,
      });
    });
  });
});
