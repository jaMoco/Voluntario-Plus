import React, { useState, useEffect } from 'react';
import api from '../../servicios/api';
import PostulacionesList from './lista_postulaciones';
import Loader from '../comunes/loader';

const MisPostulaciones = () => {
    const [postulaciones, setPostulaciones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => { // Se ejecuta al montar el componente y cuando se llama a cargarPostulaciones
        const cargarPostulaciones = async () => {
            try {
                // Se asume que el endpoint devuelve las postulaciones del voluntario autenticado
                const res = await api.get('/aplicaciones/mis');
                setPostulaciones(res.data);
            } catch (err) {
                console.error('Error cargando postulaciones:', err);
                setError('No se pudieron cargar tus postulaciones. Inténtalo de nuevo más tarde.');
            } finally {
                setLoading(false);
            }
        };
        cargarPostulaciones();
    }, []); // Dependencia vacía para que se ejecute solo una vez al montar

    if (loading) return <Loader />;

    return (
        <div className="max-w-5xl mx-auto py-8 px-4">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="bg-voluntario-deep text-white p-6">
                    <h1 className="text-3xl font-bold">Mis Postulaciones</h1>
                    <p className="text-voluntario-light">Seguimiento de tus solicitudes de voluntariado</p>
                </div>
                <div className="p-6">
                    {error && <p className="text-red-500 mb-4">{error}</p>}
                    <PostulacionesList postulaciones={postulaciones} onPostulacionEliminada={cargarPostulaciones} />
                </div>
            </div>
        </div>
    );
};

export default MisPostulaciones;