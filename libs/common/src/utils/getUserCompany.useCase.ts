import { ForbiddenException, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../database';
import * as moment from 'moment';

export class GetUserAndCompanyUseCase {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {}

  async execute(id: number): Promise<any> {
    try {
      const user = await this.userRepository.findOne({
        where: { id },
        relations: {
          company: {
            subscriptions: true,
          },
          roles: true,
        },
      });

      if (!user) {
        throw new ForbiddenException();
      }

      const isTrial = moment(user?.company?.subscriptions[0]?.endTrial).isAfter(
        moment(),
      );

      const newUser = {
        ...user,
        isTrial,
      };

      return newUser;
    } catch (error) {
      console.error(error);

      throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
    }
  }
}
