import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';

/**
 * SERVICIO DE CORREO REAL (Nodemailer)
 * Se configura mediante variables de entorno en el archivo .env
 */

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true', // true para puerto 465, false para otros
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

export async function sendInvitationEmail({
    to,
    name,
    link,
    role
}: {
    to: string;
    name: string;
    link: string;
    role: string
}) {
    const mailOptions = {
        from: `"La Púrpura Territorio" <${process.env.SMTP_FROM || '[email protected]'}>`,
        to: to,
        subject: 'Invitación a La Púrpura Territorio',
        html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
        <h2 style="color: #851c74;">¡Hola ${name}!</h2>
        <p>Has sido invitado a unirte a <strong>La Púrpura Territorio</strong> con el rol de <strong>${role}</strong>.</p>
        <p>Para activar tu cuenta y establecer tu contraseña, haz clic en el siguiente enlace:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${link}" style="background-color: #851c74; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">Activar Mi Cuenta</a>
        </div>
        <p style="font-size: 12px; color: #666;">Este enlace expirará en 48 horas.</p>
        <hr style="border: none; border-top: 1px solid #eee;" />
        <p style="font-size: 10px; color: #999;">Si no esperabas esta invitación, puedes ignorar este correo.</p>
      </div>
    `,
    };

    // Log local para depuración (siempre guardamos una copia local)
    const logEntry = `\n[${new Date().toLocaleString()}] Correo para ${to} (${role}): ${link}\n`;
    try {
        const logPath = path.join(process.cwd(), 'invites_sent.log');
        fs.appendFileSync(logPath, logEntry);
    } catch (e) {
        console.error("Error writing to log file", e);
    }

    // Intentar envío real si hay configuración
    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
        try {
            const info = await transporter.sendMail(mailOptions);
            console.log('[EMAIL] Correo enviado exitosamente:', info.messageId);
            return { success: true, messageId: info.messageId };
        } catch (error) {
            console.error('[EMAIL ERROR] Error al enviar correo real:', error);
            return { success: false, error };
        }
    } else {
        console.log('[EMAIL] Configuración SMTP incompleta. Correo registrado solo en log local.');
        return { success: true, simulated: true };
    }
}
