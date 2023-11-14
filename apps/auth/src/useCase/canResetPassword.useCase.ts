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
  private MAX_ATTEMPTS = 3;

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
        await this.passwordResetRepository.findOne({
          where: {
            token: token,
          },
          relations: {
            user: true,
          },
        });

      if (
        resetToken &&
        moment(resetToken.expiryDate).isAfter(moment()) &&
        resetToken.attempts < this.MAX_ATTEMPTS
      ) {
        if (code != resetToken.code) {
          await this.updateAttemptsAndThrowException(resetToken);

          throw new HttpException(
            'Código não é o mesmo',
            HttpStatus.BAD_REQUEST,
          );
        }

        if (code === resetToken.code) {
          return {
            success: true,
            message: 'Código válidado com sucesso',
          };
        }
      }
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

  private async updateAttemptsAndThrowException(
    resetToken: PasswordResetToken,
  ): Promise<void> {
    resetToken.attempts++;

    await this.passwordResetRepository.update(resetToken.id, resetToken);

    throw new HttpException(
      `Código informado incompatível, ${
        this.MAX_ATTEMPTS - resetToken.attempts
      } tentativas restantes.`,
      HttpStatus.BAD_REQUEST,
    );
  }
}
