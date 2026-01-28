import { Injectable } from '@nestjs/common';
import { Resend } from 'resend';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class EmailService {
  private resend: Resend;

  constructor() {
    this.resend = new Resend(process.env.RESEND_API_KEY);
  }

  async sendReminder(email: string, data: {
    displayName: string;
    teamName: string;
    checkInUrl: string;
    unsubscribeUrl: string;
  }) {
    const template = this.loadTemplate('reminder');
    const html = this.replacePlaceholders(template, data);

    await this.resend.emails.send({
      from: 'Team Pulse <noreply@team-pulse.com>',
      to: email,
      subject: `Daily Check-in Reminder - ${data.teamName}`,
      html,
    });
  }

  async sendDigest(email: string, data: {
    displayName: string;
    teamName: string;
    period: string;
    participationRate: number;
    activeMembers: number;
    totalMembers: number;
    checkIns: Array<{
      user: { displayName: string };
      today: string;
      blockers?: string;
    }>;
    teamUrl: string;
    unsubscribeUrl: string;
    frequency: string;
  }) {
    const template = this.loadTemplate('digest');
    let html = this.replacePlaceholders(template, data);

    // Replace check-ins loop
    const checkInsHtml = data.checkIns.map((checkIn) => `
      <div style="border-bottom: 1px solid #e5e7eb; padding: 15px 0;">
        <strong>${checkIn.user.displayName}</strong>
        <p style="margin: 5px 0; color: #6b7280;">${checkIn.today}</p>
        ${checkIn.blockers ? `<p style="color: #ef4444; margin: 5px 0;">🚧 ${checkIn.blockers}</p>` : ''}
      </div>
    `).join('');

    html = html.replace('{{#each checkIns}}', '').replace('{{/each}}', checkInsHtml);

    await this.resend.emails.send({
      from: 'Team Pulse <noreply@team-pulse.com>',
      to: email,
      subject: `${data.teamName} - ${data.period} Digest`,
      html,
    });
  }

  async sendWelcome(email: string, data: {
    displayName: string;
    dashboardUrl: string;
  }) {
    const template = this.loadTemplate('welcome');
    const html = this.replacePlaceholders(template, data);

    await this.resend.emails.send({
      from: 'Team Pulse <noreply@team-pulse.com>',
      to: email,
      subject: 'Welcome to Team Pulse!',
      html,
    });
  }

  async sendPasswordReset(email: string, data: {
    resetUrl: string;
  }) {
    // Simple password reset email
    const html = `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>Reset Your Password</h2>
        <p>Click the link below to reset your password:</p>
        <a href="${data.resetUrl}" style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a>
        <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">This link will expire in 1 hour.</p>
      </div>
    `;

    await this.resend.emails.send({
      from: 'Team Pulse <noreply@team-pulse.com>',
      to: email,
      subject: 'Reset Your Password',
      html,
    });
  }

  private loadTemplate(name: string): string {
    const templatePath = path.join(__dirname, 'templates', `${name}.html`);
    return fs.readFileSync(templatePath, 'utf-8');
  }

  private replacePlaceholders(template: string, data: Record<string, any>): string {
    let html = template;
    for (const [key, value] of Object.entries(data)) {
      const regex = new RegExp(`{{${key}}}`, 'g');
      html = html.replace(regex, String(value));
    }
    return html;
  }
}
