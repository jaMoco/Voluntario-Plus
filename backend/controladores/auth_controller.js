const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const pool = require('../config/db');
const { validarEmail, validarPasswordFuerte } = require('../utilidades/validadores');
const crypto = require('crypto');
const { sendVerificationEmail, sendPasswordResetEmail } = require('../emailService');
const { verifyCaptcha } = require('../utilidades/captcha');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const authController = {
    registrarVoluntario: async (req, res) => {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            const {
                email, password,
                nombre_completo, cedula, edad, fecha_nacimiento,
                tiene_discapacidad, discapacidad_categoria, 
                discapacidad_nivel, tipo_discapacidad,
                es_estudiante, requiere_servicio_comunitario,
                universidad, carrera, mencion, semestre,
                telefono, ubicacion_pais, ubicacion_estado, ubicacion_municipio,
                ubicacion_direccion, codigo_postal
            } = req.body;
            const { captchaToken } = req.body;
            console.log('Token recibido:', captchaToken);
            if (!captchaToken || !(await verifyCaptcha(captchaToken))) {
                return res.status(400).json({ error: 'Captcha inválido. Por favor, marca "No soy un robot".' });
            }

            // Validaciones
            if (!email || !password || !nombre_completo || !cedula) {
                return res.status(400).json({ error: 'Faltan campos obligatorios' });
            }

            // Validar rango de cédula (Backend)
            const numCedula = parseInt(cedula.replace(/\D/g, ''), 10);
            if (isNaN(numCedula) || numCedula < 2000000 || numCedula > 33000000) {
                return res.status(400).json({ error: 'La cédula de identidad debe estar entre 2,000,000 y 33,000,000' });
            }

            if (!validarEmail(email)) return res.status(400).json({ error: 'Email inválido' });
            if (!validarPasswordFuerte(password)) {
                return res.status(400).json({ error: 'La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial' });
            }
            if (password === 'Voluntario123%') {
                return res.status(400).json({ error: 'No puedes utilizar la contraseña de ejemplo por razones de seguridad.' });
            }

            // Validar edad y fecha de nacimiento (Backend)
            if (fecha_nacimiento) {
                const hoy = new Date();
                const nacimiento = new Date(fecha_nacimiento);
                let edadCalculada = hoy.getFullYear() - nacimiento.getFullYear();
                const m = hoy.getMonth() - nacimiento.getMonth();
                if (m < 0 || (m === 0 && hoy.getDate() < nacimiento.getDate())) {
                    edadCalculada--;
                }

                // Validar que coincida con el campo edad si se proporcionó
                if (edad && parseInt(edad) !== edadCalculada) {
                    return res.status(400).json({ error: 'La edad proporcionada no coincide con la fecha de nacimiento' });
                }

                if (edadCalculada < 16) {
                    return res.status(400).json({ error: 'Debes tener al menos 16 años para registrarte como voluntario.' });
                }
            } else if (edad && parseInt(edad) < 16) {
                return res.status(400).json({ error: 'Debes tener al menos 16 años para registrarte como voluntario.' });
            }

            // Verificar si email o cédula ya existen
            const [existeEmail] = await connection.query('SELECT id FROM usuarios WHERE email = ?', [email]);
            if (existeEmail.length) return res.status(400).json({ error: 'Email ya registrado' });
            const [existeCedula] = await connection.query('SELECT usuario_id FROM voluntarios WHERE cedula = ?', [cedula]);
            if (existeCedula.length) return res.status(400).json({ error: 'Cédula ya registrada' });

            if (telefono) {
                const [existeTlf] = await connection.query('SELECT usuario_id FROM voluntarios WHERE telefono = ?', [telefono]);
                if (existeTlf.length) return res.status(400).json({ error: 'El teléfono ya está registrado por otro voluntario' });
            }

            // Crear usuario
            const salt = bcrypt.genSaltSync(10);
            const password_hash = bcrypt.hashSync(password, salt);

            const verificationToken = crypto.randomBytes(32).toString('hex');
            const tokenExpiration = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 horas

            const [userResult] = await connection.query(
                'INSERT INTO usuarios (email, password, rol, email_verificado, token_verificacion, token_expiracion) VALUES (?, ?, ?, FALSE, ?, ?)',
                [email, password_hash, 'voluntario', verificationToken, tokenExpiration]
            );
            const usuario_id = userResult.insertId;

            // Insertar en voluntarios
            await connection.query(
                `INSERT INTO voluntarios (
                    usuario_id, nombre_completo, cedula, edad, fecha_nacimiento, 
                    tiene_discapacidad, discapacidad_categoria, discapacidad_nivel, 
                    tipo_discapacidad, es_estudiante,
                    requiere_servicio_comunitario, universidad, carrera, mencion, semestre,
                    telefono, ubicacion_pais, ubicacion_estado, ubicacion_municipio,
                    ubicacion_direccion, codigo_postal
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [usuario_id, nombre_completo, cedula, edad || null, fecha_nacimiento || null, 
                 tiene_discapacidad || false, discapacidad_categoria || null, discapacidad_nivel || null, 
                 tipo_discapacidad || null, es_estudiante || false,
                 requiere_servicio_comunitario || false, universidad || null, carrera || null,
                 mencion || null, semestre || null, telefono || null, ubicacion_pais || null,
                 ubicacion_estado || null, ubicacion_municipio || null, ubicacion_direccion || null,
                 codigo_postal || null]
            );

            // Registrar actividad
            await connection.query(
                'INSERT INTO actividades_usuario (usuario_id, titulo, descripcion) VALUES (?, ?, ?)',
                [usuario_id, 'Registro exitoso', 'Te has registrado como voluntario en la plataforma.']
            );

            // Notificar a los administradores sobre el nuevo voluntario
            await connection.query(
                'INSERT INTO notificaciones (usuario_id, tipo, mensaje) SELECT id, "sistema", ? FROM usuarios WHERE rol = "admin"',
                [`Nuevo voluntario registrado: ${nombre_completo}`]
            );

            await connection.commit();

            await sendVerificationEmail(email, verificationToken);

            res.status(201).json({ 
                message: 'Registro exitoso. Por favor, revisa tu correo para verificar tu cuenta.',
                requireVerification: true 
            });
        } catch (error) {
            await connection.rollback();
            console.error(error);
            res.status(500).json({ error: 'Error interno del servidor' });
        } finally {
            connection.release();
        }
    },

    registrarOrganizacion: async (req, res) => {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            const {
                email, password,
                nombre_oficial, nombre_comercial, tipo_organizacion, otro_tipo,
                rif, pais_constitucion, sitio_web,
                direccion_fiscal, ciudad_estado, codigo_postal,
                telefono_principal, telefono_secundario, email_oficial,
                representante_nombre, representante_cedula, representante_cargo,
                representante_email_personal, representante_telefono,
                sector_industria, num_empleados, descripcion, como_conocio
            } = req.body;

            const { captchaToken } = req.body;
            console.log('Token reCAPTCHA Organización recibido:', captchaToken);
            
            if (!captchaToken || !(await verifyCaptcha(captchaToken))) {
                return res.status(400).json({ error: 'Captcha inválido. Por favor, marca "No soy un robot".' });
            }

            if (!email || !password || !nombre_oficial || !rif || !representante_nombre) {
                return res.status(400).json({ error: 'Faltan campos obligatorios' });
            }

            const rifRegex = /^[GJ]-\d{8}-\d$/;
            if (!rifRegex.test(rif)) {
                return res.status(400).json({ error: 'El RIF debe tener el formato J-12345678-0 o G-12345678-0' });
            }

            if (!validarEmail(email)) return res.status(400).json({ error: 'Email inválido' });
            if (!validarPasswordFuerte(password)) return res.status(400).json({ error: 'Contraseña no cumple requisitos' });
            if (password === 'Voluntario123%') {
                return res.status(400).json({ error: 'No puedes utilizar la contraseña de ejemplo por razones de seguridad.' });
            }

            const [existeEmail] = await connection.query('SELECT id FROM usuarios WHERE email = ?', [email]);
            if (existeEmail.length) return res.status(400).json({ error: 'Email ya registrado' });
            const [existeRif] = await connection.query('SELECT usuario_id FROM organizaciones WHERE rif = ?', [rif]);
            if (existeRif.length) return res.status(400).json({ error: 'RIF ya registrado' });

            // Validar campos únicos adicionales para organizaciones
            const [existeCampos] = await connection.query(
                `SELECT nombre_oficial, nombre_comercial, sitio_web, email_oficial, telefono_principal 
                 FROM organizaciones 
                 WHERE nombre_oficial = ? OR nombre_comercial = ? OR sitio_web = ? OR email_oficial = ? OR telefono_principal = ?`,
                [nombre_oficial, nombre_comercial || null, sitio_web || null, email_oficial, telefono_principal]
            );

            if (existeCampos.length) {
                return res.status(400).json({ error: 'Uno de los datos proporcionados (Nombre, Sitio Web, Correo Oficial o Teléfono) ya está registrado' });
            }

            const salt = bcrypt.genSaltSync(10);
            const password_hash = bcrypt.hashSync(password, salt);

            const verificationToken = crypto.randomBytes(32).toString('hex');
            const tokenExpiration = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 horas

            const [userResult] = await connection.query(
                'INSERT INTO usuarios (email, password, rol, email_verificado, token_verificacion, token_expiracion) VALUES (?, ?, ?, FALSE, ?, ?)',
                [email, password_hash, 'organizacion', verificationToken, tokenExpiration]
            );
            const usuario_id = userResult.insertId;

            await connection.query(
                `INSERT INTO organizaciones (
                    usuario_id, nombre_oficial, nombre_comercial, tipo_organizacion, otro_tipo,
                    rif, pais_constitucion, sitio_web, direccion_fiscal, ciudad_estado,
                    codigo_postal, telefono_principal, telefono_secundario, email_oficial,
                    representante_nombre, representante_cedula, representante_cargo,
                    representante_email_personal, representante_telefono, sector_industria,
                    num_empleados, descripcion, como_conocio
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [usuario_id, nombre_oficial, nombre_comercial || null, tipo_organizacion, otro_tipo || null,
                 rif, pais_constitucion || 'Venezuela', sitio_web || null, direccion_fiscal, ciudad_estado,
                 codigo_postal || null, telefono_principal, telefono_secundario || null, email_oficial,
                 representante_nombre, representante_cedula, representante_cargo,
                 representante_email_personal || null, representante_telefono || null, sector_industria || null,
                 num_empleados || null, descripcion || null, como_conocio || null]
            );

            // Registrar actividad
            await connection.query(
                'INSERT INTO actividades_usuario (usuario_id, titulo, descripcion) VALUES (?, ?, ?)',
                [usuario_id, 'Registro exitoso', 'Tu organización ha sido registrada exitosamente.']
            );

            // Envío del correo
            await sendVerificationEmail(email, verificationToken);

            // Notificar a los administradores sobre la nueva organización
            await connection.query(
                'INSERT INTO notificaciones (usuario_id, tipo, mensaje) SELECT id, "sistema", ? FROM usuarios WHERE rol = "admin"',
                [`Nueva organización registrada: ${nombre_oficial}`]
            );

            await connection.commit();
            res.status(201).json({ 
                message: 'Registro exitoso. Por favor, revisa tu correo para verificar tu cuenta.',
                requireVerification: true 
            });
        } catch (error) {
            await connection.rollback();
            console.error(error);
            res.status(500).json({ error: 'Error interno del servidor' });
        } finally {
            connection.release();
        }
    },

    registrarAdmin: async (req, res) => {
        try {
            const { email, password } = req.body;

            // Validaciones básicas
            if (!email || !password) {
                return res.status(400).json({ error: 'Email y contraseña son obligatorios' });
            }
            if (!validarEmail(email)) return res.status(400).json({ error: 'Email inválido' });
            if (!validarPasswordFuerte(password)) {
                return res.status(400).json({ error: 'La contraseña no cumple con los requisitos mínimos' });
            }

            const [existe] = await pool.query('SELECT id FROM usuarios WHERE email = ?', [email]);
            if (existe.length > 0) return res.status(400).json({ error: 'El email ya está registrado' });

            const salt = bcrypt.genSaltSync(10);
            const password_hash = bcrypt.hashSync(password, salt);

            await pool.query(
                'INSERT INTO usuarios (email, password, rol, email_verificado) VALUES (?, ?, ?, TRUE)',
                [email, password_hash, 'admin']
            );

            res.status(201).json({ message: 'Administrador creado exitosamente' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error al registrar administrador' });
        }
    },

    login: async (req, res) => {
        const { email, password, captchaToken } = req.body;

        try {
            // Verificación de seguridad con reCAPTCHA (opcional en login, recomendado tras fallos)
            if (captchaToken && !(await verifyCaptcha(captchaToken))) {
                return res.status(400).json({ error: 'Verificación de seguridad fallida. Inténtalo de nuevo.' });
            }

            const [rows] = await pool.query(`
                SELECT u.*, 
                       COALESCE(v.nombre_completo, o.nombre_oficial) as nombre,
                       v.tiene_discapacidad, v.discapacidad_categoria, v.discapacidad_nivel, v.tipo_discapacidad
                FROM usuarios u
                LEFT JOIN voluntarios v ON u.id = v.usuario_id
                LEFT JOIN organizaciones o ON u.id = o.usuario_id
                WHERE u.email = ?`, [email]);
                
            if (rows.length === 0) return res.status(401).json({ error: 'Credenciales inválidas' });
            const user = rows[0];

            // Verificar si el email ha sido confirmado
            if (user.rol !== 'admin' && !user.email_verificado) {
                return res.status(403).json({ error: 'Tu cuenta aún no ha sido verificada. Por favor, revisa tu correo electrónico.' });
            }

            const valid = bcrypt.compareSync(password, user.password);
            if (!valid) return res.status(401).json({ error: 'Credenciales inválidas' });
            
            const userData = { 
                id: user.id, 
                email: user.email, 
                rol: user.rol, 
                nombre: user.nombre,
                foto_perfil: user.foto_perfil,
                tiene_discapacidad: !!user.tiene_discapacidad, // Convertir a boolean real
                discapacidad_categoria: user.discapacidad_categoria,
                discapacidad_nivel: user.discapacidad_nivel,
                tipo_discapacidad: user.tipo_discapacidad
            };

            // Registrar actividad de inicio de sesión
            await pool.query('INSERT INTO actividades_usuario (usuario_id, titulo, descripcion) VALUES (?, ?, ?)', 
                [user.id, 'Inicio de sesión', 'Has iniciado sesión en el sistema.']);

            const token = jwt.sign(userData, process.env.JWT_SECRET, { expiresIn: '24h' });
            res.json({ token, user: userData });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error interno' });
        }
    },

    verifyEmail: async (req, res) => {
        const { token } = req.query;
        if (!token) return res.status(400).json({ error: 'Token no proporcionado' });

        try {
            const sql = `SELECT * FROM usuarios WHERE token_verificacion = ? AND token_expiracion > NOW()`;
            const [users] = await pool.query(sql, [token]);

            if (users.length === 0) {
                return res.status(400).json({ error: 'Token inválido o expirado' });
            }

            const user = users[0];
            const updateSql = `UPDATE usuarios SET email_verificado = TRUE, token_verificacion = NULL, token_expiracion = NULL WHERE id = ?`;
            await pool.query(updateSql, [user.id]);

            res.status(200).send(`
                <html>
                    <body style="text-align: center; padding: 40px; font-family: sans-serif; background-color: #f8f9fa;">
                        <div style="max-width: 500px; margin: auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                            <h2 style="color: #27ae60;">¡Correo verificado con éxito!</h2>
                            <p>Tu cuenta ha sido activada en <strong>Voluntario+</strong>.</p>
                            <p>Ya puedes cerrar esta ventana e iniciar sesión en la plataforma.</p>
                            <a href="${process.env.CORS_ORIGIN || 'http://localhost:5173'}/login" style="display: inline-block; margin-top: 20px; background-color: #3498db; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Ir al Login</a>
                        </div>
                    </body>
                </html>
            `);
        } catch (error) {
            console.error('Error en verificación:', error);
            res.status(500).json({ error: 'Error interno del servidor' });
        }
    },

    googleLogin: async (req, res) => {
        const { credential } = req.body;
        try {
            // 1. Verificar el ID Token con Google
            const ticket = await googleClient.verifyIdToken({
                idToken: credential,
                audience: process.env.GOOGLE_CLIENT_ID
            });
            const payload = ticket.getPayload();
            const { email, name, picture } = payload;

            // 2. Buscar si el usuario ya existe en nuestra base de datos
            const [rows] = await pool.query(`
                SELECT u.*, 
                       COALESCE(v.nombre_completo, o.nombre_oficial) as nombre,
                       v.tiene_discapacidad, v.discapacidad_categoria, v.discapacidad_nivel, v.tipo_discapacidad
                FROM usuarios u
                LEFT JOIN voluntarios v ON u.id = v.usuario_id
                LEFT JOIN organizaciones o ON u.id = o.usuario_id
                WHERE u.email = ?`, [email]);
                
            if (rows.length === 0) {
                // Si el usuario no existe, devolvemos sus datos básicos para que complete el registro manual
                // (Cédula, RIF, etc., son campos obligatorios que Google no proporciona)
                return res.status(200).json({ 
                    nuevo_usuario: true, 
                    user: { email, nombre: name, foto: picture } 
                });
            }

            const user = rows[0];
            if (!user.activo) return res.status(403).json({ error: 'Tu cuenta ha sido desactivada. Contacta al soporte.' });

            const userData = { 
                id: user.id, 
                email: user.email, 
                rol: user.rol, 
                nombre: user.nombre,
                foto_perfil: user.foto_perfil,
                tiene_discapacidad: !!user.tiene_discapacidad,
                discapacidad_categoria: user.discapacidad_categoria,
                discapacidad_nivel: user.discapacidad_nivel,
                tipo_discapacidad: user.tipo_discapacidad
            };

            // Registrar actividad de inicio de sesión con Google
            await pool.query('INSERT INTO actividades_usuario (usuario_id, titulo, descripcion) VALUES (?, ?, ?)', 
                [user.id, 'Inicio de sesión', 'Has iniciado sesión usando tu cuenta de Google.']);

            const token = jwt.sign(userData, process.env.JWT_SECRET, { expiresIn: '24h' });
            res.json({ token, user: userData });
        } catch (error) {
            console.error('Error en Google Login:', error);
            res.status(400).json({ error: 'No se pudo completar la autenticación con Google' });
        }
    },

    facebookLogin: async (req, res) => {
        const { accessToken, userID } = req.body;
        try {
            // 1. Verificar el token con la API Graph de Facebook
            const fbResponse = await fetch(`https://graph.facebook.com/v18.0/me?fields=id,name,email,picture.type(large)&access_token=${accessToken}`);
            const fbData = await fbResponse.json();

            if (fbData.error || fbData.id !== userID) {
                return res.status(400).json({ error: 'Token de Facebook inválido' });
            }

            const { email, name } = fbData;
            const picture = fbData.picture?.data?.url;

            if (!email) {
                return res.status(400).json({ error: 'Facebook no proporcionó un correo electrónico. Por favor, asegúrate de que tu cuenta de Facebook tenga un correo asociado.' });
            }

            // 2. Buscar si el usuario ya existe
            const [rows] = await pool.query(`
                SELECT u.*, 
                       COALESCE(v.nombre_completo, o.nombre_oficial) as nombre,
                       v.tiene_discapacidad, v.discapacidad_categoria, v.discapacidad_nivel, v.tipo_discapacidad
                FROM usuarios u
                LEFT JOIN voluntarios v ON u.id = v.usuario_id
                LEFT JOIN organizaciones o ON u.id = o.usuario_id
                WHERE u.email = ?`, [email]);
                
            if (rows.length === 0) {
                return res.status(200).json({ 
                    nuevo_usuario: true, 
                    user: { email, nombre: name, foto: picture } 
                });
            }

            const user = rows[0];
            if (!user.activo) return res.status(403).json({ error: 'Tu cuenta ha sido desactivada. Contacta al soporte.' });

            const userData = { 
                id: user.id, 
                email: user.email, 
                rol: user.rol, 
                nombre: user.nombre,
                foto_perfil: user.foto_perfil,
                tiene_discapacidad: !!user.tiene_discapacidad,
                discapacidad_categoria: user.discapacidad_categoria,
                discapacidad_nivel: user.discapacidad_nivel,
                tipo_discapacidad: user.tipo_discapacidad
            };

            // Registrar actividad de inicio de sesión con Facebook
            await pool.query('INSERT INTO actividades_usuario (usuario_id, titulo, descripcion) VALUES (?, ?, ?)', 
                [user.id, 'Inicio de sesión', 'Has iniciado sesión usando tu cuenta de Facebook.']);

            const token = jwt.sign(userData, process.env.JWT_SECRET, { expiresIn: '24h' });
            res.json({ token, user: userData });
        } catch (error) {
            console.error('Error en Facebook Login:', error);
            res.status(400).json({ error: 'No se pudo completar la autenticación con Facebook' });
        }
    },

    forgotPassword: async (req, res) => {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ error: 'El correo electrónico es requerido.' });
        }

        try {
            const [users] = await pool.query('SELECT * FROM usuarios WHERE email = ?', [email]);

            if (users.length > 0) {
                const user = users[0];
                const resetToken = crypto.randomBytes(32).toString('hex');
                const resetExpiration = new Date(Date.now() + 60 * 60 * 1000); // 1 hora

                await pool.query(
                    'UPDATE usuarios SET token_reset_password = ?, token_reset_expiracion = ? WHERE id = ?',
                    [resetToken, resetExpiration, user.id]
                );

                // Enviar correo para restablecer contraseña
                await sendPasswordResetEmail(user.email, resetToken);

                res.json({ message: 'Enlace enviado con éxito.' });
            } else {
                return res.status(404).json({ error: 'No encontramos ninguna cuenta asociada a este correo. Por favor, verifica que el correo ingresado sea correcto o regístrate para crear una nueva cuenta.' });
            }

        } catch (error) {
            console.error('Error en forgotPassword:', error);
            res.status(500).json({ error: 'Error interno del servidor.' });
        }
    },

    forgotPasswordAlternative: async (req, res) => {
        const { email, telefono, documento } = req.body;

        if (!email || !telefono || !documento) {
            return res.status(400).json({ error: 'El correo, teléfono y documento (Cédula/RIF) son obligatorios.' });
        }

        try {
            const [users] = await pool.query(`
                SELECT u.id, u.email, 
                       v.telefono AS vol_tel, v.cedula, 
                       o.telefono_principal AS org_tel, o.rif
                FROM usuarios u
                LEFT JOIN voluntarios v ON u.id = v.usuario_id
                LEFT JOIN organizaciones o ON u.id = o.usuario_id
                WHERE u.email = ?`, 
                [email]
            );

            if (users.length === 0) {
                return res.status(404).json({ error: 'No encontramos ninguna cuenta con esos datos.' });
            }

            const user = users[0];
            
            // Función para limpiar formatos (quita guiones, espacios, paréntesis) para una comparación exacta
            const cleanStr = (str) => (str !== null && str !== undefined) ? String(str).replace(/[^a-zA-Z0-9]/g, '').toUpperCase() : null;
            
            const inputTel = cleanStr(telefono);
            const inputDoc = cleanStr(documento);

            const isVoluntarioMatch = (cleanStr(user.vol_tel) === inputTel && cleanStr(user.cedula) === inputDoc);
            const isOrganizacionMatch = (cleanStr(user.org_tel) === inputTel && cleanStr(user.rif) === inputDoc);

            if (!isVoluntarioMatch && !isOrganizacionMatch) {
                return res.status(400).json({ error: 'Los datos de seguridad proporcionados no coinciden con nuestros registros.' });
            }

            // Datos válidos, generar token con una vida corta (15 minutos) para uso inmediato
            const resetToken = crypto.randomBytes(32).toString('hex');
            const resetExpiration = new Date(Date.now() + 15 * 60 * 1000); 

            await pool.query(
                'UPDATE usuarios SET token_reset_password = ?, token_reset_expiracion = ? WHERE id = ?',
                [resetToken, resetExpiration, user.id]
            );

            // Devolvemos el token para que el frontend redirija de inmediato a cambiar la contraseña
            res.json({ message: 'Identidad verificada con éxito.', token: resetToken });
        } catch (error) {
            console.error('Error en forgotPasswordAlternative:', error);
            res.status(500).json({ error: 'Error interno del servidor.' });
        }
    },

    resetPassword: async (req, res) => {
        const { token, password } = req.body;

        if (!token || !password) {
            return res.status(400).json({ error: 'El token y la nueva contraseña son requeridos.' });
        }

        if (!validarPasswordFuerte(password)) {
            return res.status(400).json({ error: 'La contraseña no cumple los requisitos de seguridad.' });
        }

        try {
            const [users] = await pool.query(
                'SELECT * FROM usuarios WHERE token_reset_password = ? AND token_reset_expiracion > NOW()',
                [token]
            );

            if (users.length === 0) {
                return res.status(400).json({ error: 'El token es inválido o ha expirado.' });
            }

            const user = users[0];
            const salt = bcrypt.genSaltSync(10);
            const password_hash = bcrypt.hashSync(password, salt);

            await pool.query(
                'UPDATE usuarios SET password = ?, token_reset_password = NULL, token_reset_expiracion = NULL WHERE id = ?',
                [password_hash, user.id]
            );

            res.json({ message: 'Tu contraseña ha sido actualizada exitosamente.' });

        } catch (error) {
            console.error('Error en resetPassword:', error);
            res.status(500).json({ error: 'Error interno del servidor.' });
        }
    },

    actualizarPerfilVoluntario: async (req, res) => {
        const usuario_id = req.usuario.id;
        const rol = req.usuario.rol;

        if (rol !== 'voluntario') {
            return res.status(403).json({ error: 'Acceso denegado.' });
        }

        const {
            nombre_completo, cedula, edad, fecha_nacimiento,
            telefono, ubicacion_pais, ubicacion_estado, ubicacion_municipio,
            ubicacion_direccion, codigo_postal, tiene_discapacidad,
            discapacidad_categoria, discapacidad_nivel, tipo_discapacidad,
            es_estudiante, requiere_servicio_comunitario, universidad,
            carrera, mencion, semestre
        } = req.body;

        try {
            await pool.query(
                `UPDATE voluntarios SET 
                    nombre_completo = ?, cedula = ?, edad = ?, fecha_nacimiento = ?, 
                    telefono = ?, ubicacion_pais = ?, ubicacion_estado = ?, ubicacion_municipio = ?,
                    ubicacion_direccion = ?, codigo_postal = ?, tiene_discapacidad = ?, 
                    discapacidad_categoria = ?, discapacidad_nivel = ?, tipo_discapacidad = ?, 
                    es_estudiante = ?, requiere_servicio_comunitario = ?, universidad = ?, 
                    carrera = ?, mencion = ?, semestre = ?
                WHERE usuario_id = ?`,
                [nombre_completo, cedula, edad || null, fecha_nacimiento || null,
                 telefono || null, ubicacion_pais || null, ubicacion_estado || null, ubicacion_municipio || null,
                 ubicacion_direccion || null, codigo_postal || null, tiene_discapacidad || false,
                 discapacidad_categoria || null, discapacidad_nivel || null, tipo_discapacidad || null,
                 es_estudiante || false, requiere_servicio_comunitario || false, universidad || null,
                 carrera || null, mencion || null, semestre || null, usuario_id]
            );

            // Registrar actividad
            await pool.query('INSERT INTO actividades_usuario (usuario_id, titulo, descripcion) VALUES (?, ?, ?)',
                [usuario_id, 'Perfil actualizado', 'Has actualizado la información de tu perfil personal.']
            );

            // Manejo de la foto de perfil (si se subió una)
            if (req.file) {
                const fotoPath = `/fotodeperfil/${req.file.filename}`;
                await pool.query('UPDATE usuarios SET foto_perfil = ? WHERE id = ?', [fotoPath, usuario_id]);
            }

            res.json({ message: 'Perfil actualizado exitosamente' });
        } catch (error) {
            console.error('Error en actualizarPerfilVoluntario SQL:', error.message);
            res.status(500).json({ error: 'Error al actualizar el perfil' });
        }
    },

    // Obtener lista pública de organizaciones para la página de bienvenida
    listarOrganizacionesPublicas: async (req, res) => {
        try {
            const [rows] = await pool.query(`
                SELECT 
                    usuario_id as id, 
                    nombre_oficial as nombre, 
                    ciudad_estado as ubicacion, 
                    descripcion 
                FROM organizaciones LIMIT 6`);
            res.json(rows);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error al obtener organizaciones' });
        }
    }
};

module.exports = authController;