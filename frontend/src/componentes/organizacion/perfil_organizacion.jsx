import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../servicios/api';
import { useAuth } from '../../contextos/auth_context';

const PerfilOrganizacion = () => {
    const { user } = useAuth();
    const [perfil, setPerfil] = useState(null);
    const [publicaciones, setPublicaciones] = useState([]);
    const [actividades, setActividades] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const cargarDatos = async () => {
            try {
                setLoading(true);
                
                // Intentamos cargar el perfil
                try {
                    const perfilRes = await api.get('/organizacion/perfil');
                    setPerfil(perfilRes.data);
                } catch (pError) {
                    console.error('Error al cargar perfil:', pError.response?.status, pError.response?.data || pError.message);
                    if (pError.response?.status === 404) {
                        console.warn('⚠️ Verifica que app.use("/api/organizacion", ...) esté en tu app.js');
                    }
                    setPerfil(null);
                }

                // Intentamos cargar las publicaciones
                try {
                    const pubsRes = await api.get('/publicaciones/mis');
                    setPublicaciones(pubsRes.data);
                } catch (mError) {
                    console.error('Error al cargar publicaciones:', mError.response?.data || mError.message);
                    setPublicaciones([]);
                }

                // Intentamos cargar las actividades
                try {
                    const actRes = await api.get('/usuario/actividades');
                    setActividades(actRes.data);
                } catch (aError) {
                    console.error('Error al cargar actividades:', aError);
                }

            } catch (error) {
                console.error('Error general en cargarDatos:', error);
            } finally {
                setLoading(false);
            }
        };
        cargarDatos();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-voluntario-primary"></div>
            </div>
        );
    }

    if (!perfil) {
        return (
            <div className="max-w-4xl mx-auto py-12 px-4 text-center">
                <h2 className="text-2xl font-bold text-gray-800">No se pudo cargar la información</h2>
                <p className="text-gray-600 mt-2">Por favor, intenta de nuevo más tarde.</p>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto py-10 px-4 space-y-8">
            {/* Encabezado Principal */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 flex flex-col md:flex-row gap-6 items-center md:items-start transition-all hover:shadow-md">
                <div className="w-24 h-24 bg-voluntario-mid rounded-2xl flex items-center justify-center text-voluntario-deep text-4xl font-bold shadow-inner overflow-hidden border-2 border-white">
                    {perfil.foto_perfil || user?.foto_perfil ? (
                        <img src={`http://localhost:5000${perfil.foto_perfil || user?.foto_perfil}`} alt="Logo" className="w-full h-full object-cover" />
                    ) : (
                        perfil.nombre_oficial?.charAt(0)
                    )}
                </div>
                <div className="flex-1 text-center md:text-left">
                    <div className="flex flex-col md:flex-row md:items-center gap-2 mb-2">
                        <h1 className="text-3xl font-bold text-gray-900">{perfil.nombre_oficial}</h1>
                        {perfil.verificada ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 w-fit self-center">
                                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
                                Verificada
                            </span>
                        ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 w-fit self-center">
                                Pendiente de verificación
                            </span>
                        )}
                    </div>
                    <p className="text-gray-500 font-medium">{perfil.tipo_organizacion} • RIF: {perfil.rif}</p>
                    <div className="mt-4 flex flex-wrap justify-center md:justify-start gap-4">
                        <a href={`mailto:${perfil.email_oficial}`} className="text-sm text-voluntario-primary hover:underline flex items-center gap-1">
                            📧 {perfil.email_oficial}
                        </a>
                        {perfil.sitio_web && (
                            <a href={perfil.sitio_web} target="_blank" rel="noopener noreferrer" className="text-sm text-voluntario-primary hover:underline flex items-center gap-1">
                                🌐 Sitio Web
                            </a>
                        )}
                        <span className="text-sm text-gray-600 flex items-center gap-1">
                            📍 {perfil.ciudad_estado}, {perfil.pais_constitucion || 'Venezuela'}
                        </span>
                    </div>
                </div>
                <Link to="/organizacion/perfil/editar" className="bg-gray-100 text-gray-700 px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-gray-200 transition-all border border-gray-200 flex items-center gap-2">
                    <span>✏️</span> Editar Perfil
                </Link>
                <Link to="/organizacion/panel" className="bg-voluntario-primary text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-voluntario-dark transition-all shadow-md hover:shadow-lg flex items-center gap-2">
                    <span>📊</span> Panel de Gestión
                </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Columna Izquierda: Detalles */}
                <div className="lg:col-span-1 space-y-6 order-2 lg:order-1">
                    <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <span>📋</span> Información General
                        </h2>
                        <div className="space-y-4 text-sm">
                            <div>
                                <p className="text-gray-500 uppercase text-[10px] font-bold tracking-wider">Sector / Industria</p>
                                <p className="text-gray-900 font-medium">{perfil.sector_industria || 'No especificado'}</p>
                            </div>
                            <div>
                                <p className="text-gray-500 uppercase text-[10px] font-bold tracking-wider">Representante Legal</p>
                                <p className="text-gray-900 font-medium">{perfil.representante_nombre}</p>
                                <p className="text-gray-600 italic text-xs">{perfil.representante_cargo}</p>
                            </div>
                            <div>
                                <p className="text-gray-500 uppercase text-[10px] font-bold tracking-wider">Dirección Fiscal</p>
                                <p className="text-gray-900 leading-relaxed">{perfil.direccion_fiscal}</p>
                            </div>
                        </div>
                    </section>

                    <section className="bg-voluntario-deep text-white rounded-2xl p-6">
                        <h3 className="text-lg font-bold mb-2">Sobre nosotros</h3>
                        <p className="text-voluntario-light/90 text-sm leading-relaxed">
                            {perfil.descripcion || 'Esta organización aún no ha proporcionado una descripción detallada de su misión.'}
                        </p>
                    </section>
                </div>

                {/* Columna Derecha: Publicaciones */}
                <div className="lg:col-span-2 space-y-6 order-3 lg:order-2">
                    <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-gray-900">Oportunidades Publicadas</h2>
                            <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full font-semibold">
                                {publicaciones.length} total
                            </span>
                        </div>
                        
                        {publicaciones.length === 0 ? (
                            <div className="text-center py-12 border-2 border-dashed border-gray-100 rounded-xl">
                                <p className="text-gray-400">No hay publicaciones registradas bajo tu cuenta.</p>
                                <Link to="/organizacion/nueva-publicacion" className="text-voluntario-primary font-semibold mt-2 inline-block hover:underline">
                                    + Crear mi primera oportunidad
                                </Link>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {publicaciones.map(pub => (
                                    <div key={pub.id} className="group p-4 rounded-xl border border-gray-100 hover:border-voluntario-mid hover:bg-voluntario-light/10 transition-all">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="font-bold text-gray-900 group-hover:text-voluntario-deep transition-colors">
                                                    {pub.titulo}
                                                </h3>
                                                <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                                                    <span className="flex items-center gap-1">
                                                        📅 {pub.fecha_actividad ? new Date(pub.fecha_actividad).toLocaleDateString() : 'Pendiente'}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        📍 {pub.lugar}
                                                    </span>
                                                </div>
                                            {pub.apto_discapacidad ? (
                                                <div className="mt-2">
                                                    <span className="text-[10px] font-bold text-green-600 uppercase tracking-wider">♿ Apto para discapacidad</span>
                                                    {pub.discapacidades_no_aptas && pub.discapacidades_no_aptas.length > 0 && (
                                                        <div className="mt-1">
                                                            <p className="text-[10px] text-red-500 font-bold uppercase">Restricciones:</p>
                                                            <div className="flex flex-wrap gap-1 mt-0.5">
                                                                {pub.discapacidades_no_aptas.map((dis, i) => (
                                                                    <span key={i} className="text-[9px] bg-red-50 text-red-600 px-1.5 py-0.5 rounded border border-red-100">
                                                                        {dis.tipo} ({dis.nivel})
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="mt-2">
                                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">🚫 No apto para discapacidad</span>
                                                </div>
                                            )}
                                            </div>
                                            <div className="text-right">
                                                <div className="text-xs font-bold text-voluntario-primary mb-1">
                                                    {pub.plazas_disponibles} cupos
                                                </div>
                                                <Link to={`/organizacion/editar-publicacion/${pub.id}`} className="text-xs text-gray-400 hover:text-gray-600 underline">
                                                    Ver / Editar
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                </div>

                {/* Columna Derecha Extrema: Actividades */}
                <div className="lg:col-span-1 space-y-6 order-1 lg:order-3">
                    <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <span>🕒</span> Actividad Reciente
                        </h2>
                        {actividades.length === 0 ? (
                            <p className="text-sm text-gray-500 text-center py-4">No hay actividad reciente.</p>
                        ) : (
                            <div className="relative border-l-2 border-gray-100 ml-3 space-y-6">
                                {actividades.map(act => (
                                    <div key={act.id} className="relative pl-6">
                                        <div className="absolute w-3 h-3 bg-voluntario-primary rounded-full -left-[7px] top-1 border-2 border-white"></div>
                                        <h3 className="text-sm font-bold text-gray-800">{act.titulo}</h3>
                                        <p className="text-xs text-gray-500 mt-1">{act.descripcion}</p>
                                        <span className="text-[10px] text-gray-400 mt-1 block">
                                            {new Date(act.fecha_creacion).toLocaleString('es-ES')}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                </div>
            </div>
        </div>
    );
};

export default PerfilOrganizacion;