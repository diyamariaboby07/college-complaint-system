import nodemailer from 'nodemailer';
import { env } from '../config/env.js';

let transporter = null;

const getTransporter = () => {
  if (transporter) return transporter;

  if (env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASSWORD) {
    transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: Number(env.SMTP_PORT) || 587,
      secure: Number(env.SMTP_PORT) === 465,
      auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASSWORD,
      },
    });
    console.log('📧 SMTP Email Transporter configured.');
  } else {
    // Graceful fallback dummy transporter
    transporter = {
      sendMail: async (options) => {
        console.log(`📧 [Simulated Email] To: ${options.to} | Subject: ${options.subject}`);
        return { messageId: 'simulated-email-' + Date.now() };
      },
    };
    console.log('ℹ️ SMTP credentials not provided. Using graceful simulated email logging.');
  }

  return transporter;
};

export const sendEmailNotification = async ({ to, subject, html, text }) => {
  try {
    const mailer = getTransporter();
    const result = await mailer.sendMail({
      from: env.EMAIL_FROM,
      to,
      subject,
      text: text || html.replace(/<[^>]+>/g, ''),
      html,
    });
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.warn(`⚠️ Email notification could not be sent (${error.message}). Continuing normally.`);
    return { success: false, error: error.message };
  }
};

export const generateEmailTemplate = ({ title, message, complaintId, actionUrl }) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px; background-color: #ffffff;">
      <div style="background: linear-gradient(135deg, #3b82f6, #1d4ed8); padding: 16px; border-radius: 6px; color: #ffffff; text-align: center;">
        <h2 style="margin: 0; font-size: 20px;">College Complaint Management System</h2>
      </div>
      <div style="padding: 20px 0;">
        <h3 style="color: #1e293b; margin-top: 0;">${title}</h3>
        <p style="color: #475569; font-size: 15px; line-height: 1.5;">${message}</p>
        ${
          complaintId
            ? `<div style="background-color: #f1f5f9; padding: 12px; border-radius: 6px; margin: 15px 0;">
                <strong style="color: #334155;">Complaint Reference:</strong> <span style="color: #2563eb; font-weight: bold;">${complaintId}</span>
              </div>`
            : ''
        }
      </div>
      <div style="border-top: 1px solid #e2e8f0; padding-top: 15px; text-align: center; color: #94a3b8; font-size: 12px;">
        <p>This is an automated notification from the Campus Helpdesk Portal.</p>
      </div>
    </div>
  `;
};
