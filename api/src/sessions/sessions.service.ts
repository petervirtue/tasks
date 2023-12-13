import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Session } from './entities/session.entity';
import { DeepPartial, Repository } from 'typeorm';

@Injectable()
export class SessionsService {
  constructor(
    @InjectRepository(Session) private readonly repository: Repository<Session>,
  ) {}

  async create(data: DeepPartial<Session>): Promise<Session> {
    return this.repository.create(data);
    // return this.repository.save(this.repository.create(data));
  }

  async delete(id: number): Promise<void> {
    await this.repository.softDelete({ id });
  }
}
