import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Session } from './entities/session.entity';
import { DeepPartial, FindOptionsWhere, Repository } from 'typeorm';

@Injectable()
export class SessionsService {
  constructor(
    @InjectRepository(Session) private readonly repository: Repository<Session>,
  ) {}

  async findOneBy(where: FindOptionsWhere<Session>): Promise<Session> {
    return this.repository.findOneBy(where);
  }

  async create(data: DeepPartial<Session>): Promise<Session> {
    return this.repository.save(this.repository.create(data));
  }

  async delete(id: number): Promise<void> {
    await this.repository.softDelete({ id });
  }
}
