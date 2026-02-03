// lib/resend.ts
import { Resend } from 'resend';

// Initialize Resend with your API key
export const resend = new Resend(process.env.RESEND_API_KEY);

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from?: string;
  replyTo?: string;
  cc?: string | string[];
  bcc?: string | string[];
  attachments?: Array<{
    filename: string;
    content: Buffer | string;
  }>;
}

export async function sendEmail(options: EmailOptions) {
  try {
    const from = options.from || process.env.EMAIL_FROM || 'support@emboditrust.com';
    
    const { data, error } = await resend.emails.send({
      from: from,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
      replyTo: options.replyTo,
      cc: options.cc,
      bcc: options.bcc,
      attachments: options.attachments,
    });

    if (error) {
      console.error('Error sending email:', error);
      throw error;
    }

    return {
      success: true,
      messageId: data?.id,
      data,
    };
  } catch (error) {
    console.error('Failed to send email:', error);
    return {
      success: false,
      error,
    };
  }
}

// Email template helper
export function createEmailTemplate({
  title,
  content,
  footerText = 'Emboditrust',
  actionButton,
}: {
  title: string;
  content: string;
  footerText?: string;
  actionButton?: {
    text: string;
    url: string;
  };
}) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          margin: 0;
          padding: 0;
          background-color: #f9fafb;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 40px 0;
          text-align: center;
          border-radius: 8px 8px 0 0;
        }
        .logo {
          color: white;
          font-size: 24px;
          font-weight: bold;
          text-decoration: none;
        }
        .content {
          background: white;
          padding: 40px;
          border-radius: 0 0 8px 8px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .title {
          font-size: 24px;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 20px;
        }
        .message {
          font-size: 16px;
          color: #4b5563;
          margin-bottom: 30px;
        }
        .button {
          display: inline-block;
          padding: 12px 24px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          text-decoration: none;
          border-radius: 6px;
          font-weight: 500;
        }
        .footer {
          text-align: center;
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #e5e7eb;
          color: #6b7280;
          font-size: 14px;
        }
        @media (max-width: 600px) {
          .container {
            padding: 10px;
          }
          .content {
            padding: 20px;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        
        <div class="content">
          <h1 class="title">${title}</h1>
          <div class="message">
            ${content}
          </div>
          ${actionButton ? `
            <div style="text-align: center; margin: 30px 0;">
              <a href="${actionButton.url}" class="button">${actionButton.text}</a>
            </div>
          ` : ''}
          <div class="footer">
            <p>${footerText}</p>
            <p>Copyright © ${new Date().getFullYear()} Emboditrust. All rights reserved.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}