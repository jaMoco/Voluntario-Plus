import React, { useState } from 'react';
import api from '../../servicios/api';

const BotonCertificado = ({ aplicacionId }) => {
    const [descargando, setDescargando] = useState(false);

    const handleDescargar = async () => {
        setDescargando(true);
        try {
            const response = await api.get(`/certificados/descargar/${aplicacionId}`, {
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `certificado_${aplicacionId}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            alert('Error al generar el certificado');
        } finally {
            setDescargando(false);
        }
    };

    return (
        <button
            onClick={handleDescargar}
            disabled={descargando}
            className="text-sm bg-voluntario-primary text-white px-3 py-1 rounded hover:bg-voluntario-dark transition disabled:opacity-50"
        >
            {descargando ? 'Generando...' : '📄 Certificado'}
        </button>
    );
};

export default BotonCertificado;