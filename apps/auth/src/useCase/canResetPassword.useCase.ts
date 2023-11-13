import { PasswordResetToken } from '@app/common/database';
import { InjectRepository } from '@nestjs/typeorm';
import * as moment from 'moment';
import { Repository } from 'typeorm';

export class CanResetPasswordUseCase {
  constructor(
    @InjectRepository(PasswordResetToken)
    private passwordResetRepository: Repository<PasswordResetToken>,
  ) {}

  async execute(token: string, code: string): Promise<boolean> {
    const resetToken: PasswordResetToken =
      await this.passwordResetRepository.findOneBy({ token });

    if (resetToken) {
      return (
        moment(resetToken.expiryDate).isAfter(moment()) &&
        resetToken.code === code
      );
    }

    return false;
  }
}
