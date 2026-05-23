/**
 * Middleware para verificar roles de usuario.
 * Se asume que el objeto req.usuario ya fue inyectado por el middleware de autenticación (auth_middleware).
 */

const esAdmin = (req, res, next) => {
    if (req.usuario && req.usuario.rol === 'admin') {
        next();
    } else {
        res.status(403).json({ 
            error: 'Acceso denegado', 
            detalle: 'Se requieren privilegios de administrador para realizar esta acción.' 
        });
    }
};

const esOrganizacion = (req, res, next) => {
    if (req.usuario && req.usuario.rol === 'organizacion') {
        next();
    } else {
        res.status(403).json({ 
            error: 'Acceso denegado', 
            detalle: 'Esta acción es exclusiva para organizaciones.' 
        });
    }
};

module.exports = { esAdmin, esOrganizacion };