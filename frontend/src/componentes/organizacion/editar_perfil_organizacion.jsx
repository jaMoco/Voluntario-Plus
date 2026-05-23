import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../servicios/api';
import toast from 'react-hot-toast';
import { useAuth } from '../../contextos/auth_context';

const EditarPerfilOrganizacion = () => {
    const { user } = useAuth();
    const [formData, setFormData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [fotoFile, setFotoFile] = useState(null);
    const [fotoPreview, setFotoPreview] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const cargar = async () => {
            try {
                const { data } = await api.get('/organizacion/perfil');
                setFormData(data);
            } catch (err) {
                toast.error('Error al cargar perfil');
            } finally {
                setLoading(false);
            }
        };
        cargar();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const data = new FormData();
            for (const key in formData) {
                if (formData[key] !== null && formData[key] !== undefined) {
                    data.append(key, formData[key]);
                }
            }
            if (fotoFile) {
                data.append('foto', fotoFile);
            }

            await api.put('/organizacion/perfil', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            toast.success('Perfil actualizado correctamente');
            navigate('/organizacion/perfil');
        } catch (err) {
            toast.error('Error al actualizar perfil');
        }
    };

    if (loading) return <div className="p-10 text-center">Cargando...</div>;

    return (
        <div className="max-w-4xl mx-auto py-8 px-4">
            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-lg space-y-4">
                <h2 className="text-2xl font-bold mb-6">Editar Perfil de Organización</h2>

                <div className="flex flex-col sm:flex-row items-center gap-6 mb-6">
                    <div className="relative">
                        <div className="w-24 h-24 rounded-2xl bg-gray-200 border-4 border-white shadow-lg overflow-hidden flex items-center justify-center">
                            {fotoPreview ? (
                                <img src={fotoPreview} alt="Preview" className="w-full h-full object-cover" />
                            ) : user?.foto_perfil ? (
                                <img src={`http://localhost:5000${user.foto_perfil}`} alt="Actual" className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-3xl text-gray-400">🏢</span>
                            )}
                        </div>
                    </div>
                    <div className="flex-1 text-center sm:text-left">
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Foto de Perfil (Logo)</label>
                        <input type="file" accept="image/*" onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) { setFotoFile(file); setFotoPreview(URL.createObjectURL(file)); }
                        }} className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-voluntario-light file:text-voluntario-deep hover:file:bg-voluntario-mid cursor-pointer" />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Nombre Oficial</label>
                        <input type="text" name="nombre_oficial" value={formData.nombre_oficial} onChange={handleChange} className="w-full border p-2 rounded mt-1" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Nombre Comercial</label>
                        <input type="text" name="nombre_comercial" value={formData.nombre_comercial || ''} onChange={handleChange} className="w-full border p-2 rounded mt-1" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Sitio Web</label>
                        <input type="url" name="sitio_web" value={formData.sitio_web || ''} onChange={handleChange} className="w-full border p-2 rounded mt-1" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Teléfono Principal</label>
                        <input type="text" name="telefono_principal" value={formData.telefono_principal} onChange={handleChange} className="w-full border p-2 rounded mt-1" />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Descripción de la Misión</label>
                    <textarea name="descripcion" value={formData.descripcion || ''} onChange={handleChange} rows="4" className="w-full border p-2 rounded mt-1"></textarea>
                </div>
                <div className="flex justify-end gap-3 mt-6">
                    <button type="button" onClick={() => navigate('/organizacion/perfil')} className="px-4 py-2 border rounded">Cancelar</button>
                    <button type="submit" className="px-4 py-2 bg-voluntario-primary text-white rounded font-bold">Guardar Cambios</button>
                </div>
            </form>
        </div>
    );
};

export default EditarPerfilOrganizacion;