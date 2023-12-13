import { Injectable } from '@nestjs/common';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly repository: Repository<User>,
  ) {}

  async findOneBy(where: FindOptionsWhere<User>): Promise<User> {
    return this.repository.findOneBy(where);
  }

  async create(dto: CreateUserDto): Promise<User> {
    return this.repository.save(this.repository.create(dto));
  }
}
