// utils/mailer.js
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

async function enviarCorreo({ asunto, mensaje, destinatario, adjuntos }) {
  const mailOptions = {
    from: `"Web AquaEquipos" <${process.env.SMTP_USER}>`,
    to: destinatario,
    subject: asunto,
    text: mensaje,
    attachments: adjuntos || [], // Aquí agregas los adjuntos si los hay
  };

  await transporter.sendMail(mailOptions);
}

module.exports = { enviarCorreo };

console.log('mailer.js cargado, enviarCorreo es:', typeof enviarCorreo);

