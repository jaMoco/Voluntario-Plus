import React, { useState } from 'react';
import api from '../../servicios/api';
import toast from 'react-hot-toast';

const CompletarProyectoModal = ({ isOpen, onClose, aplicacionId, voluntarioNombre, onCompletado }) => {
    const [horas, setHoras] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!horas || horas <= 0) {
            toast.error('Ingresa un número válido de horas');
            return;
        }
        setLoading(true);
        try {
            await api.put(`/aplicaciones/${aplicacionId}/horas`, { horas_realizadas: horas });
            toast.success('Proyecto completado. Certificado generado');
            onCompletado();
            onClose();
        } catch (error) {
            toast.error('Error al completar proyecto');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-96">
                <h2 className="text-xl font-bold mb-4">Completar proyecto</h2>
                <p className="text-gray-600 mb-4">Voluntario: {voluntarioNombre}</p>
                <form onSubmit={handleSubmit}>
                    <label className="block mb-2">Horas realizadas:</label>
                    <input type="number" min="1" value={horas} onChange={(e) => setHoras(e.target.value)} className="w-full border rounded-lg p-2 mb-4" required />
                    <div className="flex justify-end gap-2">
                        <button type="button" onClick={onClose} className="px-4 py-2 border rounded-lg">Cancelar</button>
                        <button type="submit" disabled={loading} className="px-4 py-2 bg-voluntario-primary text-white rounded-lg">Completar</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CompletarProyectoModal;