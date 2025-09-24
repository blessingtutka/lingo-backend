import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT) || 465,
    secure: true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

export async function sendEmail(to: string, subject: string, html: string) {
    const from = process.env.EMAIL_FROM || process.env.EMAIL_USER;

    try {
        await transporter.sendMail({
            from,
            to,
            subject,
            html,
        });
    } catch (err: any) {
        console.error('Email sending failed:', err.message);
        throw new Error('Failed to send email');
    }
}
