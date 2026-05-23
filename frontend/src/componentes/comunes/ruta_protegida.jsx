// frontend/src/componentes/comunes/ruta_protegida.jsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contextos/auth_context';

const RutaProtegida = ({ children, rolesPermitidos = [] }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return <div className="flex justify-center items-center h-screen">Cargando...</div>;
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (rolesPermitidos.length > 0 && !rolesPermitidos.includes(user.rol)) {
        // Usuario no autorizado, redirigir a página principal o a login
        return <Navigate to="/" replace />;
    }

    return children;
};

export default RutaProtegida;