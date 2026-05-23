import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../servicios/api';
import InsigniasList from './lista_insignias';
import PostulacionesList from './lista_postulaciones';
import { useAuth } from '../../contextos/auth_context';

const PerfilVoluntario = () => {
    const { user } = useAuth();
    const [perfil, setPerfil] = useState(null);
    const [insignias, setInsignias] = useState([]);
    const [postulaciones, setPostulaciones] = useState([]);
    const [actividades, setActividades] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const cargarPerfil = async () => {
            try {
                const res = await api.get('/voluntario/perfil');
                setPerfil(res.data.voluntario);
                setInsignias(res.data.insignias);
                setPostulaciones(res.data.postulaciones);

                // Cargar actividades
                const actRes = await api.get('/usuario/actividades');
                setActividades(actRes.data);
            } catch (error) {
                console.error('Error cargando perfil:', error);
            } finally {
                setLoading(false);
            }
        };
        cargarPerfil();
    }, []);

    if (loading) return <div className="text-center py-10">Cargando perfil...</div>;
    if (!perfil) return <div className="text-center py-10">No se pudo cargar el perfil</div>;

    return (
        <div className="max-w-6xl mx-auto py-8 px-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Columna Principal */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                        <div className="bg-voluntario-deep text-white p-6 flex justify-between items-center">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-full bg-white/20 border-2 border-white overflow-hidden flex items-center justify-center">
                                    {user?.foto_perfil ? (
                                        <img src={`http://localhost:5000${user.foto_perfil}`} alt="Perfil" className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-2xl font-bold">{perfil.nombre_completo.charAt(0)}</span>
                                    )}
                                </div>
                                <div>
                                    <h1 className="text-3xl font-bold">Mi perfil</h1>
                                    <p className="text-voluntario-light">{perfil.nombre_completo}</p>
                                </div>
                            </div>
                            <Link to="/perfil/editar" className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg text-sm font-bold transition-all border border-white/20">
                                ✏️ Editar Datos
                            </Link>
                        </div>
                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <h2 className="text-xl font-semibold text-voluntario-deep mb-3">Datos personales</h2>
                                    <div className="space-y-2">
                                        <p><span className="font-medium">Cédula:</span> {perfil.cedula}</p>
                                        <p><span className="font-medium">Email:</span> {perfil.email}</p>
                                        <p><span className="font-medium">Teléfono:</span> {perfil.telefono || 'No registrado'}</p>
                                        <p><span className="font-medium">Edad:</span> {perfil.edad || '-'}</p>
                                        <p><span className="font-medium">Fecha nac.:</span> {perfil.fecha_nacimiento ? new Date(perfil.fecha_nacimiento).toLocaleDateString('es-ES', { timeZone: 'UTC' }) : '-'}</p>
                                        <p><span className="font-medium">Ubicación:</span> {perfil.ubicacion_pais}, {perfil.ubicacion_estado}, {perfil.ubicacion_municipio}</p>
                                        <p><span className="font-medium">Discapacidad:</span> {perfil.tiene_discapacidad ? 'Sí' : 'No'} {perfil.tipo_discapacidad ? `(${perfil.tipo_discapacidad})` : ''}</p>
                                        {perfil.es_estudiante && (
                                            <>
                                                <p><span className="font-medium">Estudiante:</span> Sí</p>
                                                <p><span className="font-medium">Universidad:</span> {perfil.universidad}</p>
                                                <p><span className="font-medium">Carrera:</span> {perfil.carrera}</p>
                                                <p><span className="font-medium">Requiere servicio comunitario:</span> {perfil.requiere_servicio_comunitario ? 'Sí' : 'No'}</p>
                                            </>
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <InsigniasList insignias={insignias} />
                                </div>
                            </div>

                            <div className="mt-8">
                                <h2 className="text-xl font-semibold text-voluntario-deep mb-3">Mis postulaciones</h2>
                                <PostulacionesList postulaciones={postulaciones} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Columna Derecha: Actividades */}
                <div className="lg:col-span-1 space-y-6">
                    <section className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <span>🕒</span> Mi Actividad
                        </h2>
                        {actividades.length === 0 ? (
                            <p className="text-sm text-gray-500 text-center py-4">Aún no hay actividad reciente.</p>
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

export default PerfilVoluntario;