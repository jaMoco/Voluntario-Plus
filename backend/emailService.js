const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: process.env.EMAIL_PORT === '465', // true para 465, false para 587,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
        tls: {
        // Esto evita errores de conexión en entornos locales con certificados autofirmados
        rejectUnauthorized: false
    }

});

// Verificar la conexión con Gmail al iniciar
transporter.verify((error, success) => {
    if (error) {
        console.error("❌ Error en la configuración de correo:", error.message);
    } else {
        console.log("✅ Servidor de correo listo para enviar mensajes");
    }
});

const sendVerificationEmail = async (email, token) => {
    const verificationUrl = `${process.env.APP_URL}/api/auth/verify-email?token=${token}`;
    
    const mailOptions = {
        from: `"Voluntario+ Support" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Verifica tu correo electrónico",
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
                <h2 style="color: #2c3e50; text-align: center;">¡Bienvenido a Voluntario+!</h2>
                <p>Gracias por registrarte. Por favor, verifica tu dirección de correo electrónico haciendo clic en el siguiente botón para activar tu cuenta:</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${verificationUrl}" style="background-color: #3498db; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">Verificar Mi Cuenta</a>
                </div>
                <p style="font-size: 12px; color: #7f8c8d;">Si el botón no funciona, copia y pega este enlace en tu navegador: <br/> ${verificationUrl}</p>
                <p style="font-size: 14px; color: #e74c3c;"><strong>Nota: Este enlace expirará en 24 horas.</strong></p>
            </div>
        `,
    };

    try {
        console.log(`Intentando enviar correo a: ${email}...`);
        await transporter.sendMail(mailOptions);
        console.log(`📧 Correo de verificación enviado exitosamente a ${email}`);
    } catch (error) {
        console.error("Error al enviar el correo de verificación:", error);
        throw new Error("No se pudo enviar el correo de verificación");
    }
};

const sendPasswordResetEmail = async (email, token) => {
    const resetUrl = `${process.env.CORS_ORIGIN || 'http://localhost:5173'}/reset-password?token=${token}`;
    
    const mailOptions = {
        from: `"Voluntario+ Support" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Restablece tu contraseña de Voluntario+",
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
                <h2 style="color: #2c3e50; text-align: center;">¿Olvidaste tu contraseña?</h2>
                <p>Hemos recibido una solicitud para restablecer la contraseña de tu cuenta. Haz clic en el siguiente botón para continuar:</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${resetUrl}" style="background-color: #e67e22; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">Restablecer Contraseña</a>
                </div>
                <p>Si no solicitaste esto, puedes ignorar este correo de forma segura.</p>
                <p style="font-size: 12px; color: #7f8c8d;">Si el botón no funciona, copia y pega este enlace en tu navegador: <br/> ${resetUrl}</p>
                <p style="font-size: 14px; color: #e74c3c;"><strong>Nota: Este enlace expirará en 1 hora.</strong></p>
            </div>
        `,
    };

    try {
        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error("Error al enviar el correo de restablecimiento:", error);
        throw new Error("No se pudo enviar el correo de restablecimiento");
    }
};

module.exports = { sendVerificationEmail, sendPasswordResetEmail };