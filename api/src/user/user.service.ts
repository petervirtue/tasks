import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import { Secret } from 'src/auth/entities/secret.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly repository: Repository<User>,
    @InjectRepository(Secret)
    private readonly secretRepository: Repository<Secret>,
  ) {}

  async create(data: DeepPartial<User>, password: string): Promise<User> {
    return await this.repository.manager.transaction(async (entityManager) => {
      const createdUser = this.repository.create(data);
      const user = await entityManager.save(createdUser);

      if (password) {
        const secret = this.secretRepository.create({
          user,
          password: password,
        });

        await entityManager.save(Secret, secret);
      }

      return user;
    });
  }

  async findOneById(id: string): Promise<User> {
    const user = await this.repository.findOne({
      where: { id: id },
      relations: ['secret'],
    });

    if (!user || !user.secret) {
      throw new BadRequestException('User and or associated secret not found.');
    }

    return user;
  }

  async findOneByIdentifier(identifier: string): Promise<User | null> {
    const user = await (async (identifier) => {
      const user = await this.repository.findOne({
        where: { email: identifier },
        relations: {
          secret: true,
        },
      });

      if (user) {
        return user;
      }

      return await this.repository.findOne({
        where: { username: identifier },
        relations: {
          secret: true,
        },
      });
    })(identifier);

    return user;
  }

  async updateRefreshToken(id: string, refreshToken: string): Promise<User> {
    const user = await this.repository.findOne({
      where: { id: id },
      relations: {
        secret: true,
      },
    });

    if (!user || !user.secret) {
      throw new InternalServerErrorException(
        'User and or associated secret not found.',
      );
    }

    user.secret.refreshToken = refreshToken;

    return await this.repository.save(user);
  }
}
