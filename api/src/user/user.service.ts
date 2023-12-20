import { Injectable } from '@nestjs/common';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { Session } from 'inspector';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(Session)
    private readonly sessionRepository: Repository<Session>,
  ) {}

  async findOneBy(where: FindOptionsWhere<User>): Promise<User> {
    return this.userRepository.findOneBy(where);
  }

  async create(dto: CreateUserDto): Promise<User> {
    return this.userRepository.save(this.userRepository.create(dto));
  }

  async delete(id: number): Promise<void> {
    const user = await this.userRepository.findOne({
      where: {
        id,
      },
      relations: {
        sessions: true,
      },
    });

    if (user.sessions.length > 0) {
      await Promise.all(
        user.sessions.map((session) =>
          this.sessionRepository.softDelete(session.id),
        ),
      );
    }

    await this.userRepository.softDelete({ id });
  }
}
