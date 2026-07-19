import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter | null = null;

  constructor(private configService: ConfigService) {
    const host = this.configService.get('SMTP_HOST');
    const user = this.configService.get('SMTP_USER');
    const pass = this.configService.get('SMTP_PASSWORD');

    if (host && user && pass && !host.includes('example.com')) {
      this.transporter = nodemailer.createTransport({
        host,
        port: Number(this.configService.get('SMTP_PORT') || 587),
        secure: false,
        auth: { user, pass },
      });
    }
  }

  async sendMail(options: {
    to: string;
    subject: string;
    html: string;
    text?: string;
  }) {
    const from =
      this.configService.get('SMTP_FROM') ||
      this.configService.get('SMTP_USER') ||
      'noreply@sorteagora.com';

    if (!this.transporter) {
      this.logger.log(`[MAIL DEV] To: ${options.to} | ${options.subject}`);
      this.logger.log(options.text || options.html);
      return { queued: false, mode: 'log' as const };
    }

    await this.transporter.sendMail({
      from,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    });

    return { queued: true, mode: 'smtp' as const };
  }

  async sendPasswordReset(to: string, resetUrl: string) {
    return this.sendMail({
      to,
      subject: 'SORTE AGORA — Redefinição de senha',
      text: `Use este link para redefinir sua senha: ${resetUrl}`,
      html: `<p>Olá,</p><p>Clique para redefinir sua senha:</p><p><a href="${resetUrl}">${resetUrl}</a></p><p>O link expira em 1 hora.</p>`,
    });
  }
}
