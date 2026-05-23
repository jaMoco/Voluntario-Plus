import React, { useState, useEffect } from 'react';
import api from '../../servicios/api';
import { useAuth } from '../../contextos/auth_context';

const MisPostulaciones = () => {
    const { user } = useAuth();
    const [postulaciones, setPostulaciones] = useState([]);

    useEffect(() => {
        const cargar = async () => {
            const res = await api.get('/voluntario/postulaciones');
            setPostulaciones(res.data);
        };
        cargar();
    }, []);

    return (
        <div className="max-w-4xl mx-auto py-8 px-4">
            <h1 className="text-2xl font-bold text-voluntario-deep">Mis postulaciones</h1>
            {postulaciones.map(p => (
                <div key={p.id} className="bg-white p-4 rounded shadow mt-2">
                    <p><strong>{p.titulo}</strong> - Estado: {p.estado}</p>
                </div>
            ))}
        </div>
    );
};
export default MisPostulaciones;