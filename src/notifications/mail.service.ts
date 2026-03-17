import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly transporter;

  constructor(private readonly config: ConfigService) {
    const service = this.config.get<string>('MAILER_SERVICE');
    const email = this.config.get<string>('MAILER_EMAIL');
    const password = this.config.get<string>('MAILER_PASSWORD');
    const host = this.config.get<string>('SMTP_HOST');

    this.transporter = nodemailer.createTransport(
      service
        ? {
            service,
            auth: email && password ? { user: email, pass: password } : undefined,
          }
        : {
            host,
            port: Number(this.config.get<string>('SMTP_PORT', '587')),
            secure: this.config.get<string>('SMTP_SECURE', 'false') === 'true',
            auth: this.config.get<string>('SMTP_USER')
              ? {
                  user: this.config.get<string>('SMTP_USER'),
                  pass: this.config.get<string>('SMTP_PASS'),
                }
              : undefined,
          },
    );
  }

  async sendMatchEmail(params: {
    to: string;
    subject: string;
    html: string;
  }) {
    const from =
      this.config.get<string>('MAIL_FROM') ||
      this.config.get<string>('MAILER_EMAIL') ||
      'petradar@localhost';
    try {
      await this.transporter.sendMail({
        from,
        to: params.to,
        subject: params.subject,
        html: params.html,
      });
    } catch (err) {
      this.logger.error('Error enviando correo', err as Error);
    }
  }
}

