import React, { useState, useEffect } from 'react';
import api from '../../servicios/api';
import toast from 'react-hot-toast';

const AsignarInsigniaModal = ({ isOpen, onClose, voluntarioId, onAsignada }) => {
    const [insignias, setInsignias] = useState([]);
    const [selected, setSelected] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            cargarInsignias();
        }
    }, [isOpen]);

    const cargarInsignias = async () => {
        try {
            const res = await api.get('/insignias/disponibles');
            setInsignias(res.data);
        } catch (error) {
            toast.error('Error al cargar insignias');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selected) return;
        setLoading(true);
        try {
            await api.post('/organizacion/asignar-insignia', {
                voluntario_id: voluntarioId,
                insignia_id: selected
            });
            toast.success('Insignia asignada correctamente');
            onAsignada();
            onClose();
        } catch (error) {
            toast.error('Error al asignar insignia');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-96">
                <h2 className="text-xl font-bold mb-4">Asignar insignia</h2>
                <form onSubmit={handleSubmit}>
                    <select value={selected} onChange={(e) => setSelected(e.target.value)} className="w-full border rounded-lg p-2 mb-4" required>
                        <option value="">Selecciona una insignia</option>
                        {insignias.map(ins => (
                            <option key={ins.id} value={ins.id}>{ins.nombre}</option>
                        ))}
                    </select>
                    <div className="flex justify-end gap-2">
                        <button type="button" onClick={onClose} className="px-4 py-2 border rounded-lg">Cancelar</button>
                        <button type="submit" disabled={loading} className="px-4 py-2 bg-voluntario-primary text-white rounded-lg">Asignar</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AsignarInsigniaModal;