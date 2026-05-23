import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../servicios/api';
import discapacidadData from '../../data/discapacidad.json';
import venezuelaData from '../../data/venezuela.json';

const FormularioPublicacion = () => {
    const [formData, setFormData] = useState({
        titulo: '',
        descripcion: '',
        categoria_id: '',
        apto_discapacidad: false,
        restricciones_discapacidad: false, // Nuevo: para indicar si hay restricciones específicas
        discapacidades_no_aptas: [], // Nuevo: array de discapacidades no aptas
        lugar: '',
        pais: 'Venezuela',
        estado: '',
        municipio: '',
        fecha_actividad: '',
        fecha_fin: '', // Asegurarse de que este campo exista para la validación de horas
        fecha_caducidad_postulacion: '',
        hora_inicio: '',
        hora_fin: '',
        plazas_disponibles: '',
        activa: true
    });
    const { id } = useParams(); // ID para el modo edición
    const [estados, setEstados] = useState([]);
    const [municipios, setMunicipios] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [currentDiscapacidadCategoria, setCurrentDiscapacidadCategoria] = useState('');
    const [currentDiscapacidadNivel, setCurrentDiscapacidadNivel] = useState('');
    const [currentTipoDiscapacidad, setCurrentTipoDiscapacidad] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const cargarCategorias = async () => {
            try {
                const { data } = await api.get('/organizacion/categorias');
                setCategorias(data);
            } catch (err) {
                console.error('Error al cargar categorías:', err);
            }
        };

        cargarCategorias();
        setEstados(Object.keys(venezuelaData).sort());
    }, []);

    // Generar opciones de hora cada 30 min entre 7am y 7pm
    const generarOpcionesHora = () => {
        const opciones = [];
        for (let h = 7; h <= 19; h++) {
            const hora = h.toString().padStart(2, '0');
            opciones.push(`${hora}:00`);
            if (h < 19) opciones.push(`${hora}:30`);
        }
        return opciones;
    };
    const opcionesHora = generarOpcionesHora();

    useEffect(() => {
        if (id) {
            const cargarPublicacion = async () => {
                try {
                    const { data } = await api.get(`/publicaciones/${id}`);
                    setFormData({
                        ...data,
                        restricciones_discapacidad: data.discapacidades_no_aptas?.length > 0,
                        apto_discapacidad: data.apto_discapacidad === 1 || data.apto_discapacidad === true,
                        // Formatear fechas a YYYY-MM-DD para que el navegador las reconozca
                        fecha_actividad: data.fecha_actividad ? data.fecha_actividad.split('T')[0] : '',
                        fecha_caducidad_postulacion: data.fecha_caducidad_postulacion ? data.fecha_caducidad_postulacion.split('T')[0] : '',
                        fecha_fin: data.fecha_fin ? data.fecha_fin.split('T')[0] : '',
                        // Normalizar campos para evitar errores con valores null en inputs controlados
                        lugar: data.lugar || '',
                        estado: data.estado || '',
                        municipio: data.municipio || '',
                        categoria_id: data.categoria_id || '',
                        plazas_disponibles: data.plazas_disponibles || '',
                        activa: data.activa === 1 || data.activa === true
                    });
                } catch (err) {
                    console.error(err);
                    setError('Error al cargar los datos de la publicación.');
                }
            };
            cargarPublicacion();
        }
    }, [id]);

    useEffect(() => {
        if (formData.estado && venezuelaData[formData.estado]) {
            setMunicipios(venezuelaData[formData.estado]);
        } else {
            setMunicipios([]);
        }
    }, [formData.estado]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        const newValue = type === 'checkbox' ? checked : value;

        setFormData(prev => {
            const newState = { ...prev, [name]: newValue };

            // Lógica de reseteo en cascada
            if (name === 'apto_discapacidad' && !newValue) {
                newState.restricciones_discapacidad = false;
                newState.discapacidades_no_aptas = [];
            }
            
            if (name === 'restricciones_discapacidad' && !newValue) {
                newState.discapacidades_no_aptas = [];
            }

            if (name === 'estado') {
                newState.municipio = '';
            }

            return newState;
        });

        // Limpiar selecciones temporales si se desactiva la sección
        if ((name === 'apto_discapacidad' && !checked) || (name === 'restricciones_discapacidad' && !checked)) {
            setCurrentDiscapacidadCategoria('');
            setCurrentDiscapacidadNivel('');
            setCurrentTipoDiscapacidad('');
        }
    };

    const handleDiscapacidadChange = (setter, value) => {
        setter(value);
        // Resetear niveles inferiores al cambiar una selección superior
        if (setter === setCurrentDiscapacidadCategoria) {
            setCurrentDiscapacidadNivel('');
            setCurrentTipoDiscapacidad('');
        } else if (setter === setCurrentDiscapacidadNivel) {
            setCurrentTipoDiscapacidad('');
        }
    };

    const handleAddDiscapacidadNoApta = () => {
        if (!currentDiscapacidadCategoria || !currentDiscapacidadNivel || !currentTipoDiscapacidad) {
            setError('Por favor, selecciona la categoría, nivel y tipo de discapacidad.');
            return;
        }

        const newRestriction = {
            categoria: currentDiscapacidadCategoria,
            nivel: currentDiscapacidadNivel,
            tipo: currentTipoDiscapacidad
        };

        // Evitar duplicados
        const isDuplicate = formData.discapacidades_no_aptas.some(
            (item) => item.categoria === newRestriction.categoria &&
                      item.nivel === newRestriction.nivel &&
                      item.tipo === newRestriction.tipo
        );

        if (isDuplicate) {
            setError('Esta restricción de discapacidad ya ha sido añadida.');
            return;
        }

        setFormData(prev => ({
            ...prev,
            discapacidades_no_aptas: [...prev.discapacidades_no_aptas, newRestriction]
        }));
        setCurrentDiscapacidadCategoria('');
        setCurrentDiscapacidadNivel('');
        setCurrentTipoDiscapacidad('');
        setError(''); // Limpiar errores si se añadió correctamente
    };

    const handleRemoveDiscapacidadNoApta = (indexToRemove) => {
        setFormData(prev => ({
            ...prev,
            discapacidades_no_aptas: prev.discapacidades_no_aptas.filter((_, index) => index !== indexToRemove)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            // Validar que la fecha sea mayor al día de hoy
            const hoy = new Date().toISOString().split('T')[0];
            if (formData.fecha_actividad && formData.fecha_actividad < hoy) {
                setError('La fecha de la actividad debe ser posterior al día de hoy.');
                setLoading(false);
                return;
            }

            // Validar fecha de caducidad
            if (formData.fecha_caducidad_postulacion) {
                if (formData.fecha_caducidad_postulacion < hoy) {
                    setError('La fecha de caducidad de postulación no puede ser anterior a hoy.');
                    setLoading(false);
                    return;
                }
                if (formData.fecha_actividad && formData.fecha_caducidad_postulacion > formData.fecha_actividad) {
                    setError('La fecha de caducidad de postulación no puede ser posterior a la fecha de la actividad.');
                    setLoading(false);
                    return;
                }
            }

            // Validar que la hora de fin sea posterior a la de inicio y estén en el rango permitido (7am a 7pm)
            if (formData.hora_inicio && formData.hora_fin) {
                if (formData.hora_inicio >= formData.hora_fin) {
                    setError('La hora de fin debe ser posterior a la hora de inicio.');
                    setLoading(false);
                    return;
                }
                if (formData.hora_inicio < "07:00" || formData.hora_fin > "19:00") {
                    setError('El horario de la actividad debe estar comprendido entre las 7:00 AM y las 7:00 PM.');
                    setLoading(false);
                    return;
                }
            }

            // Validar si hay una restricción seleccionada pero no añadida a la lista
            if (formData.apto_discapacidad && formData.restricciones_discapacidad) {
                if (currentDiscapacidadCategoria || currentDiscapacidadNivel || currentTipoDiscapacidad) {
                    setError('Tienes una restricción seleccionada que no has añadido. Haz clic en "+ Añadir restricción" o limpia la selección antes de guardar.');
                    setLoading(false);
                    return;
                }
                if (formData.discapacidades_no_aptas.length === 0) {
                    setError('Has indicado que hay restricciones, pero no has añadido ninguna a la lista.');
                    setLoading(false);
                    return;
                }
            }

            if (id) {
                await api.put(`/publicaciones/${id}`, formData);
                setSuccess('Publicación actualizada exitosamente');
            } else {
                await api.post('/publicaciones', formData);
                setSuccess('Publicación creada exitosamente');
            }
            setTimeout(() => navigate('/organizacion/panel'), 2000);
        } catch (err) {
            setError(err.response?.data?.error || 'Error al guardar la publicación');
        } finally {
            setLoading(false);
        }
    };

    const handleEliminar = async () => {
        if (!window.confirm('¿Estás seguro de que deseas eliminar esta publicación permanentemente?')) return;
        setLoading(true);
        try {
            await api.delete(`/publicaciones/${id}`);
            setSuccess('Publicación eliminada correctamente');
            setTimeout(() => navigate('/organizacion/panel'), 1500);
        } catch (err) {
            setError('Error al intentar eliminar la publicación');
            setLoading(false);
        }
    };


    const inputClasses = "mt-1 block w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-olive-leaf focus:border-transparent outline-none transition-all shadow-sm";
    const hoyString = new Date().toISOString().split('T')[0];

    return (
        <div className="max-w-3xl mx-auto bg-white p-8 rounded-xl shadow-lg">
            <h2 className="text-2xl font-bold text-voluntario-deep text-center mb-6">
                {id ? 'Editar oportunidad de voluntariado' : 'Nueva oportunidad de voluntariado'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Título *</label>
                    <input type="text" name="titulo" required value={formData.titulo} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md p-2" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Descripción *</label>
                    <textarea name="descripcion" rows="4" required value={formData.descripcion} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md p-2" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Categoría</label>
                        <select name="categoria_id" value={formData.categoria_id} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md p-2">
                            <option value="">Selecciona</option>
                            {categorias.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex items-center gap-2 mt-6">
                        <input type="checkbox" name="activa" checked={formData.activa} onChange={handleChange} className="w-4 h-4 text-olive-leaf border-gray-300 rounded focus:ring-olive-leaf" />
                        <label className="text-sm font-medium text-gray-700">Publicación activa (visible en el feed)</label>
                    </div>
                    <div className="flex items-center gap-2 mt-6">
                        <input type="checkbox" name="apto_discapacidad" checked={formData.apto_discapacidad} onChange={handleChange} className="w-4 h-4 text-olive-leaf border-gray-300 rounded focus:ring-olive-leaf" />
                        <label className="text-sm font-medium text-gray-700">Apto para personas con discapacidad</label>
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Lugar / Dirección</label>
                    <input type="text" name="lugar" value={formData.lugar} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md p-2" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">País</label>
                        <input type="text" name="pais" value={formData.pais} onChange={handleChange} className={inputClasses} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Estado</label>
                        <select name="estado" value={formData.estado} onChange={handleChange} className={inputClasses}>
                            <option value="">Selecciona un estado</option>
                            {estados.map(est => (
                                <option key={est} value={est}>{est}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Municipio</label>
                        <select name="municipio" value={formData.municipio} onChange={handleChange} className={inputClasses}>
                            <option value="">Selecciona un municipio</option>
                            {municipios.map(mun => (
                                <option key={mun} value={mun}>{mun}</option>
                            ))}
                        </select>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Fecha de actividad</label>
                        <input type="date" name="fecha_actividad" value={formData.fecha_actividad} min={hoyString} onChange={handleChange} className={inputClasses} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Fecha de fin (opcional)</label>
                        <input type="date" name="fecha_fin" value={formData.fecha_fin} min={formData.fecha_actividad || hoyString} onChange={handleChange} className={inputClasses} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Postulaciones hasta</label>
                        <input type="date" name="fecha_caducidad_postulacion" value={formData.fecha_caducidad_postulacion} min={hoyString} max={formData.fecha_actividad || ''} onChange={handleChange} className={inputClasses} />
                        <p className="text-xs text-gray-500 mt-1">Después de esta fecha no se aceptarán postulantes.</p>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Hora inicio</label>
                        <div className="relative">
                            <select name="hora_inicio" value={formData.hora_inicio ? formData.hora_inicio.slice(0, 5) : ''} onChange={handleChange} className={`${inputClasses} appearance-none bg-white pr-10`}>
                                <option value="">Selecciona hora</option>
                                {opcionesHora.map(hora => (
                                    <option key={hora} value={hora}>{hora}</option>
                                ))}
                            </select>
                            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Hora fin</label>
                        <div className="relative">
                            <select name="hora_fin" value={formData.hora_fin ? formData.hora_fin.slice(0, 5) : ''} onChange={handleChange} className={`${inputClasses} appearance-none bg-white pr-10`}>
                                <option value="">Selecciona hora</option>
                                {opcionesHora.map(hora => (
                                    <option key={hora} value={hora}>{hora}</option>
                                ))}
                            </select>
                            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Cupos disponibles *</label>
                        <input type="number" name="plazas_disponibles" min="0" required value={formData.plazas_disponibles} onChange={handleChange} className={`${inputClasses} ${formData.plazas_disponibles < 0 ? 'border-red-500 bg-red-50' : ''}`} />
                        {formData.plazas_disponibles < 0 && (
                            <p className="text-xs text-red-600 mt-1">⚠️ Tienes más postulaciones activas que cupos disponibles.</p>
                        )}
                        <p className="text-xs text-gray-500 mt-1">Este número se descontará automáticamente con cada postulación.</p>
                    </div>
                </div>

                {/* Sección de restricciones de discapacidad */}
                {formData.apto_discapacidad && (
                    <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 space-y-4 animate-fade-in">
                        <div className="flex items-center gap-2">
                            <input type="checkbox" name="restricciones_discapacidad" checked={formData.restricciones_discapacidad} onChange={handleChange} className="w-4 h-4 text-olive-leaf border-gray-300 rounded focus:ring-olive-leaf" />
                            <label className="text-sm font-medium text-gray-700">¿Existen discapacidades no aptas para esta actividad?</label>
                        </div>

                        {formData.restricciones_discapacidad && (
                            <div className="space-y-4">
                                <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mt-2 rounded-r-lg shadow-sm">
                                    <p className="text-sm text-blue-800">
                                        <strong>ℹ️ Recordatorio:</strong> Si has indicado que alguna discapacidad no puede postularse, recuerda que debes presionar el botón <strong>"+ Añadir restricción"</strong> para agregarla a la lista antes de publicar o guardar.
                                    </p>
                                </div>
                                <p className="text-sm text-gray-600">Selecciona las categorías de discapacidad que NO son aptas para esta publicación:</p>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Categoría *</label>
                                        <select value={currentDiscapacidadCategoria} onChange={(e) => handleDiscapacidadChange(setCurrentDiscapacidadCategoria, e.target.value)} className={inputClasses}>
                                            <option value="">Selecciona una categoría</option>
                                            {Object.keys(discapacidadData).map(cat => (
                                                <option key={cat} value={cat}>{cat}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {currentDiscapacidadCategoria && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Nivel de funcionalidad *</label>
                                            <select value={currentDiscapacidadNivel} onChange={(e) => handleDiscapacidadChange(setCurrentDiscapacidadNivel, e.target.value)} className={inputClasses}>
                                                <option value="">Selecciona el nivel</option>
                                                {Object.keys(discapacidadData[currentDiscapacidadCategoria]).map(nivel => (
                                                    <option key={nivel} value={nivel}>{nivel.charAt(0).toUpperCase() + nivel.slice(1)}</option>
                                                ))}
                                            </select>
                                        </div>
                                    )}

                                    {currentDiscapacidadNivel && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Discapacidad específica *</label>
                                            <select value={currentTipoDiscapacidad} onChange={(e) => handleDiscapacidadChange(setCurrentTipoDiscapacidad, e.target.value)} className={inputClasses}>
                                                <option value="">Selecciona una opción</option>
                                                {discapacidadData[currentDiscapacidadCategoria][currentDiscapacidadNivel].map(disc => (
                                                    <option key={disc} value={disc}>{disc}</option>
                                                ))}
                                            </select>
                                        </div>
                                    )}
                                </div>
                                <button type="button" onClick={handleAddDiscapacidadNoApta} className="mt-2 bg-olive-leaf hover:bg-olive-leaf-400 text-white px-4 py-2 rounded-lg flex items-center gap-1">
                                    + Añadir restricción
                                </button>

                                {formData.discapacidades_no_aptas.length > 0 && (
                                    <div className="mt-4 border-t pt-4">
                                        <h4 className="font-medium text-gray-700 mb-2">Restricciones añadidas:</h4>
                                        <ul className="list-disc pl-5 space-y-1">
                                            {formData.discapacidades_no_aptas.map((item, index) => (
                                                <li key={index} className="text-sm text-gray-800 flex justify-between items-center">
                                                    {item.categoria} - {item.nivel ? (item.nivel.charAt(0).toUpperCase() + item.nivel.slice(1)) : 'N/A'} - {item.tipo}
                                                    <button type="button" onClick={() => handleRemoveDiscapacidadNoApta(index)} className="text-red-500 hover:text-red-700 text-xs ml-2">Eliminar</button>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {error && <div className="text-red-500 text-sm">{error}</div>}
                {success && <div className="text-green-500 text-sm">{success}</div>}

                <div className="flex justify-end gap-3 pt-4">
                    {id && (
                        <button 
                            type="button" 
                            onClick={handleEliminar} 
                            className="mr-auto px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors shadow-sm"
                        >
                            Eliminar publicación
                        </button>
                    )}
                    <button type="button" onClick={() => navigate('/organizacion/panel')} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100">Cancelar</button>
                    <button type="submit" disabled={loading} className="bg-olive-leaf hover:bg-olive-leaf-400 text-white font-bold py-2 px-6 rounded-lg disabled:opacity-50">
                        {loading ? 'Procesando...' : (id ? 'Guardar cambios' : 'Publicar oportunidad')}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default FormularioPublicacion;