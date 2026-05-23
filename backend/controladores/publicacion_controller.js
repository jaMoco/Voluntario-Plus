const pool = require('../config/db');

// Función auxiliar para procesar campos JSON de forma segura
const safeParseJSON = (val) => {
    if (!val || val === 'null') return [];
    if (typeof val === 'object') return val; // Por si acaso el driver lo parsea solo
    try { return JSON.parse(val); } catch (e) { console.error("Error parseando JSON:", e); return []; }
};

const publicacionController = {
    // Obtener lista de categorías para los formularios
    listarCategorias: async (req, res) => {
        try {
            const [rows] = await pool.query('SELECT id, nombre FROM categorias ORDER BY nombre ASC');
            res.json(rows);
        } catch (error) {
            console.error('Error al listar categorías:', error.message);
            res.status(500).json({ error: 'Error al obtener las categorías' });
        }
    },

    // Obtener el perfil de la organización logueada
    obtenerPerfil: async (req, res) => {
        const usuario_id = req.usuario.id;
        const rol = req.usuario.rol;

        // Verificación de seguridad: solo el rol 'organizacion' puede acceder a este endpoint
        if (rol !== 'organizacion') {
            return res.status(403).json({ error: 'Acceso denegado. Solo organizaciones pueden ver esta información.' });
        }

        try {
            const [rows] = await pool.query(
                'SELECT o.*, u.foto_perfil FROM organizaciones o JOIN usuarios u ON o.usuario_id = u.id WHERE o.usuario_id = ?',
                [usuario_id]
            );

            if (rows.length === 0) {
                return res.status(404).json({ 
                    error: 'Perfil no encontrado',
                    detalle: 'El usuario tiene rol de organización pero no existen datos legales registrados.' 
                });
            }

            res.json(rows[0]);
        } catch (error) {
            console.error('Error en obtenerPerfil SQL:', error.message);
            res.status(500).json({ error: 'Error al obtener los datos del perfil' });
        }
    },

    // Actualizar el perfil de la organización logueada
    actualizarPerfil: async (req, res) => {
        const usuario_id = req.usuario.id;
        const rol = req.usuario.rol;

        if (rol !== 'organizacion') {
            return res.status(403).json({ error: 'Acceso denegado.' });
        }

        const { 
            nombre_oficial, nombre_comercial, tipo_organizacion, otro_tipo,
            rif, pais_constitucion, sitio_web, direccion_fiscal, ciudad_estado,
            municipio, codigo_postal, telefono_principal, telefono_secundario,
            email_oficial, representante_nombre, representante_cedula, representante_cargo,
            representante_email_personal, representante_telefono, sector_industria,
            num_empleados, descripcion
        } = req.body;

        try {
            const [result] = await pool.query(
                `UPDATE organizaciones SET 
                    nombre_oficial = ?, nombre_comercial = ?, tipo_organizacion = ?, otro_tipo = ?,
                    rif = ?, pais_constitucion = ?, sitio_web = ?, direccion_fiscal = ?, ciudad_estado = ?,
                    municipio = ?, codigo_postal = ?, telefono_principal = ?, telefono_secundario = ?,
                    email_oficial = ?, representante_nombre = ?, representante_cedula = ?, representante_cargo = ?,
                    representante_email_personal = ?, representante_telefono = ?, sector_industria = ?,
                    num_empleados = ?, descripcion = ?
                WHERE usuario_id = ?`,
                [nombre_oficial, nombre_comercial || null, tipo_organizacion, otro_tipo || null,
                 rif, pais_constitucion || 'Venezuela', sitio_web || null, direccion_fiscal, ciudad_estado,
                 municipio || null, codigo_postal || null, telefono_principal, telefono_secundario || null,
                 email_oficial, representante_nombre, representante_cedula, representante_cargo,
                 representante_email_personal || null, representante_telefono || null, sector_industria || null,
                 num_empleados || null, descripcion || null, usuario_id]
            );

            // Manejo de la foto de perfil (si se subió una)
            if (req.file) {
                const fotoPath = `/fotodeperfil/${req.file.filename}`;
                await pool.query('UPDATE usuarios SET foto_perfil = ? WHERE id = ?', [fotoPath, usuario_id]);
            }

            res.json({ message: 'Perfil actualizado exitosamente' });
        } catch (error) {
            console.error('Error en actualizarPerfil SQL:', error.message);
            if (error.code === 'ER_DUP_ENTRY') {
                return res.status(400).json({ error: 'Error: Alguno de los datos ingresados (RIF, Nombre, Correo o Teléfono) ya pertenecen a otra organización.' });
            }
            res.status(500).json({ error: 'Error al actualizar el perfil' });
        }
    },

    // Crear nueva publicación (organización)
    crear: async (req, res) => {
        try {
            // 1. Verificación de seguridad y existencia de usuario
            if (!req.usuario || req.usuario.rol !== 'organizacion') {
                return res.status(403).json({ error: 'Acceso denegado. Solo las organizaciones pueden crear publicaciones.' });
            }

            const { 
                titulo, descripcion, categoria_id, apto_discapacidad, 
                discapacidades_no_aptas, lugar, pais, estado, municipio, 
                fecha_actividad, fecha_fin, hora_inicio, hora_fin, plazas_disponibles,
                fecha_caducidad_postulacion
            } = req.body;
            
            const organizacion_id = req.usuario.id;

            // 2. Saneamiento de datos numéricos y booleanos
            const parsedPlazas = (plazas_disponibles !== '' && plazas_disponibles !== null && plazas_disponibles !== undefined)
                ? parseInt(plazas_disponibles, 10)
                : null;
            
            const catId = (categoria_id && categoria_id !== '') ? parseInt(categoria_id, 10) : null;
            const isApto = apto_discapacidad === true || apto_discapacidad === 1 || apto_discapacidad === 'true';

            if (!titulo || !descripcion || parsedPlazas === null || isNaN(parsedPlazas)) {
                return res.status(400).json({ error: 'Título, descripción y cupos válidos son obligatorios.' });
            }

            // 3. Validaciones de fechas
        const hoy = new Date().toISOString().split('T')[0];
        if (fecha_actividad && fecha_actividad <= hoy) {
            return res.status(400).json({ error: 'La fecha de inicio debe ser posterior al día de hoy.' });
        }
        if (fecha_fin && fecha_actividad && fecha_fin < fecha_actividad) {
            return res.status(400).json({ error: 'La fecha de finalización no puede ser anterior a la de inicio.' });
        }
        if (fecha_caducidad_postulacion) {
            if (fecha_caducidad_postulacion < hoy) {
                return res.status(400).json({ error: 'La fecha de caducidad de postulación no puede ser anterior a hoy.' });
            }
            if (fecha_actividad && fecha_caducidad_postulacion > fecha_actividad) {
                return res.status(400).json({ error: 'La fecha de caducidad de postulación no puede ser posterior a la fecha de la actividad.' });
            }
        }

            // 4. Validaciones de horas
        if (hora_inicio && hora_fin) {
            if (hora_inicio >= hora_fin) {
                return res.status(400).json({ error: 'La hora de fin debe ser posterior a la de inicio.' });
            }
            if (hora_inicio < '07:00' || hora_fin > '19:00') {
                return res.status(400).json({ error: 'El horario de la actividad debe estar comprendido entre las 7:00 AM y las 7:00 PM.' });
            }
        }

            const unfitJson = (isApto && Array.isArray(discapacidades_no_aptas) && discapacidades_no_aptas.length > 0) 
            ? JSON.stringify(discapacidades_no_aptas) 
            : null;

            const [result] = await pool.query(
                `INSERT INTO publicaciones 
                (organizacion_id, titulo, descripcion, categoria_id, apto_discapacidad, discapacidades_no_aptas_json, lugar, pais, estado, municipio, fecha_actividad, fecha_fin, fecha_caducidad_postulacion, hora_inicio, hora_fin, plazas_disponibles) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    organizacion_id, titulo, descripcion, catId, isApto ? 1 : 0, unfitJson,
                    lugar || null, pais || 'Venezuela', estado || null, municipio || null, 
                    fecha_actividad || null, fecha_fin || null, fecha_caducidad_postulacion || null, hora_inicio || null, hora_fin || null, parsedPlazas
                ]
            );

            // Registrar actividad de la organización
            await pool.query('INSERT INTO actividades_usuario (usuario_id, titulo, descripcion) VALUES (?, ?, ?)',
                [organizacion_id, 'Nueva Publicación', `Has creado la oportunidad de voluntariado "${titulo}".`]
            );

            // Notificar a todos los voluntarios sobre el nuevo evento
            const [org] = await pool.query('SELECT nombre_oficial FROM organizaciones WHERE usuario_id = ?', [organizacion_id]);
            await pool.query(
                'INSERT INTO notificaciones (usuario_id, tipo, mensaje) SELECT usuario_id, "evento", ? FROM voluntarios',
                [`Nueva oportunidad: ${org[0].nombre_oficial} ha publicado "${titulo}"`]
            );

            // Notificar a los administradores sobre la nueva publicación
            await pool.query(
                'INSERT INTO notificaciones (usuario_id, tipo, mensaje) SELECT id, "sistema", ? FROM usuarios WHERE rol = "admin"',
                [`La organización ${org[0].nombre_oficial} ha realizado una nueva publicación: "${titulo}"`]
            );

            res.status(201).json({ message: 'Publicación creada exitosamente', id: result.insertId });
        } catch (error) {
            console.error('Error crítico en crear publicación:', error);
            if (error.code === 'ER_NO_REFERENCED_ROW_2') {
                return res.status(400).json({ error: 'La categoría seleccionada no es válida o no existe en el sistema.' });
            }
            res.status(500).json({ error: 'Error interno al crear la publicación' });
        }
    },

    // Obtener publicaciones de una organización (para su dashboard)
    listarPorOrganizacion: async (req, res) => {
        const organizacion_id = req.usuario.id;
        const rol = req.usuario.rol;

        if (rol !== 'organizacion') {
            return res.status(403).json({ error: 'Solo organizaciones pueden acceder a este panel' });
        }

        try {
            const [rows] = await pool.query(
                `SELECT p.*, o.nombre_oficial as organizacion_nombre,
                    (SELECT COUNT(*) FROM aplicaciones WHERE publicacion_id = p.id AND estado != 'rechazado') as total_postulaciones,
                    (SELECT COUNT(*) FROM aplicaciones WHERE publicacion_id = p.id AND estado = 'pendiente') as pendientes
                FROM publicaciones p 
                JOIN organizaciones o ON p.organizacion_id = o.usuario_id
                WHERE p.organizacion_id = ?
                ORDER BY p.created_at DESC`,
                [organizacion_id]
            );
            // Parse JSON column for each row
            const publicacionesConDiscapacidad = rows.map(row => ({
                ...row,
                discapacidades_no_aptas: safeParseJSON(row.discapacidades_no_aptas_json)
            }));
            res.json(publicacionesConDiscapacidad);
        } catch (error) {
            console.error('Error en listarPorOrganizacion SQL:', error.message);
            res.status(500).json({ error: 'Error al listar publicaciones' });
        }
    },

    // Obtener todas las publicaciones activas (para feed público)
    listarActivas: async (req, res) => {
        const { categoria, discapacidad, pais, estado, busqueda } = req.query;
        let sql = `
            SELECT p.*, o.nombre_oficial as organizacion_nombre, o.ciudad_estado as organizacion_ubicacion
            FROM publicaciones p
            JOIN organizaciones o ON p.organizacion_id = o.usuario_id
            JOIN usuarios u ON o.usuario_id = u.id
            WHERE p.activa = 1 AND u.activo = 1
        `;
        const params = [];
        if (categoria) {
            sql += ' AND p.categoria_id = ?';
            params.push(categoria);
        }
        if (discapacidad === 'true' || discapacidad === true) {
            sql += ' AND p.apto_discapacidad = 1';
        }
        if (pais) {
            sql += ' AND p.pais = ?';
            params.push(pais);
        }
        if (estado) {
            sql += ' AND p.estado = ?';
            params.push(estado);
        }
        if (busqueda) {
            sql += ' AND (p.titulo LIKE ? OR p.descripcion LIKE ?)';
            params.push(`%${busqueda}%`, `%${busqueda}%`);
        }
        sql += ' ORDER BY p.created_at DESC';

        try {
            const [rows] = await pool.query(sql, params);
            // Parse JSON column for each row
            const publicacionesConDiscapacidad = rows.map(row => ({
                ...row,
                discapacidades_no_aptas: safeParseJSON(row.discapacidades_no_aptas_json)
            }));
            res.json(publicacionesConDiscapacidad);
        } catch (error) {
            console.error('Error en listarActivas SQL:', error.message);
            res.status(500).json({ error: 'Error al listar publicaciones' });
        }
    },

    // Obtener una publicación por ID (con detalles)
    obtenerPorId: async (req, res) => {
        const { id } = req.params;
        try {
            const [rows] = await pool.query(
                `SELECT p.*, o.nombre_oficial as organizacion_nombre, o.ciudad_estado as organizacion_ubicacion,
                    o.telefono_principal, o.email_oficial, o.descripcion as organizacion_descripcion
                FROM publicaciones p
                JOIN organizaciones o ON p.organizacion_id = o.usuario_id
                JOIN usuarios u ON o.usuario_id = u.id
                WHERE p.id = ?`,
                [id]
            );
            if (rows.length === 0) {
                return res.status(404).json({ error: 'Publicación no encontrada' });
            }
            // Parse JSON column
            const publicacion = {
                ...rows[0],
                discapacidades_no_aptas: safeParseJSON(rows[0].discapacidades_no_aptas_json)
            };
            res.json(publicacion);
        } catch (error) {
            console.error('Error en obtenerPorId SQL:', error.message);
            res.status(500).json({ error: 'Error al obtener publicación' });
        }
    },

    // Actualizar publicación (solo la organización propietaria)
    actualizar: async (req, res) => {
        const { id } = req.params;
        const { titulo, descripcion, categoria_id, apto_discapacidad, discapacidades_no_aptas, lugar, pais, estado, municipio, fecha_actividad, fecha_fin, fecha_caducidad_postulacion, hora_inicio, hora_fin, plazas_disponibles, activa } = req.body;
        const organizacion_id = req.usuario.id;

        // Saneamiento de datos similar al método crear
        const parsedPlazas = (plazas_disponibles !== '' && plazas_disponibles !== null && plazas_disponibles !== undefined)
            ? parseInt(plazas_disponibles, 10)
            : null;
        
        const catId = (categoria_id && categoria_id !== '') ? parseInt(categoria_id, 10) : null;
        const isApto = apto_discapacidad === true || apto_discapacidad === 1 || apto_discapacidad === 'true';

        const hoy = new Date().toISOString().split('T')[0];
        if (fecha_actividad && fecha_actividad < hoy) {
            return res.status(400).json({ error: 'La fecha de inicio no puede ser anterior al día de hoy.' });
        }

        if (fecha_fin && fecha_actividad && fecha_fin < fecha_actividad) {
            return res.status(400).json({ error: 'La fecha de finalización no puede ser anterior a la de inicio.' });
        }

        if (fecha_caducidad_postulacion) {
            if (fecha_caducidad_postulacion < hoy) {
                return res.status(400).json({ error: 'La fecha de caducidad de postulación no puede ser anterior a hoy.' });
            }
            if (fecha_actividad && fecha_caducidad_postulacion > fecha_actividad) {
                return res.status(400).json({ error: 'La fecha de caducidad de postulación no puede ser posterior a la fecha de la actividad.' });
            }
        }

        // Validar que la hora de fin sea posterior a la de inicio y estén en el rango permitido (7am a 7pm)
        if (hora_inicio && hora_fin) {
            if (hora_inicio >= hora_fin) {
                return res.status(400).json({ error: 'La hora de fin debe ser posterior a la de inicio.' });
            }
            if (hora_inicio < '07:00' || hora_fin > '19:00') {
                return res.status(400).json({ error: 'El horario de la actividad debe estar comprendido entre las 7:00 AM y las 7:00 PM.' });
            }
        }

        const unfitJson = (isApto && Array.isArray(discapacidades_no_aptas) && discapacidades_no_aptas.length > 0) 
            ? JSON.stringify(discapacidades_no_aptas) 
            : null;

        try {
            const [result] = await pool.query(
                `UPDATE publicaciones SET
                    titulo = ?, descripcion = ?, categoria_id = ?, apto_discapacidad = ?,
                    discapacidades_no_aptas_json = ?, lugar = ?, pais = ?, estado = ?, municipio = ?,
                    fecha_actividad = ?, fecha_fin = ?, fecha_caducidad_postulacion = ?, hora_inicio = ?, hora_fin = ?, plazas_disponibles = ?, activa = ?
                WHERE id = ? AND organizacion_id = ?`,
                [titulo, descripcion, catId, isApto ? 1 : 0, unfitJson,
                 lugar || null, pais || null, estado || null, municipio || null,
                 fecha_actividad || null, fecha_fin || null, fecha_caducidad_postulacion || null, hora_inicio || null, hora_fin || null, parsedPlazas, activa !== undefined ? activa : true, id, organizacion_id]
            );
            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'Publicación no encontrada o no autorizada' });
            }
            res.json({ message: 'Publicación actualizada exitosamente' });
        } catch (error) {
            console.error('Error en actualizar publicación SQL:', error.message);
            if (error.code === 'ER_NO_REFERENCED_ROW_2') {
                return res.status(400).json({ error: 'La categoría seleccionada no existe.' });
            }
            res.status(500).json({ error: 'Error al actualizar publicación' });
        }
    },

    // Eliminar publicación (solo la organización propietaria o admin)
    eliminar: async (req, res) => {
        const { id } = req.params;
        const organizacion_id = req.usuario.id;
        const rol = req.usuario.rol;
        let query = 'DELETE FROM publicaciones WHERE id = ?';
        const params = [id];
        if (rol !== 'admin') {
            query += ' AND organizacion_id = ?';
            params.push(organizacion_id);
        }
        try {
            const [result] = await pool.query(query, params);
            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'Publicación no encontrada o no autorizada' });
            }
            res.json({ message: 'Publicación eliminada' });
        } catch (error) {
            console.error('Error en eliminar publicación SQL:', error.message);
            res.status(500).json({ error: 'Error al eliminar publicación' });
        }
    }
};

module.exports = publicacionController;