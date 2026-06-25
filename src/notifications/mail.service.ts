import { Injectable } from '@nestjs/common';

@Injectable()
export class MailService {
  async sendMatchEmail(params: {
    to: string;
    subject: string;
    html: string;
  }) {
    try {
      const response = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'api-key': process.env.BREVO_API_KEY!,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sender: {
            email: process.env.MAIL_FROM!,
            name: 'PetRadar',
          },
          to: [{ email: params.to }],
          subject: params.subject,
          htmlContent: params.html,
        }),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Brevo API error: ${text}`);
      }

      console.log('Correo enviado OK');
    } catch (error) {
      console.error('Error enviando correo', error);
      throw error;
    }
  }
}