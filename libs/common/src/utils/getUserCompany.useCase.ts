import { HttpException, HttpStatus } from '@nestjs/common';
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

      return user;
    } catch (error) {
      console.error(error);

      throw new HttpException(
        'Error fetching user company',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
