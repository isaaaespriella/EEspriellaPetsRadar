import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import nodemailer from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';
import { logger } from '../config/logger';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly transporter: nodemailer.Transporter<SMTPTransport.SentMessageInfo>;

  constructor(private readonly config: ConfigService) {
    const transportOptions: SMTPTransport.Options = {
      host: this.config.get<string>('SMTP_HOST')!,
      port: Number(this.config.get<string>('SMTP_PORT', '587')),
      secure: false,
      requireTLS: true,
    

      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 10000,

      auth: {
        user: this.config.get<string>('SMTP_USER')!,
        pass: this.config.get<string>('SMTP_PASS')!,
      },
    };

    this.transporter = nodemailer.createTransport(transportOptions);

    // 🔥 VERIFY FUERA del objeto
    this.transporter.verify((error) => {
      if (error) {
        console.error('SMTP VERIFY ERROR:', error);
      } else {
        console.log('SMTP READY');
      }
    });
  }

  async sendMatchEmail(params: {
    to: string;
    subject: string;
    html: string;
  }) {
    const from =
      this.config.get<string>('MAIL_FROM') ||
      this.config.get<string>('SMTP_USER') ||
      'petradar@localhost';

    try {
      await this.transporter.sendMail({
        from,
        to: params.to,
        subject: params.subject,
        html: params.html,
      });

      logger.info('Correo enviado', {
        to: params.to,
        subject: params.subject,
      });
    } catch (err) {
      this.logger.error('Error enviando correo', err as Error);
      throw err;
    }
  }
}