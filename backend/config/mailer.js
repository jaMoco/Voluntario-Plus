const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,      // ej: smtp.gmail.com
    port: process.env.SMTP_PORT,      // 587
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

const enviarCorreoVerificacion = async (email, token) => {
    const url = `http://localhost:5000/api/auth/verificar-email?token=${token}`;
    await transporter.sendMail({
        from: `"Voluntario+" <${process.env.SMTP_USER}>`,
        to: email,
        subject: 'Verifica tu cuenta en Voluntario+',
        html: `<h1>Bienvenido</h1><p>Haz clic en <a href="${url}">este enlace</a> para verificar tu cuenta.</p>`
    });
};

module.exports = { enviarCorreoVerificacion };