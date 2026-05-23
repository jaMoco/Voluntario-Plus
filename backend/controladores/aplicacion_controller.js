const pool = require('../config/db');

const aplicacionController = {
    // Postularse a una publicación (voluntario)
    postular: async (req, res) => {
        const { publicacion_id } = req.body;
        const voluntario_id = req.usuario.id;
        const rol = req.usuario.rol;

        if (rol !== 'voluntario') {
            return res.status(403).json({ error: 'Solo los voluntarios pueden postularse' });
        }

        try {
            // Verificar si ya postuló
            const [existe] = await pool.query(
                'SELECT id FROM aplicaciones WHERE voluntario_id = ? AND publicacion_id = ?',
                [voluntario_id, publicacion_id]
            );
            if (existe.length > 0) {
                return res.status(400).json({ error: 'Ya te has postulado a esta oportunidad' });
            }

            // Verificación de fecha de caducidad y cupos antes de postular
            const [pubInfo] = await pool.query('SELECT fecha_caducidad_postulacion, plazas_disponibles FROM publicaciones WHERE id = ?', [publicacion_id]);
            if (pubInfo.length === 0) {
                return res.status(404).json({ error: 'Oportunidad no encontrada.' });
            }
            const hoy = new Date();
            hoy.setHours(0, 0, 0, 0); // Comparar solo con la fecha
            if (pubInfo[0].fecha_caducidad_postulacion && new Date(pubInfo[0].fecha_caducidad_postulacion) < hoy) {
                return res.status(403).json({ error: 'El período para postularse a esta oportunidad ha finalizado.' });
            }
            if (pubInfo[0].plazas_disponibles <= 0) {
                return res.status(403).json({ error: 'No hay cupos disponibles para esta oportunidad.' });
            }

            // Validación de compatibilidad de discapacidad
            const [pub] = await pool.query('SELECT apto_discapacidad, discapacidades_no_aptas_json FROM publicaciones WHERE id = ?', [publicacion_id]);
            const [vol] = await pool.query('SELECT tiene_discapacidad, discapacidad_categoria, discapacidad_nivel, tipo_discapacidad FROM voluntarios WHERE usuario_id = ?', [voluntario_id]);

            // Asegurar que detectamos la discapacidad (TinyInt 1 o Boolean true)
            const tieneDiscapacidad = vol.length > 0 && (vol[0].tiene_discapacidad === 1 || vol[0].tiene_discapacidad === true || String(vol[0].tiene_discapacidad) === '1' || String(vol[0].tiene_discapacidad) === 'true');

            if (pub.length > 0 && tieneDiscapacidad) {
                const esAptoGeneral = pub[0].apto_discapacidad === 1 || pub[0].apto_discapacidad === true || pub[0].apto_discapacidad === '1';

                if (!esAptoGeneral) {
                    return res.status(403).json({
                        error: 'Lo sentimos, por motivos de seguridad o requerimientos técnicos, esta actividad no está adaptada para personas con discapacidad.'
                    });
                }

                let restricciones = [];
                const rawJson = pub[0].discapacidades_no_aptas_json;
                
                if (typeof rawJson === 'string') {
                    try { restricciones = JSON.parse(rawJson || '[]'); } catch (e) { restricciones = []; }
                } else if (rawJson && typeof rawJson === 'object') {
                    restricciones = rawJson;
                }
                
                const volData = vol[0];
                const normalize = (val) => {
                    if (!val) return '';
                    return val.toString()
                        .normalize("NFD")
                        .replace(/[\u0300-\u036f]/g, "") // Remueve acentos y tildes
                        .replace(/[^a-zA-Z0-9]/g, "")    // Remueve espacios y caracteres especiales
                        .toLowerCase();
                };

                const esIncompatible = restricciones.some(res => 
                    res.tipo && volData.tipo_discapacidad && 
                    normalize(res.tipo) === normalize(volData.tipo_discapacidad)
                );

                if (esIncompatible) {
                    return res.status(403).json({
                        error: 'Lo sentimos, por motivos de seguridad o requerimientos técnicos, esta actividad no se adapta a tu perfil de accesibilidad.'
                    });
                }
            }

            // Verificar y descontar cupo de forma atómica
            const [resultadoCupo] = await pool.query(
                'UPDATE publicaciones SET plazas_disponibles = plazas_disponibles - 1 WHERE id = ? AND plazas_disponibles > 0',
                [publicacion_id]
            );

            if (resultadoCupo.affectedRows === 0) {
                // Si no se actualizó ninguna fila, es porque plazas_disponibles era 0
                return res.status(403).json({
                    error: 'No hay cupos disponibles para esta oportunidad'
                });
            }

            await pool.query(
                'INSERT INTO aplicaciones (voluntario_id, publicacion_id, estado) VALUES (?, ?, ?)',
                [voluntario_id, publicacion_id, 'pendiente']
            );

            // Notificar a la organización
            const [pubNotificationInfo] = await pool.query('SELECT organizacion_id, titulo FROM publicaciones WHERE id = ?', [publicacion_id]);
            await pool.query(
                'INSERT INTO notificaciones (usuario_id, tipo, mensaje) VALUES (?, ?, ?)',
                [pubNotificationInfo[0].organizacion_id, 'postulacion', `Nueva postulación recibida para: ${pubNotificationInfo[0].titulo}`]
            );

            // Registrar actividad del voluntario
            const [volNameData] = await pool.query('SELECT nombre_completo FROM voluntarios WHERE usuario_id = ?', [voluntario_id]);
            const currentVolName = volNameData.length > 0 ? volNameData[0].nombre_completo : 'Usuario';
            await pool.query('INSERT INTO actividades_usuario (usuario_id, titulo, descripcion) VALUES (?, ?, ?)',
                [voluntario_id, 'Nueva Postulación', `${currentVolName} se ha postulado en el evento "${pubNotificationInfo[0].titulo}".`]
            );

            res.status(201).json({ message: 'Postulación enviada exitosamente' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error al postular' });
        }
    },

    // Listar postulaciones de un voluntario (para su perfil)
    misPostulaciones: async (req, res) => {
        const voluntario_id = req.usuario.id;
        try {
            const [rows] = await pool.query(
                `SELECT a.*, p.titulo, p.descripcion, p.fecha_actividad, p.lugar, 
                        p.apto_discapacidad, p.discapacidades_no_aptas_json,
                        o.nombre_oficial as organizacion_nombre
                FROM aplicaciones a
                JOIN publicaciones p ON a.publicacion_id = p.id
                JOIN organizaciones o ON p.organizacion_id = o.usuario_id
                WHERE a.voluntario_id = ?
                ORDER BY a.fecha_aplicacion DESC`,
                [voluntario_id]
            );

            // Procesar el JSON de restricciones para cada postulación
            const mappedRows = rows.map(row => {
                let restrictions = [];
                try {
                    restrictions = typeof row.discapacidades_no_aptas_json === 'string'
                        ? JSON.parse(row.discapacidades_no_aptas_json || '[]')
                        : (row.discapacidades_no_aptas_json || []);
                } catch (e) { restrictions = []; }
                
                return { ...row, discapacidades_no_aptas: restrictions };
            });

            res.json(mappedRows);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error al listar postulaciones' });
        }
    },

    // Listar postulantes de una publicación (organización)
    listarPostulantes: async (req, res) => {
        const { publicacion_id } = req.params;
        const organizacion_id = req.usuario.id;
        try {
            // Verificar que la publicación pertenece a la organización
            const [pub] = await pool.query('SELECT id FROM publicaciones WHERE id = ? AND organizacion_id = ?', [publicacion_id, organizacion_id]);
            if (pub.length === 0) {
                return res.status(404).json({ error: 'Publicación no encontrada o no autorizada' });
            }
            const [rows] = await pool.query(
                `SELECT a.*, v.nombre_completo as nombre, u.email, v.cedula, v.telefono, v.ubicacion_estado, v.es_estudiante, v.universidad, v.carrera
                FROM aplicaciones a
                JOIN voluntarios v ON a.voluntario_id = v.usuario_id
                JOIN usuarios u ON v.usuario_id = u.id
                WHERE a.publicacion_id = ?
                ORDER BY a.fecha_aplicacion DESC`,
                [publicacion_id]
            );
            res.json(rows);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error al listar postulantes' });
        }
    },

    // Cambiar estado de una postulación (organización)
    cambiarEstado: async (req, res) => {
        const { id } = req.params;
        const { estado } = req.body;
        const organizacion_id = req.usuario.id;

        if (!['pendiente', 'aceptado', 'rechazado', 'completado'].includes(estado)) {
            return res.status(400).json({ error: 'Estado no válido' });
        }

        try {
            // Verificar que la aplicación pertenece a una publicación de esta organización
            const [app] = await pool.query(
                `SELECT a.id FROM aplicaciones a
                JOIN publicaciones p ON a.publicacion_id = p.id
                WHERE a.id = ? AND p.organizacion_id = ?`,
                [id, organizacion_id]
            );
            if (app.length === 0) {
                return res.status(404).json({ error: 'Postulación no encontrada o no autorizada' });
            }

            const [oldState] = await pool.query(
                'SELECT a.estado, a.publicacion_id, a.voluntario_id, p.titulo FROM aplicaciones a JOIN publicaciones p ON a.publicacion_id = p.id WHERE a.id = ?', 
                [id]
            );
            
            await pool.query('UPDATE aplicaciones SET estado = ? WHERE id = ?', [estado, id]);

            // Notificar al voluntario sobre el cambio de estado
            await pool.query('INSERT INTO notificaciones (usuario_id, tipo, mensaje) VALUES (?, ?, ?)',
                [oldState[0].voluntario_id, 'postulacion', `Tu postulación para "${oldState[0].titulo}" ha sido cambiada a: ${estado}`]);

            if (oldState[0].estado !== 'rechazado' && estado === 'rechazado') {
                await pool.query(
                    'UPDATE publicaciones SET plazas_disponibles = plazas_disponibles + 1 WHERE id = ?',
                    [oldState[0].publicacion_id]
                );
            } else if (oldState[0].estado === 'rechazado' && estado !== 'rechazado') {
                // Si se revierte un rechazo, volvemos a consumir el cupo
                await pool.query(
                    'UPDATE publicaciones SET plazas_disponibles = plazas_disponibles - 1 WHERE id = ?',
                    [oldState[0].publicacion_id]
                );
            }

            res.json({ message: 'Estado actualizado exitosamente' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error al actualizar estado' });
        }
    },

    // Registrar horas completadas (organización, al finalizar un proyecto)
    registrarHoras: async (req, res) => {
        const { id } = req.params;
        const { horas_realizadas } = req.body;
        const organizacion_id = req.usuario.id;

        if (!horas_realizadas || horas_realizadas <= 0) {
            return res.status(400).json({ error: 'Horas válidas son requeridas' });
        }

        try {
            const [app] = await pool.query(
                `SELECT a.id FROM aplicaciones a
                JOIN publicaciones p ON a.publicacion_id = p.id
                WHERE a.id = ? AND p.organizacion_id = ? AND a.estado = 'aceptado'`,
                [id, organizacion_id]
            );
            if (app.length === 0) {
                return res.status(404).json({ error: 'Postulación no encontrada, no autorizada o no aceptada' });
            }

            const [volData] = await pool.query('SELECT a.voluntario_id, p.titulo FROM aplicaciones a JOIN publicaciones p ON a.publicacion_id = p.id WHERE a.id = ?', [id]);

            await pool.query('UPDATE aplicaciones SET horas_realizadas = ?, estado = "completado" WHERE id = ?', [horas_realizadas, id]);

            // Notificar al voluntario: Evento culminado y certificado disponible
            await pool.query('INSERT INTO notificaciones (usuario_id, tipo, mensaje) VALUES (?, ?, ?)',
                [volData[0].voluntario_id, 'sistema', `¡Felicidades! Has culminado el evento "${volData[0].titulo}". Ya puedes descargar tu certificado.`]);

            // Auto-generar registro de certificado al completar el proyecto
            const ruta_pdf = `/certificados/${id}.pdf`; // Ruta dummy mientras se implementa la generación real
            await pool.query(
                'INSERT IGNORE INTO certificados (aplicacion_id, ruta_pdf, horas_certificadas) VALUES (?, ?, ?)',
                [id, ruta_pdf, horas_realizadas]
            );

            res.json({ message: 'Horas registradas, proyecto completado y certificado generado' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error al registrar horas' });
        }
    },

    // Eliminar una postulación (solo voluntario y si aún está pendiente)
    eliminarPostulacion: async (req, res) => {
        const { id } = req.params;
        const voluntario_id = req.usuario.id;

        try {
            // Obtener info antes de borrar para devolver el cupo
            const [app] = await pool.query(
                'SELECT publicacion_id FROM aplicaciones WHERE id = ? AND voluntario_id = ? AND estado = "pendiente"',
                [id, voluntario_id]
            );

            if (app.length > 0) {
                const [pubData] = await pool.query('SELECT titulo FROM publicaciones WHERE id = ?', [app[0].publicacion_id]);
                
                const [result] = await pool.query(
                    'DELETE FROM aplicaciones WHERE id = ? AND voluntario_id = ? AND estado = "pendiente"',
                    [id, voluntario_id]
                );

                if (result.affectedRows > 0) {
                    // Devolver cupo
                    await pool.query(
                        'UPDATE publicaciones SET plazas_disponibles = plazas_disponibles + 1 WHERE id = ?',
                        [app[0].publicacion_id]
                    );

                    // Registrar actividad
                    const [volData] = await pool.query('SELECT nombre_completo FROM voluntarios WHERE usuario_id = ?', [voluntario_id]);
                    const nombreVol = volData.length > 0 ? volData[0].nombre_completo : 'El usuario';
                    await pool.query('INSERT INTO actividades_usuario (usuario_id, titulo, descripcion) VALUES (?, ?, ?)',
                        [voluntario_id, 'Postulación Cancelada', `${nombreVol} ha cancelado su postulación al evento "${pubData[0].titulo}".`]
                    );
                    
                    return res.json({ message: 'Postulación eliminada exitosamente' });
                }
            }

            return res.status(404).json({ error: 'Postulación no encontrada o ya no puede eliminarse.' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error al eliminar la postulación' });
        }
    }
};

module.exports = aplicacionController;