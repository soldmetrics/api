import { User } from '@app/common/database';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CredentialsDTO } from '../model/dto/credentialsDTO';
import { LoginResponseDTO } from '../model/dto/loginResponseDTO';

Injectable();
export class LoginUseCase {
  constructor(
    private jwtService: JwtService,
    @InjectRepository(User) private usersRepository: Repository<User>,
  ) {}

  async execute(credentials: CredentialsDTO): Promise<LoginResponseDTO> {
    const user = await this.fetchUser(credentials.email);

    if (user && user.checkIfUnencryptedPasswordIsValid(credentials.password)) {
      const accessToken = this.jwtService.sign({
        userId: user.id,
        email: user.email,
        roles: user.roles,
      });

      return {
        accessToken,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          company: user.company,
          roles: user.roles,
          createdAt: user.createdAt,
        },
      };
    }

    throw new HttpException('Bad Credentials', HttpStatus.BAD_REQUEST);
  }

  private async fetchUser(email: string): Promise<User> {
    return await this.usersRepository.findOne({
      where: { email },
      relations: { roles: true, company: true },
    });
  }
}
