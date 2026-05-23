import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../servicios/api';
import toast from 'react-hot-toast';
import discapacidadData from '../../data/discapacidad.json';
import { useAuth } from '../../contextos/auth_context';

const EditarPerfilVoluntario = () => {
    const { user } = useAuth();
    const [formData, setFormData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [fotoFile, setFotoFile] = useState(null);
    const [fotoPreview, setFotoPreview] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const cargarDatos = async () => {
            try {
                const { data } = await api.get('/voluntario/perfil');
                // En voluntario_controller, los datos vienen dentro de la propiedad 'voluntario'
                setFormData(data.voluntario);
            } catch (err) {
                toast.error('Error al cargar los datos del perfil');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        cargarDatos();
    }, []);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        const finalValue = type === 'checkbox' ? checked : value;
        
        setFormData(prev => {
            const newData = { ...prev, [name]: finalValue };
            
            // Reseteos en cascada si desmarca opciones
            if (name === 'tiene_discapacidad' && !checked) {
                newData.discapacidad_categoria = '';
                newData.discapacidad_nivel = '';
                newData.tipo_discapacidad = '';
            }
            if (name === 'es_estudiante' && !checked) {
                newData.universidad = '';
                newData.carrera = '';
                newData.requiere_servicio_comunitario = false;
            }
            return newData;
        });
    };

    const handleDiscapacidadChange = (setterName, value) => {
        setFormData(prev => {
            const newData = { ...prev, [setterName]: value };
            if (setterName === 'discapacidad_categoria') {
                newData.discapacidad_nivel = '';
                newData.tipo_discapacidad = '';
            } else if (setterName === 'discapacidad_nivel') {
                newData.tipo_discapacidad = '';
            }
            return newData;
        });
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

            await api.put('/voluntario/perfil', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            toast.success('Perfil actualizado correctamente');
            navigate('/perfil');
        } catch (err) {
            toast.error(err.response?.data?.error || 'Error al actualizar el perfil');
        }
    };

    if (loading) return <div className="p-10 text-center text-voluntario-deep font-bold">Cargando formulario...</div>;
    if (!formData) return <div className="p-10 text-center">No se encontraron datos.</div>;

    const inputClasses = "w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-voluntario-primary outline-none transition-all";

    return (
        <div className="max-w-4xl mx-auto py-8 px-4">
            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-xl space-y-6">
                <div className="border-b pb-4">
                    <h2 className="text-2xl font-bold text-voluntario-deep">Editar mi Información Personal</h2>
                    <p className="text-gray-500 text-sm">Mantén tus datos actualizados para que las organizaciones te conozcan mejor.</p>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-6 mb-6">
                    <div className="relative">
                        <div className="w-24 h-24 rounded-full bg-gray-200 border-4 border-white shadow-lg overflow-hidden flex items-center justify-center">
                            {fotoPreview ? (
                                <img src={fotoPreview} alt="Preview" className="w-full h-full object-cover" />
                            ) : user?.foto_perfil ? (
                                <img src={`http://localhost:5000${user.foto_perfil}`} alt="Actual" className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-3xl text-gray-400">👤</span>
                            )}
                        </div>
                    </div>
                    <div className="flex-1 text-center sm:text-left">
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Foto de Perfil</label>
                        <input type="file" accept="image/*" onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) { setFotoFile(file); setFotoPreview(URL.createObjectURL(file)); }
                        }} className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-voluntario-light file:text-voluntario-deep hover:file:bg-voluntario-mid cursor-pointer" />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Nombre Completo</label>
                        <input type="text" name="nombre_completo" value={formData.nombre_completo} onChange={handleChange} className={inputClasses} required />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Cédula</label>
                        <input type="text" name="cedula" value={formData.cedula} onChange={handleChange} className={inputClasses} required />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Teléfono</label>
                        <input type="text" name="telefono" value={formData.telefono || ''} onChange={handleChange} className={inputClasses} />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Edad</label>
                        <input type="number" name="edad" value={formData.edad || ''} onChange={handleChange} className={inputClasses} />
                    </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-xl space-y-4">
                    <h3 className="font-bold text-voluntario-deep flex items-center gap-2">
                        🎓 Educación
                    </h3>
                    <div className="flex items-center gap-4 mb-4">
                        <label className="flex items-center gap-2 text-sm">
                            <input type="checkbox" name="es_estudiante" checked={formData.es_estudiante} onChange={handleChange} className="w-4 h-4 text-voluntario-primary" />
                            Soy estudiante
                        </label>
                    </div>

                    {formData.es_estudiante && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase">Universidad</label>
                                <input type="text" name="universidad" value={formData.universidad || ''} onChange={handleChange} className={inputClasses} />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase">Carrera</label>
                                <input type="text" name="carrera" value={formData.carrera || ''} onChange={handleChange} className={inputClasses} />
                            </div>
                            <div className="md:col-span-2">
                                <label className="flex items-center gap-2 text-sm">
                                    <input type="checkbox" name="requiere_servicio_comunitario" checked={formData.requiere_servicio_comunitario} onChange={handleChange} className="w-4 h-4" />
                                    Requiero horas de Servicio Comunitario
                                </label>
                            </div>
                        </div>
                    )}
                </div>

                {/* Sección de Discapacidad */}
                <div className="bg-gray-50 p-4 rounded-xl space-y-4">
                    <h3 className="font-bold text-voluntario-deep flex items-center gap-2">
                        ♿ Accesibilidad y Discapacidad
                    </h3>
                    <div className="flex items-center gap-4 mb-4">
                        <label className="flex items-center gap-2 text-sm">
                            <input type="checkbox" name="tiene_discapacidad" checked={formData.tiene_discapacidad ? true : false} onChange={handleChange} className="w-4 h-4 text-voluntario-primary" />
                            Tengo alguna discapacidad
                        </label>
                    </div>

                    {formData.tiene_discapacidad && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-fade-in">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase">Categoría</label>
                                <select name="discapacidad_categoria" value={formData.discapacidad_categoria || ''} onChange={(e) => handleDiscapacidadChange('discapacidad_categoria', e.target.value)} className={inputClasses}>
                                    <option value="">Selecciona</option>
                                    {Object.keys(discapacidadData).map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>
                            {formData.discapacidad_categoria && (
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase">Nivel</label>
                                    <select name="discapacidad_nivel" value={formData.discapacidad_nivel || ''} onChange={(e) => handleDiscapacidadChange('discapacidad_nivel', e.target.value)} className={inputClasses}>
                                        <option value="">Selecciona</option>
                                        {Object.keys(discapacidadData[formData.discapacidad_categoria]).map(nivel => (
                                            <option key={nivel} value={nivel}>{nivel.charAt(0).toUpperCase() + nivel.slice(1)}</option>
                                        ))}
                                    </select>
                                </div>
                            )}
                            {formData.discapacidad_nivel && (
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase">Tipo Específico</label>
                                    <select name="tipo_discapacidad" value={formData.tipo_discapacidad || ''} onChange={(e) => handleDiscapacidadChange('tipo_discapacidad', e.target.value)} className={inputClasses}>
                                        <option value="">Selecciona</option>
                                        {discapacidadData[formData.discapacidad_categoria][formData.discapacidad_nivel].map(tipo => (
                                            <option key={tipo} value={tipo}>{tipo}</option>
                                        ))}
                                    </select>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t">
                    <button type="button" onClick={() => navigate('/perfil')} className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 font-medium">Cancelar</button>
                    <button type="submit" className="px-8 py-2 bg-voluntario-primary text-white rounded-lg font-bold hover:bg-voluntario-dark transition-all shadow-md">Guardar Cambios</button>
                </div>
            </form>
        </div>
    );
};

export default EditarPerfilVoluntario;