// frontend/src/paginas/welcome.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../servicios/api';
import { useAuth } from '../contextos/auth_context';
import AccesibilidadMenu from '../componentes/comunes/AccesibilidadMenu';

const Welcome = () => {
    const { user, logout } = useAuth();
    const [organizaciones, setOrganizaciones] = useState([]);
    const [publicaciones, setPublicaciones] = useState([]);
    const [filtroTexto, setFiltroTexto] = useState('');
    const [filtroUbicacion, setFiltroUbicacion] = useState('');
    const [menuRegistroOpen, setMenuRegistroOpen] = useState(false);
    const [menuUsuarioOpen, setMenuUsuarioOpen] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const cargarDatos = async () => {
            try {
                const [orgRes, pubRes] = await Promise.all([
                    api.get('/auth/organizaciones'),
                    api.get('/publicaciones')
                ]);
                setOrganizaciones(orgRes.data);
                setPublicaciones(pubRes.data);
            } catch (error) {
                console.error('Error cargando datos:', error);
            }
        };
        cargarDatos();
    }, []);

    // Filtros
    const orgFiltradas = organizaciones.filter(org =>
        (filtroTexto === '' || (org.nombre && org.nombre.toLowerCase().includes(filtroTexto.toLowerCase())) ||
            (org.descripcion && org.descripcion.toLowerCase().includes(filtroTexto.toLowerCase()))) &&
        (filtroUbicacion === '' || (org.ubicacion && org.ubicacion.toLowerCase().includes(filtroUbicacion.toLowerCase())))
    );

    const pubFiltradas = publicaciones.filter(pub =>
        (filtroTexto === '' || pub.titulo.toLowerCase().includes(filtroTexto.toLowerCase()) ||
            (pub.descripcion && pub.descripcion.toLowerCase().includes(filtroTexto.toLowerCase()))) &&
        (filtroUbicacion === '' || (pub.lugar && pub.lugar.toLowerCase().includes(filtroUbicacion.toLowerCase())))
    );

    return (
        <div className="min-h-screen bg-gray-100 font-sans">
            {/* Barra de navegación */}
            <nav className="bg-white shadow-md py-4 px-6 flex flex-wrap justify-between items-center sticky top-0 z-50">
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
                
                <div className="flex items-center gap-4 md:gap-8">
                    <AccesibilidadMenu isDark={false} />
                    {/* Enlaces Universales */}
                    <div className="hidden sm:flex gap-4">
                        <Link to="/acerca-de" className="text-gray-600 hover:text-olive-leaf font-medium transition-colors">Sobre Nosotros</Link>
                        <Link to="/terminos" className="text-gray-600 hover:text-olive-leaf font-medium transition-colors">Términos</Link>
                    </div>

                {user ? (
                    <div className="relative inline-block text-left">
                        <button
                            onClick={() => {
                                setMenuUsuarioOpen(!menuUsuarioOpen);
                                setMenuRegistroOpen(false);
                            }}
                            className="flex items-center gap-3 px-4 py-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all shadow-sm group"
                        >
                            <div className="w-8 h-8 bg-voluntario-mid rounded-full flex items-center justify-center text-voluntario-deep font-bold text-sm group-hover:scale-105 transition-transform">
                                {user.nombre?.charAt(0).toUpperCase() || user.rol?.charAt(0).toUpperCase()}
                            </div>
                            <div className="text-left hidden sm:block leading-none">
                                <p className="text-xs text-gray-400 font-semibold uppercase tracking-tighter">Bienvenido</p>
                                <p className="text-sm font-bold text-voluntario-deep truncate max-w-[120px]">{user.nombre || user.email}</p>
                            </div>
                            <svg className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${menuUsuarioOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>

                        {menuUsuarioOpen && (
                            <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden animate-fade-in">
                                <div className="px-5 py-4 border-b border-gray-50 bg-gray-50/50">
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Tu cuenta</p>
                                    <p className="text-sm font-extrabold text-voluntario-deep truncate">{user.nombre || 'Usuario'}</p>
                                    <p className="text-xs text-gray-400 truncate">{user.email}</p>
                                </div>
                                <div className="p-2">
                                    {user.rol === 'voluntario' ? (
                                        <Link to="/feed" className="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-voluntario-light hover:text-voluntario-deep rounded-xl transition-colors">
                                            <span>📋</span> Ir al Feed
                                        </Link>
                                    ) : (
                                        <Link to={user.rol === 'organizacion' ? "/organizacion/panel" : "/admin/panel"} className="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-voluntario-light hover:text-voluntario-deep rounded-xl transition-colors">
                                            <span>🏢</span> Ir al Panel
                                        </Link>
                                    )}

                                    <Link to={user.rol === 'organizacion' ? "/organizacion/perfil" : "/perfil"} className="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-voluntario-light hover:text-voluntario-deep rounded-xl transition-colors">
                                        <span>👤</span> Mi Perfil
                                    </Link>

                                    <div className="h-px bg-gray-100 my-1 mx-2"></div>
                                    <button
                                        onClick={logout}
                                        className="flex items-center gap-3 w-full px-4 py-3 text-sm font-bold text-red-600 hover:bg-red-50 rounded-xl transition-colors text-left"
                                    >
                                        <span>🔒</span> Cerrar sesión
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="space-x-4">
                        <button
                            onClick={() => navigate('/login')}
                            className="px-4 py-2 text-voluntario-dark hover:text-voluntario-forest transition"
                        >
                            Iniciar sesión
                        </button>
                        <div className="relative inline-block text-left">
                            <button
                                onClick={() => {
                                    setMenuRegistroOpen(!menuRegistroOpen);
                                    setMenuUsuarioOpen(false);
                                }}
                                className="px-4 py-2 bg-olive-leaf text-white rounded-lg hover:bg-olive-leaf-400 transition flex items-center gap-2"
                            >
                                Registrarse
                                <svg className={`w-4 h-4 transition-transform ${menuRegistroOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>
                            {menuRegistroOpen && (
                                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden">
                                    <div className="py-1">
                                        <button
                                            onClick={() => navigate('/registro/voluntario')}
                                            className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-voluntario-light hover:text-voluntario-deep transition-colors text-left"
                                        >
                                            🙋‍♂️ Registrarme como Voluntario
                                        </button>
                                        <button
                                            onClick={() => navigate('/registro/organizacion')}
                                            className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-voluntario-light hover:text-voluntario-deep transition-colors text-left border-t border-gray-50"
                                        >
                                            🏢 Registrarme como Organización
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
                </div>
            </nav>

            {/* Encabezado con buscador */}
            <header className="bg-voluntario-deep text-white text-center py-16 px-4">
                <h2 className="text-4xl md:text-5xl font-bold mb-4">Encuentra tu próximo voluntariado inclusivo</h2>
                <div className="max-w-3xl mx-auto flex flex-col md:flex-row gap-3 mt-6">
                    <input
                        type="text"
                        placeholder="¿Qué quieres hacer? (Ej. educación, ambiente)"
                        value={filtroTexto}
                        onChange={(e) => setFiltroTexto(e.target.value)}
                        className="flex-1 px-4 py-3 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-olive-leaf"
                    />
                    <input
                        type="text"
                        placeholder="Ciudad o ubicación"
                        value={filtroUbicacion}
                        onChange={(e) => setFiltroUbicacion(e.target.value)}
                        className="flex-1 md:flex-initial md:w-64 px-4 py-3 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-olive-leaf"
                    />
                    <button className="bg-olive-leaf hover:bg-olive-leaf-400 px-6 py-3 rounded-lg font-semibold transition">
                        Buscar
                    </button>
                </div>
                <p className="mt-6 text-voluntario-light">Opciones para personas con y sin discapacidad.</p>
            </header>

            {/* Contenido principal */}
            <main className="container mx-auto px-4 py-12">
                {/* Sección de organizaciones */}
                <section>
                    <h3 className="text-3xl font-bold text-center text-gray-800 mb-8">Organizaciones que buscan tu talento</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {orgFiltradas.length === 0 ? (
                            <p className="col-span-full text-center text-gray-500">No hay organizaciones que coincidan con tu búsqueda.</p>
                        ) : (
                            orgFiltradas.map(org => (
                                <div key={org.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition">
                                    <div className="p-6 flex flex-col items-center text-center">
                                        <div className="w-20 h-20 bg-voluntario-mid rounded-full flex items-center justify-center text-3xl font-bold text-voluntario-deep mb-4">
                                            {org.nombre?.charAt(0)?.toUpperCase() || '?'}
                                        </div>
                                        <h4 className="text-xl font-semibold text-voluntario-dark">{org.nombre || "Nombre no disponible"}</h4>
                                        <p className="text-gray-600 mt-2">{org.descripcion || "Sin descripción"}</p>
                                        <p className="text-sm text-gray-400 mt-3">📍 {org.ubicacion || "No especificada"}</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </section>

                {/* Sección de proyectos */}
                <section className="mt-16">
                    <h3 className="text-3xl font-bold text-center text-gray-800 mb-8">Proyectos de voluntariado disponibles</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {pubFiltradas.length === 0 ? (
                            <p className="col-span-full text-center text-gray-500">No hay proyectos que coincidan con tu búsqueda.</p>
                        ) : (
                            pubFiltradas.map(pub => (
                                <div key={pub.id} className="bg-white rounded-xl shadow-md overflow-hidden flex flex-col">
                                    <div className="p-6 flex-1">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="w-10 h-10 bg-voluntario-light rounded-full flex items-center justify-center text-voluntario-deep font-bold">
                                                {pub.organizacion_nombre ? pub.organizacion_nombre.charAt(0).toUpperCase() : '?'}
                                            </div>
                                            <span className="text-sm text-gray-500">{pub.organizacion_nombre || "Organización"}</span>
                                        </div>
                                        <h4 className="text-xl font-bold text-gray-800 mb-2">{pub.titulo}</h4>
                                        <p className="text-gray-600 text-sm mb-4">{pub.descripcion}</p>
                                        <div className="text-sm text-gray-400 space-y-1">
                                            <p>📅 {pub.fecha_actividad ? new Date(pub.fecha_actividad).toLocaleDateString('es-ES', { timeZone: 'UTC' }) : "Fecha por definir"}</p>
                                            <p>📍 {pub.lugar || "No especificado"}</p>
                                        </div>
                                    </div>
                                    <div className="p-4 border-t border-gray-100">
                                        <button
                                            onClick={() => navigate('/login')}
                                            className="w-full bg-olive-leaf hover:bg-olive-leaf-400 text-white font-semibold py-2 rounded-lg transition"
                                        >
                                            Aplicar ahora
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </section>
            </main>

            {/* Footer simple */}
            <footer className="bg-voluntario-forest text-white text-center py-6 mt-12">
                <p>© 2025 Voluntario+ - Conectando voluntarios con causas</p>
            </footer>
        </div>
    );
};

export default Welcome;