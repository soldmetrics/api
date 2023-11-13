import { ForbiddenException, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../database';

export class GetUserAndCompanyUseCase {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {}

  async execute(id: number): Promise<User> {
    try {
      const user = await this.userRepository.findOne({
        where: { id },
        relations: { company: true, roles: true },
      });

      if (!user) {
        throw new ForbiddenException();
      }

      return user;
    } catch (error) {
      console.error(error);

      throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
    }
  }
}
