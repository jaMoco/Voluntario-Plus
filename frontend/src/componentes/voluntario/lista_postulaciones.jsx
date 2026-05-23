import React from 'react';
import BotonCertificado from './boton_certificado';
import api from '../../servicios/api';
import toast from 'react-hot-toast';

const PostulacionesList = ({ postulaciones, onPostulacionEliminada }) => {
    if (postulaciones.length === 0) {
        return <p className="text-gray-500">No has realizado ninguna postulación aún.</p>;
    }

    return (
        <div className="space-y-3">
            {postulaciones.map(pos => (
                <div key={pos.id} className="border rounded-lg p-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <div>
                        <p className="font-semibold">{pos.titulo}</p>
                        <p className="text-sm text-gray-600">{pos.organizacion}</p>
                        <p className="text-xs text-gray-500">{pos.fecha_actividad ? new Date(pos.fecha_actividad).toLocaleDateString('es-ES', { timeZone: 'UTC' }) : 'N/A'} | {pos.lugar}</p>
                        <p className="text-xs">Aplicado: {new Date(pos.fecha_aplicacion).toLocaleDateString('es-ES')}</p>
                    </div>
                    <div className="flex flex-col sm:items-end gap-1 mt-2 sm:mt-0">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium
                            ${pos.estado === 'pendiente' ? 'bg-yellow-100 text-yellow-800' : ''}
                            ${pos.estado === 'aceptado' ? 'bg-green-100 text-green-800' : ''}
                            ${pos.estado === 'rechazado' ? 'bg-red-100 text-red-800' : ''}
                            ${pos.estado === 'completado' ? 'bg-blue-100 text-blue-800' : ''}
                        `}>
                            {pos.estado.toUpperCase()}
                        </span>
                        {pos.estado === 'completado' && (
                            <BotonCertificado aplicacionId={pos.id} />
                        )}
                        {pos.estado === 'pendiente' && (
                            <button
                                onClick={async () => {
                                    if (window.confirm('¿Estás seguro de que quieres eliminar esta postulación?')) {
                                        try {
                                            await api.delete(`/aplicaciones/${pos.id}`);
                                            toast.success('Postulación eliminada.');
                                            onPostulacionEliminada(); // Recargar la lista
                                        } catch (error) {
                                            toast.error(error.response?.data?.error || 'Error al eliminar postulación.');
                                        }
                                    }
                                }}
                                className="text-red-500 hover:text-red-700 text-xs mt-1"
                            >
                                Eliminar
                            </button>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default PostulacionesList;