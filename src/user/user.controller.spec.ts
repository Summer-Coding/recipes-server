import { Test, TestingModule } from '@nestjs/testing';
import { PrismaClient, Role, User } from '@prisma/client';
import { UserDto } from 'src/auth/dtos';
import { prismaMock } from '../../test/helpers/singleton';
import { UpdateEmailDto } from './dtos/update-email.dto';
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
  isActive: true,
  roles: [Role.USER],
};

describe('UserController', () => {
  let controller: UserController;
  let service: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        UserService,
        {
          provide: PrismaClient,
          useValue: prismaMock,
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
    service = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
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
    let updateEmailDto: UpdateEmailDto;
    let userResponse: User;

    beforeEach(() => {
      currentUser = { ...defaultUserDto };
      updateEmailDto = { email: 'email1' };
      userResponse = {
        ...currentUser,
        email: updateEmailDto.email,
        isActive: true,
        roles: [Role.USER],
      };

      jest.spyOn(service, 'updateEmail').mockResolvedValue(userResponse);
    });

    it('should call updateEmail', async () => {
      await controller.updateEmail(currentUser, updateEmailDto);
      expect(service.updateEmail).toBeCalledWith(
        {
          id: defaultUserDto.id,
        },
        updateEmailDto.email,
      );
    });

    it('should respond with User', async () => {
      const actual = await controller.updateEmail(currentUser, updateEmailDto);
      expect(actual).toMatchObject(userResponse);
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
