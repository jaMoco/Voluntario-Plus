import React, { useState, useEffect } from 'react';
import api from '../../servicios/api';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

const PanelAdmin = ({ tab = 'stats' }) => {
    const [stats, setStats] = useState(null);
    const [dataList, setDataList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState(tab);

    useEffect(() => {
        cargarDatos();
    }, [activeTab]);

    const cargarDatos = async () => {
        setLoading(true);
        try {
            if (activeTab === 'stats') {
                const res = await api.get('/admin/estadisticas');
                setStats(res.data);
            } else if (activeTab === 'usuarios') {
                const res = await api.get('/admin/voluntarios');
                setDataList(res.data);
            } else if (activeTab === 'organizaciones') {
                const res = await api.get('/admin/organizaciones');
                setDataList(res.data);
            } else if (activeTab === 'eventos') {
                const res = await api.get('/admin/publicaciones');
                setDataList(res.data);
            }
        } catch (error) {
            toast.error('Error al cargar datos del panel');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleEliminarUsuario = async (id, nombre) => {
        if (!window.confirm(`¿Estás seguro de eliminar permanentemente al usuario "${nombre}"? Esta acción no se puede deshacer.`)) return;
        try {
            await api.delete(`/admin/usuarios/${id}`);
            toast.success('Usuario eliminado');
            cargarDatos();
        } catch (error) {
            toast.error('Error al eliminar usuario');
        }
    };

    const handleEliminarPublicacion = async (id, titulo) => {
        if (!window.confirm(`¿Eliminar la publicación "${titulo}"? Se enviará una notificación a la organización.`)) return;
        try {
            await api.delete(`/admin/publicaciones/${id}`);
            toast.success('Publicación eliminada y organización notificada');
            cargarDatos();
        } catch (error) {
            toast.error('Error al eliminar publicación');
        }
    };

    const handleToggleVerificacion = async (id, estadoActual) => {
        try {
            await api.put(`/admin/organizaciones/${id}/verificacion`, { verificada: !estadoActual });
            toast.success('Estado de verificación actualizado');
            cargarDatos();
        } catch (error) {
            toast.error('Error al actualizar verificación');
        }
    };

    const handleToggleActivo = async (id, estadoActual) => {
        try {
            await api.put(`/admin/usuarios/${id}/estado`, { activo: !estadoActual });
            toast.success('Estado del usuario actualizado');
            cargarDatos();
        } catch (error) {
            toast.error('Error al cambiar estado');
        }
    };

    if (loading && !stats && dataList.length === 0) return <div className="p-10 text-center">Cargando panel...</div>;

    return (
        <div className="max-w-7xl mx-auto py-8 px-4">
            <h1 className="text-3xl font-bold text-voluntario-deep mb-8">Panel de Administración</h1>

            {/* Navegación de pestañas */}
            <div className="flex border-b border-gray-200 mb-8 space-x-8">
                <button onClick={() => setActiveTab('stats')} className={`pb-4 px-2 text-sm font-medium transition-colors border-b-2 ${activeTab === 'stats' ? 'border-voluntario-primary text-voluntario-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>📊 Resumen</button>
                <button onClick={() => setActiveTab('usuarios')} className={`pb-4 px-2 text-sm font-medium transition-colors border-b-2 ${activeTab === 'usuarios' ? 'border-voluntario-primary text-voluntario-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>👥 Voluntarios</button>
                <button onClick={() => setActiveTab('organizaciones')} className={`pb-4 px-2 text-sm font-medium transition-colors border-b-2 ${activeTab === 'organizaciones' ? 'border-voluntario-primary text-voluntario-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>🏢 Organizaciones</button>
                <button onClick={() => setActiveTab('eventos')} className={`pb-4 px-2 text-sm font-medium transition-colors border-b-2 ${activeTab === 'eventos' ? 'border-voluntario-primary text-voluntario-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>📅 Eventos</button>
            </div>

            {/* Contenido según pestaña */}
            {activeTab === 'stats' && stats && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard title="Total Usuarios" value={stats.total_usuarios} color="bg-blue-500" />
                    <StatCard title="Voluntarios" value={stats.total_voluntarios} color="bg-green-500" />
                    <StatCard title="Organizaciones" value={stats.total_organizaciones} color="bg-purple-500" />
                    <StatCard title="Eventos Activos" value={stats.total_publicaciones_activas} color="bg-orange-500" />
                    <StatCard title="Postulaciones" value={stats.total_postulaciones} color="bg-indigo-500" />
                    <StatCard title="Org. Verificadas" value={stats.organizaciones_verificadas} color="bg-teal-500" />
                    <StatCard title="Con Discapacidad" value={stats.voluntarios_con_discapacidad} color="bg-red-500" />
                    <StatCard title="Estudiantes" value={stats.estudiantes_voluntarios} color="bg-yellow-500" />
                </div>
            )}

            {(activeTab === 'usuarios' || activeTab === 'organizaciones' || activeTab === 'eventos') && (
                <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            {activeTab === 'usuarios' && (
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre / Email</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cédula</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
                                </tr>
                            )}
                            {activeTab === 'organizaciones' && (
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Organización</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">RIF</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Verificada</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
                                </tr>
                            )}
                            {activeTab === 'eventos' && (
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Título / Organización</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ubicación</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
                                </tr>
                            )}
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {dataList.map((item) => (
                                <tr key={item.usuario_id || item.id}>
                                    {activeTab === 'usuarios' && (
                                        <>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">{item.nombre_completo}</div>
                                                <div className="text-sm text-gray-500">{item.email}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.cedula}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${item.activo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                    {item.activo ? 'Activo' : 'Inactivo'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <button onClick={() => handleToggleActivo(item.usuario_id, item.activo)} className="text-indigo-600 hover:text-indigo-900 mr-4">
                                                    {item.activo ? 'Desactivar' : 'Activar'}
                                                </button>
                                                <button onClick={() => handleEliminarUsuario(item.usuario_id, item.nombre_completo)} className="text-red-600 hover:text-red-900">Eliminar</button>
                                            </td>
                                        </>
                                    )}
                                    {activeTab === 'organizaciones' && (
                                        <>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">{item.nombre_oficial}</div>
                                                <div className="text-sm text-gray-500">{item.email_oficial}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.rif}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${item.verificada ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>
                                                    {item.verificada ? 'Verificada' : 'Pendiente'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <button onClick={() => handleToggleVerificacion(item.usuario_id, item.verificada)} className="text-indigo-600 hover:text-indigo-900 mr-4">
                                                    {item.verificada ? 'Quitar Verif.' : 'Verificar'}
                                                </button>
                                                <button onClick={() => handleEliminarUsuario(item.usuario_id, item.nombre_oficial)} className="text-red-600 hover:text-red-900">Eliminar</button>
                                            </td>
                                        </>
                                    )}
                                    {activeTab === 'eventos' && (
                                        <>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">{item.titulo}</div>
                                                <div className="text-sm text-gray-500">{item.organizacion_nombre}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.lugar}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {item.fecha_actividad ? new Date(item.fecha_actividad).toLocaleDateString() : 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <Link to={`/publicaciones/${item.id}`} className="text-indigo-600 hover:text-indigo-900 mr-4">Ver</Link>
                                                <button onClick={() => handleEliminarPublicacion(item.id, item.titulo)} className="text-red-600 hover:text-red-900">Eliminar</button>
                                            </td>
                                        </>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {dataList.length === 0 && !loading && (
                        <div className="p-8 text-center text-gray-500 italic">No se encontraron registros en esta sección.</div>
                    )}
                </div>
            )}
        </div>
    );
};

const StatCard = ({ title, value, color }) => (
    <div className={`${color} rounded-2xl p-6 text-white shadow-lg`}>
        <p className="text-white/80 text-sm font-medium uppercase tracking-wider mb-1">{title}</p>
        <p className="text-4xl font-bold">{value || 0}</p>
    </div>
);

export default PanelAdmin;