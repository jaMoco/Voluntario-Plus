import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contextos/auth_context';
import AccesibilidadMenu from './AccesibilidadMenu';
import NotificationBell from './NotificationBell';
import api from '../../servicios/api';

const Navbar = () => {
    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    // No renderizar si no hay un usuario autenticado
    if (!user) return null;

    const isOrganizacion = user.rol === 'organizacion';
    const isPerfilOrg = location.pathname === '/organizacion/perfil';
    const isPanelOrg = location.pathname === '/organizacion/panel';

    const handleLogout = async () => {
        try {
            await api.post('/usuario/logout'); // Avisa al backend para que guarde la actividad
        } catch (e) {
            console.error('Error al registrar el logout', e);
        }
        logout();
        navigate('/login');
    };

    return (
        <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16 items-center">
                    <div className="flex items-center gap-8">
                        <Link to="/" className="flex items-center cursor-pointer">
                            {/* Logo */}
                            <img 
                                src="/logo.svg" 
                                alt="Voluntario+ Logo" 
                                className="w-11 h-11 mr-3 drop-shadow-sm transition-transform hover:scale-105" 
                            />

                            {/* Título Entrelazado */}
                            <h1 className="flex items-baseline text-3xl font-extrabold tracking-tight text-voluntario-deep">
                                <span className="text-transparent bg-clip-text bg-gradient-to-br from-blue-600 to-cyan-400 text-[1.2em] pr-1">V</span>
                                <span>oluntari</span>
                                
                                <span className="relative inline-block isolate ml-[1px]">
                                    {/* Símbolo + (pasa por debajo) */}
                                    <span className="absolute top-1/2 left-[38%] -translate-y-[48%] text-[1.6em] text-blue-500 font-black leading-none pointer-events-none -z-10 opacity-90">
                                        +
                                    </span>
                                    {/* Letra 'o' del centro */}
                                    <span className="relative z-0">o</span>
                                    {/* Símbolo + (recortado para pasar por encima) */}
                                    <span className="absolute top-1/2 left-[38%] -translate-y-[48%] text-[1.6em] text-blue-500 font-black leading-none pointer-events-none z-10 [clip-path:polygon(50%_0,100%_0,100%_100%,50%_100%)] drop-shadow-sm">
                                        +
                                    </span>
                                </span>
                            </h1>
                        </Link>

                        {/* Navegación Dinámica para Organizaciones */}
                        {isOrganizacion && (
                            <div className="hidden md:flex items-center gap-2 bg-gray-50 p-1 rounded-lg border border-gray-100">
                                {isPerfilOrg ? (
                                    <Link to="/organizacion/panel" className="px-4 py-1.5 text-sm font-semibold text-gray-600 hover:text-olive-leaf hover:bg-white rounded-md transition-all">
                                        📊 Ir al Panel
                                    </Link>
                                ) : (
                                    <Link to="/organizacion/perfil" className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-all ${isPanelOrg ? 'text-gray-600 hover:text-olive-leaf hover:bg-white' : 'text-olive-leaf bg-white shadow-sm'}`}>
                                        🏢 Mi Perfil
                                    </Link>
                                )}
                            </div>
                        )}
                    </div>
                    <div className="flex items-center gap-2 ml-auto mr-4">
                        <AccesibilidadMenu isDark={false} />
                        <NotificationBell />
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 hidden sm:flex">
                            {user.foto_perfil ? (
                                <img src={`http://localhost:5000${user.foto_perfil}`} alt="User" className="w-8 h-8 rounded-full object-cover border border-gray-200" />
                            ) : (
                                <div className="w-8 h-8 rounded-full bg-voluntario-light text-voluntario-deep flex items-center justify-center font-bold text-sm">
                                    {user.nombre?.charAt(0) || user.email?.charAt(0).toUpperCase()}
                                </div>
                            )}
                            <span className="text-xs font-medium text-gray-500">{user.email}</span>
                        </div>
                        <button onClick={handleLogout} className="text-sm font-bold text-red-500 hover:text-red-700 transition-colors px-3 py-1">
                            Salir
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;