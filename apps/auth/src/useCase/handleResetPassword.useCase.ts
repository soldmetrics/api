import { PasswordResetToken, User } from '@app/common/database';
import { HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as moment from 'moment';
import { Repository } from 'typeorm';
import { HandleResetPasswordDTO } from '../model/dto/handleResetPasswordDTO';

export class HandleResetPasswordUseCase {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(PasswordResetToken)
    private passwordResetRepository: Repository<PasswordResetToken>,
  ) {}

  async execute(
    handleResetPasswordDTO: HandleResetPasswordDTO,
  ): Promise<string> {
    const { password, passwordConfirmation } = handleResetPasswordDTO;
    const resetToken: PasswordResetToken =
      await this.passwordResetRepository.findOne({
        where: {
          token: handleResetPasswordDTO.token,
        },
        relations: {
          user: true,
        },
      });

    if (resetToken && moment(resetToken.expiryDate).isAfter(moment())) {
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
