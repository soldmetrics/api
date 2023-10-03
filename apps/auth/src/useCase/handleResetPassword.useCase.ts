import { PasswordResetToken, User } from '@app/common/database';
import { HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as moment from 'moment';
import { Repository } from 'typeorm';
import { HandleResetPasswordDTO } from '../model/dto/handleResetPasswordDTO';

export class HandleResetPasswordUseCase {
  private MAX_ATTEMPTS = 3;

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(PasswordResetToken)
    private passwordResetRepository: Repository<PasswordResetToken>,
  ) {}

  async execute(
    handleResetPasswordDTO: HandleResetPasswordDTO,
  ): Promise<string> {
    const { password, passwordConfirmation, token, code } =
      handleResetPasswordDTO;

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
      }

      if (password === passwordConfirmation) {
        this.updateUserPasswordAndDeleteToken(resetToken, password);

        return 'Senha alterada com sucesso!';
      }

      throw new HttpException(
        'Senha e Confirmação de senha não são iguais!',
        HttpStatus.BAD_REQUEST,
      );
    }

    throw new HttpException('Token inválido!', HttpStatus.BAD_REQUEST);
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

  private updateUserPasswordAndDeleteToken(
    resetToken: PasswordResetToken,
    password: string,
  ) {
    const { user } = resetToken;

    user.password = password;
    user.hashPassword();

    this.userRepository.save(user);
    this.passwordResetRepository.delete({ id: resetToken.id });
  }
}
