import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { uuid } from 'uuidv4';
import * as nodemailer from 'nodemailer';
import { HttpException, HttpStatus } from '@nestjs/common';
import SMTPTransport from 'nodemailer/lib/smtp-transport';
import { PasswordResetToken, User } from '@app/common/database';

export class ResetPasswordUseCase {
  constructor(
    @InjectRepository(User) private usersRepository: Repository<User>,
    @InjectRepository(PasswordResetToken)
    private passwordResetRepository: Repository<PasswordResetToken>,
  ) {}

  async execute(email: string): Promise<string> {
    try {
      const user = await this.getUserByEmail(email);

      if (user) {
        const token = uuid();
        const resetToken = new PasswordResetToken(token, user);

        this.passwordResetRepository.save(resetToken);

        const mailTransporter = this.setupMailTransporter();

        await mailTransporter.sendMail({
          from: `"Estoque Total" <${process.env.NODEMAILER_USERNAME}>`,
          to: email,
          subject: 'Troca de senha - Plataforma Sold Metrics',
          html: `
          <p>Olá ${user.name},</p>
          <p>Você requisitou uma troca de senha. Clique no link abaixo para reseta-lá.</p>
          <p>${process.env.CLIENT_URL}/trocar-minha-senha?token=${token}</p>
          `,
        });

        return 'Email para troca de senha enviado!';
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

  setupMailTransporter(): nodemailer.Transporter<SMTPTransport.SentMessageInfo> {
    console.log(
      `process.env.NODEMAILER_USERNAME ${process.env.NODEMAILER_USERNAME}`,
    );

    return nodemailer.createTransport({
      host: process.env.NODEMAILER_HOST,
      port: parseInt(process.env.NODEMAILER_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.NODEMAILER_USERNAME,
        pass: process.env.NODEMAILER_PASSWORD,
      },
    });
  }

  async getUserByEmail(email: string): Promise<User> {
    return await this.usersRepository.findOneBy({ email });
  }
}
