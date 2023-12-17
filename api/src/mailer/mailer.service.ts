import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import Handlebars from 'handlebars';

@Injectable()
export class MailerService {
  private readonly transporter: nodemailer.Transporter;

  constructor(private readonly configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: configService.get('mailer.host'),
      port: configService.get('mailer.port'),
      secure: configService.get('mailer.secure'),
      ignoreTLS: configService.get('mailer.ignoreTLS'),
      requireTLS: configService.get('mailer.requireTLS'),
      auth: {
        user: configService.get('mailer.user'),
        pass: configService.get('mailer.password'),
      },
    });
  }

  async sendConfirmEmail(to: string, hash: string): Promise<void> {
    const url = new URL(
      `${this.configService.getOrThrow('app.webURL')}/confirm-email`,
    );

    const appName = this.configService.getOrThrow('app.name');
    const title = `Verify your email address on ${appName}`;

    url.searchParams.set('hash', hash);

    await this.sendMail({
      to: to,
      subject: title,
      text: `${url.toString()} ${title}`,
      templatePath: path.join(
        process.cwd(),
        'src',
        'mailer',
        'templates',
        'activation.hbs',
      ),
      context: {
        url,
        title,
        appName,
        actionTitle: title,
        text1: 'Hey!',
        text2: `You're almost ready to start enjoying`,
        text3:
          'Simply click the big green button below to verify your email address.',
      },
    });
  }

  private async sendMail({
    templatePath,
    context,
    ...mailOptions
  }: nodemailer.SendMailOptions & {
    templatePath: string;
    context: Record<string, unknown>;
  }): Promise<void> {
    let html: string | undefined;

    if (templatePath) {
      const template = await fs.readFile(templatePath, 'utf-8');

      html = Handlebars.compile(template, { strict: true })(context);
    }

    await this.transporter.sendMail({
      ...mailOptions,
      from: mailOptions.from
        ? mailOptions.from
        : `"${this.configService.get('mailer.defaultName', {
            infer: true,
          })}" <${this.configService.get('mailer.defaultEmail', {
            infer: true,
          })}>`,
      html: mailOptions.html ? mailOptions.html : html,
    });
  }
}
