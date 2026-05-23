import React, { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contextos/auth_context';
import useIdleTimeout from '../../hooks/useIdleTimeout';   // Ajusta la ruta según tu estructura
import Loader from './loader';
import AccesibilidadMenu from './AccesibilidadMenu';
import NotificationBell from './NotificationBell';
import api from '../../servicios/api';

const Layout = () => {
    const { user, logout, loading } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
    const [isNavbarOpen, setIsNavbarOpen] = useState(false);

    // Hook de inactividad: cierra sesión después de 10 minutos sin actividad
    useIdleTimeout(10);

    const handleLogout = async () => {
        try {
            await api.post('/usuario/logout'); // Avisa al backend para que guarde la actividad
        } catch (e) {
            console.error('Error al registrar el logout', e);
        }
        logout();
        navigate('/login');
    };

    if (loading) return <Loader />;

    // Si no hay usuario, permitimos que las rutas hijas (como RutaProtegida) 
    // manejen la lógica de redirección sin intentar renderizar el menú.
    if (!user) return <Outlet />;

    return (
        <div className="min-h-screen flex flex-col">
            <nav className="bg-voluntario-deep fixed w-full z-20 top-0 start-0 border-b border-white/10 text-white">
                <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
                    <Link to="/" className="flex items-center space-x-3 rtl:space-x-reverse">
                        {/* Logo */}
                        <img 
                            src="/logo.svg" 
                            alt="Voluntario+ Logo" 
                            className="w-11 h-11 drop-shadow-sm transition-transform hover:scale-105" 
                        />

                        {/* Título Entrelazado */}
                        <h1 className="flex items-baseline text-3xl font-extrabold tracking-tight text-white">
                            <span className="text-transparent bg-clip-text bg-gradient-to-br from-blue-400 to-cyan-300 text-[1.2em] pr-1">V</span>
                            <span>oluntari</span>
                            
                            <span className="relative inline-block isolate ml-[1px]">
                                {/* Símbolo + (pasa por debajo) */}
                                <span className="absolute top-1/2 left-[38%] -translate-y-[48%] text-[1.6em] text-blue-400 font-black leading-none pointer-events-none -z-10 opacity-90">
                                    +
                                </span>
                                {/* Letra 'o' del centro */}
                                <span className="relative z-0">o</span>
                                {/* Símbolo + (recortado para pasar por encima) */}
                                <span className="absolute top-1/2 left-[38%] -translate-y-[48%] text-[1.6em] text-blue-400 font-black leading-none pointer-events-none z-10 [clip-path:polygon(50%_0,100%_0,100%_100%,50%_100%)] drop-shadow-sm">
                                    +
                                </span>
                            </span>
                        </h1>
                    </Link>

                    <div className="flex items-center md:order-2 space-x-3 md:space-x-4 rtl:space-x-reverse">
                        {/* Cambiar Idioma (Placeholder) */}
                        <button className="hidden sm:block text-sm font-medium hover:text-voluntario-light transition-colors">
                            ES/EN
                        </button>

                        <AccesibilidadMenu isDark={true} />

                        {/* Campana de Notificaciones */}
                        <NotificationBell />

                        {/* Botón Cerrar Sesión junto al idioma */}
                        <button 
                            onClick={handleLogout} 
                            className="hidden sm:block text-sm font-medium bg-red-600 hover:bg-red-700 px-3 py-1.5 rounded-lg transition-colors"
                        >
                            🔒 Salir
                        </button>

                        {/* User Menu Button */}
                        <div className="relative">
                            <button 
                                type="button" 
                                className="flex text-sm bg-voluntario-forest rounded-full md:me-0 focus:ring-4 focus:ring-voluntario-light"
                                onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                            >
                                <span className="sr-only">Open user menu</span>
                                <div className="w-8 h-8 rounded-full bg-voluntario-mid border border-white flex items-center justify-center text-voluntario-deep font-bold overflow-hidden">
                                    {user.foto_perfil ? (
                                        <img src={`http://localhost:5000${user.foto_perfil}`} alt="User" className="w-full h-full object-cover" />
                                    ) : (
                                        user.nombre?.charAt(0) || user.rol?.charAt(0).toUpperCase()
                                    )}
                                </div>
                            </button>

                            {/* Dropdown menu */}
                            {isUserDropdownOpen && (
                                <div className="absolute right-0 mt-2 z-50 bg-white divide-y divide-gray-100 rounded-lg shadow-xl w-48 text-gray-700">
                                    <div className="px-4 py-3">
                                        <span className="block text-sm font-bold text-gray-900 truncate">{user.nombre || 'Usuario'}</span>
                                        <span className="block text-xs text-gray-500 truncate">{user.email}</span>
                                    </div>
                                    <ul className="py-2 text-sm">
                                        {/* Enlaces Dropdown por Rol */}
                                        {user.rol === 'voluntario' && (
                                            <>
                                                <li><Link to="/perfil" className="block px-4 py-2 hover:bg-gray-100">👤 Mi perfil</Link></li>
                                                <li><Link to="/mis-postulaciones" className="block px-4 py-2 hover:bg-gray-100">📌 Mis postulaciones</Link></li>
                                                <li><Link to="/mis-certificados" className="block px-4 py-2 hover:bg-gray-100">📜 Certificados</Link></li>
                                            </>
                                        )}
                                        {user.rol === 'organizacion' && (
                                            <li><Link to="/organizacion/perfil" className="block px-4 py-2 hover:bg-gray-100">📄 Perfil Organización</Link></li>
                                        )}
                                        {user.rol === 'admin' && (
                                            <li><Link to="/perfil" className="block px-4 py-2 hover:bg-gray-100">👤 Perfil Admin</Link></li>
                                        )}
                                        <li>
                                            <button 
                                                onClick={handleLogout} 
                                                className="block w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 font-medium"
                                            >
                                                🔒 Cerrar sesión
                                            </button>
                                        </li>
                                    </ul>
                                </div>
                            )}
                        </div>

                        {/* Hamburger Menu (Mobile) */}
                        <button 
                            onClick={() => setIsNavbarOpen(!isNavbarOpen)}
                            className="inline-flex items-center p-2 w-10 h-10 justify-center text-sm rounded-lg md:hidden hover:bg-voluntario-forest focus:outline-none focus:ring-2 focus:ring-voluntario-light"
                        >
                            <span className="sr-only">Open main menu</span>
                            <svg className="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 17 14">
                                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 1h15M1 7h15M1 13h15"/>
                            </svg>
                        </button>
                    </div>

                    {/* Navigation Links (Main) */}
                    <div className={`${isNavbarOpen ? 'block' : 'hidden'} items-center justify-between w-full md:flex md:w-auto md:order-1`}>
                        <ul className="flex flex-col font-medium p-4 md:p-0 mt-4 border border-white/10 rounded-lg bg-voluntario-forest md:space-x-8 rtl:space-x-reverse md:flex-row md:mt-0 md:border-0 md:bg-transparent">
                            {user.rol === 'voluntario' && (
                                <li>
                                    {location.pathname === '/feed' ? (
                                        <Link to="/perfil" className="block py-2 px-3 rounded hover:bg-voluntario-mid md:hover:bg-transparent md:hover:text-voluntario-light md:p-0">👤 Perfil</Link>
                                    ) : (
                                        <Link to="/feed" className="block py-2 px-3 rounded hover:bg-voluntario-mid md:hover:bg-transparent md:hover:text-voluntario-light md:p-0">📋 Feed</Link>
                                    )}
                                </li>
                            )}
                            {user.rol === 'organizacion' && (
                                <>
                                    <li>
                                        {location.pathname === '/organizacion/panel' ? (
                                            <Link to="/organizacion/perfil" className="block py-2 px-3 rounded hover:bg-voluntario-mid md:hover:bg-transparent md:hover:text-voluntario-light md:p-0">📄 Mi Perfil</Link>
                                        ) : (
                                            <Link to="/organizacion/panel" className="block py-2 px-3 rounded hover:bg-voluntario-mid md:hover:bg-transparent md:hover:text-voluntario-light md:p-0">📊 Ir al Panel</Link>
                                        )}
                                    </li>
                                    <li>
                                        <Link to="/organizacion/nueva-publicacion" className="block py-2 px-3 rounded hover:bg-voluntario-mid md:hover:bg-transparent md:hover:text-voluntario-light md:p-0">➕ Nueva publicación</Link>
                                    </li>
                                </>
                            )}
                            {user.rol === 'admin' && (
                                <li>
                                    <Link to="/admin/panel" className="block py-2 px-3 rounded hover:bg-voluntario-mid md:hover:bg-transparent md:hover:text-voluntario-light md:p-0">⚙️ Panel Admin</Link>
                                </li>
                            )}
                            <li>
                                <Link to="/acerca-de" className="block py-2 px-3 rounded hover:bg-voluntario-mid md:hover:bg-transparent md:hover:text-voluntario-light md:p-0">Sobre Nosotros</Link>
                            </li>
                        </ul>
                    </div>
                </div>
            </nav>

            {/* Contenido principal */}
            <main className="flex-1 bg-gray-100 mt-16">
                <Outlet />
            </main>

            {/* Footer */}
            <footer className="bg-voluntario-forest text-white text-center py-4 text-sm">
                © 2025 Voluntario+ - Conectando voluntarios con causas
            </footer>
        </div>
    );
};

export default Layout;