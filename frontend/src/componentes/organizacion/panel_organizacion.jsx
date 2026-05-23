import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../servicios/api';

const PanelOrganizacion = () => {
    const [publicaciones, setPublicaciones] = useState([]);
    const [estadisticas, setEstadisticas] = useState({
        total_publicaciones: 0,
        total_postulantes: 0,
        pendientes: 0
    });
    const [loading, setLoading] = useState(true);
    const [menuAbierto, setMenuAbierto] = useState(null); // ID de la publicación con menú abierto

    useEffect(() => {
        cargarDatos();
    }, []);

    const cargarDatos = async () => {
        try {
            const res = await api.get('/publicaciones/mis');
            setPublicaciones(res.data);
            // Calcular estadísticas
            let totalPostulantes = 0;
            let pendientes = 0;
            res.data.forEach(pub => {
                totalPostulantes += (pub.total_postulaciones || 0);
                pendientes += (pub.pendientes || 0);
            });
            setEstadisticas({
                total_publicaciones: res.data.length,
                total_postulantes: totalPostulantes,
                pendientes: pendientes
            });
        } catch (error) {
            console.error('Error cargando datos:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleEliminar = async (id) => {
        if (!window.confirm('¿Estás seguro de que deseas eliminar esta publicación permanentemente?')) return;
        try {
            await api.delete(`/publicaciones/${id}`);
            setPublicaciones(prev => prev.filter(p => p.id !== id));
            cargarDatos(); // Recargar estadísticas
        } catch (error) {
            console.error('Error al eliminar:', error);
            alert('No se pudo eliminar la publicación.');
        }
    };

    if (loading) return <div className="text-center py-10">Cargando...</div>;

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-voluntario-deep mb-6">Panel de mi organización</h1>
            
            {/* Tarjetas de estadísticas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl shadow-md text-center">
                    <p className="text-3xl font-bold text-voluntario-primary">{estadisticas.total_publicaciones}</p>
                    <p>Publicaciones activas</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-md text-center">
                    <p className="text-3xl font-bold text-voluntario-primary">{estadisticas.total_postulantes}</p>
                    <p>Postulaciones recibidas</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-md text-center">
                    <p className="text-3xl font-bold text-yellow-600">{estadisticas.pendientes}</p>
                    <p>Pendientes por revisar</p>
                </div>
            </div>

            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold">Mis publicaciones</h2>
                <Link to="/organizacion/nueva-publicacion" className="bg-voluntario-primary hover:bg-voluntario-dark text-white px-4 py-2 rounded-lg">
                    + Nueva oportunidad
                </Link>
            </div>

            {publicaciones.length === 0 ? (
                <div className="bg-white p-8 rounded-xl shadow-md text-center border border-dashed border-gray-300">
                    <p className="text-gray-500">No tienes publicaciones registradas bajo tu cuenta.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {publicaciones.map(pub => {
                        const pendientes = pub.pendientes || 0;
                        return (
                            <div key={pub.id} className="bg-white rounded-xl shadow-md p-4">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="w-8 h-8 bg-voluntario-light rounded-full flex items-center justify-center text-voluntario-deep font-bold text-xs">
                                                {pub.organizacion_nombre?.charAt(0) || 'O'}
                                            </div>
                                            <span className="text-gray-500 text-sm font-medium">{pub.organizacion_nombre}</span>
                                        <div className="ml-auto">
                                            {pub.plazas_disponibles <= 0 ? (
                                                <span className="bg-red-100 text-red-700 text-[10px] px-2 py-1 rounded-md font-bold uppercase tracking-wider">Agotado</span>
                                            ) : (
                                                <span className="bg-blue-50 text-blue-600 text-[10px] px-2 py-1 rounded-md font-bold uppercase tracking-wider">{pub.plazas_disponibles} cupos libres</span>
                                            )}
                                        </div>
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-800">{pub.titulo}</h3>
                                        <p className="text-gray-600 text-sm mt-1">{pub.fecha_actividad ? new Date(pub.fecha_actividad).toLocaleDateString('es-ES', { timeZone: 'UTC' }) : 'N/A'} | {pub.lugar}</p>
                                        <p className="mt-2">{pub.descripcion}</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Link to={`/organizacion/publicaciones/${pub.id}/postulantes`} className="bg-voluntario-mid text-voluntario-deep px-3 py-1 rounded-full text-sm font-medium hover:bg-voluntario-light transition-colors">
                                            {pendientes} pendiente(s)
                                        </Link>
                                        
                                        {/* Menú Desplegable */}
                                        <div className="relative">
                                            <button 
                                                onClick={() => setMenuAbierto(menuAbierto === pub.id ? null : pub.id)}
                                                className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
                                                title="Opciones"
                                            >
                                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                                                    <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                                                </svg>
                                            </button>

                                            {menuAbierto === pub.id && (
                                                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-xl z-10 animate-fade-in">
                                                    <Link to={`/organizacion/editar-publicacion/${pub.id}`} className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                                        <span>✏️</span> Modificar
                                                    </Link>
                                                    <button onClick={() => handleEliminar(pub.id)} className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                                                        <span>🗑️</span> Eliminar
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default PanelOrganizacion;
