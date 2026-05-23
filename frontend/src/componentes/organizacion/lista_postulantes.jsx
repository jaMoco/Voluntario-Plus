import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../servicios/api';
import AsignarInsigniaModal from './asignar_insignia_modal';
import CompletarProyectoModal from './completar_proyecto_modal';

const ListaPostulantes = () => {
    const { publicacionId } = useParams();
    const [postulantes, setPostulantes] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // Estados para modales
    const [modalInsignia, setModalInsignia] = useState(false);
    const [voluntarioActual, setVoluntarioActual] = useState(null);
    const [modalCompletar, setModalCompletar] = useState(false);
    const [aplicacionActual, setAplicacionActual] = useState(null);

    useEffect(() => {
        cargarPostulantes();
    }, [publicacionId]);

    const cargarPostulantes = async () => {
        try {
            const res = await api.get(`/aplicaciones/publicacion/${publicacionId}`);
            setPostulantes(res.data);
        } catch (error) {
            console.error('Error cargando postulantes:', error);
        } finally {
            setLoading(false);
        }
    };

    const cambiarEstado = async (aplicacionId, nuevoEstado) => {
        try {
            await api.put(`/aplicaciones/${aplicacionId}/estado`, { estado: nuevoEstado });
            setPostulantes(prev =>
                prev.map(p => p.id === aplicacionId ? { ...p, estado: nuevoEstado } : p)
            );
            alert(`Postulante ${nuevoEstado === 'aceptado' ? 'aceptado' : 'rechazado'} correctamente`);
        } catch (error) {
            alert('Error al cambiar estado');
        }
    };

    if (loading) return <div className="text-center py-10">Cargando postulantes...</div>;

    return (
        <div className="max-w-5xl mx-auto bg-white p-6 rounded-xl shadow-lg">
            <h2 className="text-2xl font-bold text-voluntario-deep mb-4">Postulantes</h2>
            {postulantes.length === 0 ? (
                <p>No hay postulantes aún.</p>
            ) : (
                <div className="space-y-4">
                    {postulantes.map(p => (
                        <div key={p.id} className="border rounded-lg p-4">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="font-semibold">{p.nombre}</p>
                                    <p className="text-sm text-gray-600">{p.email}</p>
                                    <p className="text-sm text-gray-500">Postulado: {new Date(p.fecha_aplicacion).toLocaleDateString()}</p>
                                    {p.estado === 'aceptado' && (
                                        <p className="text-sm text-voluntario-primary mt-1">✅ Aceptado - Esperando completar proyecto</p>
                                    )}
                                </div>
                                <div className="flex gap-2">
                                    {p.estado === 'pendiente' && (
                                        <>
                                            <button onClick={() => cambiarEstado(p.id, 'aceptado')} className="bg-green-500 text-white px-3 py-1 rounded">Aceptar</button>
                                            <button onClick={() => cambiarEstado(p.id, 'rechazado')} className="bg-red-500 text-white px-3 py-1 rounded">Rechazar</button>
                                        </>
                                    )}
                                    {p.estado !== 'pendiente' && (
                                        <span className={`px-3 py-1 rounded text-white ${p.estado === 'aceptado' ? 'bg-green-700' : 'bg-red-700'}`}>
                                            {p.estado.toUpperCase()}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Botones adicionales solo para postulantes aceptados */}
                            {p.estado === 'aceptado' && (
                                <div className="flex gap-3 mt-3 pt-2 border-t">
                                    <button
                                        onClick={() => {
                                            setVoluntarioActual(p);
                                            setModalInsignia(true);
                                        }}
                                        className="text-voluntario-primary text-sm hover:underline"
                                    >
                                        🏅 Asignar insignia
                                    </button>
                                    <button
                                        onClick={() => {
                                            setAplicacionActual(p);
                                            setModalCompletar(true);
                                        }}
                                        className="text-green-600 text-sm hover:underline"
                                    >
                                        ✅ Completar proyecto
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
            <button onClick={() => navigate('/organizacion/panel')} className="mt-6 text-voluntario-primary hover:underline">Volver al panel</button>

            {/* Modal asignar insignia */}
            {voluntarioActual && (
                <AsignarInsigniaModal
                    isOpen={modalInsignia}
                    onClose={() => setModalInsignia(false)}
                    voluntarioId={voluntarioActual.voluntario_id}
                    onAsignada={cargarPostulantes}
                />
            )}

            {/* Modal completar proyecto */}
            {aplicacionActual && (
                <CompletarProyectoModal
                    isOpen={modalCompletar}
                    onClose={() => setModalCompletar(false)}
                    aplicacionId={aplicacionActual.id}
                    voluntarioNombre={aplicacionActual.nombre}
                    onCompletado={cargarPostulantes}
                />
            )}
        </div>
    );
};

export default ListaPostulantes;