import { Injectable } from '@nestjs/common';

@Injectable()
export class MailService {
  private brevo: any;

  constructor() {
    const Brevo = require('@getbrevo/brevo');

    this.brevo = new Brevo.TransactionalEmailsApi();

    this.brevo.setApiKey(
      Brevo.TransactionalEmailsApiApiKeys.apiKey,
      process.env.BREVO_API_KEY,
    );
  }

  async sendMatchEmail(params: {
    to: string;
    subject: string;
    html: string;
  }) {
    try {
      const email = {
        sender: {
          email: process.env.MAIL_FROM,
          name: 'PetRadar',
        },
        to: [{ email: params.to }],
        subject: params.subject,
        htmlContent: params.html,
      };

      await this.brevo.sendTransacEmail(email);

      console.log('Correo enviado OK');
    } catch (error) {
      console.error('Error enviando correo', error);
      throw error;
    }
  }
}