import React, { useState } from 'react';
import api from '../../servicios/api';
import toast from 'react-hot-toast';

const BotonPostulacion = ({ publicacion, onPostulacionExitosa }) => {
    const [loading, setLoading] = useState(false);
    const isAgotado = publicacion.plazas_disponibles <= 0;

    const handlePostular = async () => {
        if (isAgotado) return;
        
        setLoading(true);
        try {
            const response = await api.post('/aplicaciones', { 
                publicacion_id: publicacion.id 
            });
            toast.success(response.data.message || '¡Postulación enviada!');
            if (onPostulacionExitosa) onPostulacionExitosa();
        } catch (error) {
            const errorMsg = error.response?.data?.error || 'Error al enviar la postulación';
            toast.error(errorMsg);
            console.error('Error postulando:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handlePostular}
            disabled={loading || isAgotado}
            className={`
                w-full py-2 px-4 rounded-lg font-bold transition-all duration-200
                ${isAgotado 
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                    : 'bg-voluntario-primary hover:bg-voluntario-dark text-white shadow-md hover:shadow-lg active:transform active:scale-95'
                }
                ${loading ? 'opacity-70 animate-pulse' : ''}
            `}
        >
            {loading ? (
                'Enviando...'
            ) : isAgotado ? (
                '🚫 Cupos agotados'
            ) : (
                '🙌 Aplicar ahora'
            )}
        </button>
    );
};

export default BotonPostulacion;