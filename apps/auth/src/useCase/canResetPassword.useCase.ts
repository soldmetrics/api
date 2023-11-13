import { PasswordResetToken } from '@app/common/database';
import { HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as moment from 'moment';
import { Repository } from 'typeorm';

export interface CanResetPasswordResponse {
  success: boolean;
  message: string;
}

export class CanResetPasswordUseCase {
  constructor(
    @InjectRepository(PasswordResetToken)
    private passwordResetRepository: Repository<PasswordResetToken>,
  ) {}

  async execute(
    token: string,
    code: string,
  ): Promise<CanResetPasswordResponse> {
    try {
      const resetToken: PasswordResetToken =
        await this.passwordResetRepository.findOneBy({ token });

      if (
        resetToken &&
        moment(resetToken.expiryDate).isAfter(moment()) &&
        resetToken.code === code
      ) {
        return {
          success: true,
          message: 'Código válidado com sucesso',
        };
      }

      throw new HttpException('', HttpStatus.NOT_FOUND);
    } catch (error) {
      console.log(`error for resetting password: ${error}`);
      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        'Internal Server Error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
