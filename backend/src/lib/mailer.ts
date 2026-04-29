import nodemailer from 'nodemailer';

// Use SendGrid SMTP or fallback to Ethereal for dev
function createTransport() {
  if (process.env.SENDGRID_API_KEY) {
    return nodemailer.createTransport({
      host: 'smtp.sendgrid.net',
      port: 587,
      auth: {
        user: 'apikey',
        pass: process.env.SENDGRID_API_KEY,
      },
    });
  }

  // Dev fallback: use ethereal (fake SMTP) or mailtrap
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.ethereal.email',
    port: parseInt(process.env.SMTP_PORT || '587'),
    auth: {
      user: process.env.SMTP_USER || 'dev@example.com',
      pass: process.env.SMTP_PASS || 'devpassword',
    },
  });
}

const transporter = createTransport();

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from?: string;
}

export async function sendEmail(opts: EmailOptions): Promise<void> {
  if (process.env.NODE_ENV === 'test') return; // Skip email in tests

  await transporter.sendMail({
    from: opts.from || process.env.EMAIL_FROM || 'noreply@ats.example.com',
    to: Array.isArray(opts.to) ? opts.to.join(', ') : opts.to,
    subject: opts.subject,
    html: opts.html,
    text: opts.text || opts.html.replace(/<[^>]+>/g, ''),
  });
}

export const EmailTemplates = {
  candidateInvite: (candidateName: string, interviewDate: string, link: string) => ({
    subject: `Interview Invitation — ${interviewDate}`,
    html: `
      <h2>Interview Invitation</h2>
      <p>Dear ${candidateName},</p>
      <p>You have been invited for an interview on <strong>${interviewDate}</strong>.</p>
      <p><a href="${link}">Click here to confirm your availability</a></p>
      <p>Best regards,<br/>The Hiring Team</p>
    `,
  }),

  offerLetter: (candidateName: string, role: string, link: string) => ({
    subject: `Offer Letter — ${role}`,
    html: `
      <h2>Congratulations!</h2>
      <p>Dear ${candidateName},</p>
      <p>We are pleased to offer you the position of <strong>${role}</strong>.</p>
      <p><a href="${link}">Click here to view and accept your offer</a></p>
      <p>Best regards,<br/>The Hiring Team</p>
    `,
  }),

  applicationReceived: (candidateName: string, role: string) => ({
    subject: `Application Received — ${role}`,
    html: `
      <h2>Application Received</h2>
      <p>Dear ${candidateName},</p>
      <p>Thank you for applying for the <strong>${role}</strong> position.</p>
      <p>We will review your application and get back to you soon.</p>
      <p>Best regards,<br/>The Hiring Team</p>
    `,
  }),

  interviewReminder: (candidateName: string, interviewDate: string, location: string) => ({
    subject: `Interview Reminder — ${interviewDate}`,
    html: `
      <h2>Interview Reminder</h2>
      <p>Dear ${candidateName},</p>
      <p>This is a reminder of your interview on <strong>${interviewDate}</strong>.</p>
      <p>Location: ${location}</p>
      <p>Best regards,<br/>The Hiring Team</p>
    `,
  }),
};
