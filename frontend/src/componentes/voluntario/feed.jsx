import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../servicios/api';
import toast from 'react-hot-toast';
import { useAuth } from '../../contextos/auth_context';

const FeedVoluntario = () => {
    const { user } = useAuth();
    const [publicaciones, setPublicaciones] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [loading, setLoading] = useState(true);
    const [aplicando, setAplicando] = useState(null);
    const navigate = useNavigate();

    const normalize = (str) => {
        if (!str) return '';
        return str.toString()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "") // Remueve acentos y tildes
            .replace(/[^a-zA-Z0-9]/g, "")    // Remueve espacios y caracteres especiales
            .toLowerCase();
    };

    // Estados de filtros
    const [categoria, setCategoria] = useState('');
    const [aptoDiscapacidad, setAptoDiscapacidad] = useState('');
    const [busqueda, setBusqueda] = useState('');
    const [fechaInicio, setFechaInicio] = useState('');
    const [fechaFin, setFechaFin] = useState('');
    const [soloDisponibles, setSoloDisponibles] = useState(false);
    const [orden, setOrden] = useState('recientes'); // 'recientes' o 'proximos'
    const [categoriasList, setCategoriasList] = useState([]);

    useEffect(() => {
        cargarCategorias();
        cargarPublicaciones();
    }, []);

    const cargarCategorias = async () => {
        try {
            const res = await api.get('/categorias');
            setCategoriasList(res.data);
        } catch (error) {
            console.error('Error cargando categorías:', error);
        }
    };

    const cargarPublicaciones = async () => {
        try {
            const res = await api.get('/publicaciones');
            setPublicaciones(res.data);
            setFiltered(res.data);
        } catch (error) {
            toast.error('Error al cargar oportunidades');
        } finally {
            setLoading(false);
        }
    };

    const aplicarFiltros = () => {
        let resultados = [...publicaciones];
        if (categoria) {
            resultados = resultados.filter(pub => pub.categoria_id == categoria);
        }
        if (aptoDiscapacidad !== '') {
            resultados = resultados.filter(pub => pub.apto_discapacidad === (aptoDiscapacidad === 'true'));
        }
        if (busqueda) {
            const term = busqueda.toLowerCase();
            resultados = resultados.filter(pub => 
                pub.titulo.toLowerCase().includes(term) || 
                pub.descripcion.toLowerCase().includes(term) ||
                pub.lugar?.toLowerCase().includes(term)
            );
        }
        if (soloDisponibles) {
            resultados = resultados.filter(pub => (pub.plazas_disponibles || 0) > 0);
        }
        if (fechaInicio) {
            resultados = resultados.filter(pub => new Date(pub.fecha_actividad) >= new Date(fechaInicio));
        }
        if (fechaFin) {
            resultados = resultados.filter(pub => new Date(pub.fecha_actividad) <= new Date(fechaFin));
        }

        // Ordenamiento
        if (orden === 'recientes') {
            resultados.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
        } else if (orden === 'proximos') {
            resultados.sort((a, b) => new Date(a.fecha_actividad || 0) - new Date(b.fecha_actividad || 0));
        }

        setFiltered(resultados);
    };

    const limpiarFiltros = () => {
        setCategoria('');
        setAptoDiscapacidad('');
        setBusqueda('');
        setFechaInicio('');
        setFechaFin('');
        setSoloDisponibles(false);
        setOrden('recientes');
        setFiltered(publicaciones);
    };

    const handleAplicar = async (publicacionId) => {
        setAplicando(publicacionId);
        try {
            await api.post('/aplicaciones', { publicacion_id: publicacionId });
            toast.success('Solicitud enviada correctamente');
            // Actualizar estado local
            setFiltered(prev =>
                prev.map(pub =>
                    pub.id === publicacionId ? { ...pub, yaAplico: true } : pub
                )
            );
            setPublicaciones(prev =>
                prev.map(pub =>
                    pub.id === publicacionId ? { ...pub, yaAplico: true } : pub
                )
            );
        } catch (error) {
            const msg = error.response?.data?.error || 'Error al aplicar';
            toast.error(msg);
        } finally {
            setAplicando(null);
        }
    };

    if (loading) return <div className="text-center py-10">Cargando oportunidades...</div>;

    return (
        <div className="max-w-6xl mx-auto py-8 px-4">
            <h1 className="text-3xl font-bold text-voluntario-deep mb-6">Oportunidades de voluntariado</h1>

            {/* Panel de filtros */}
            <div className="bg-white p-4 rounded-xl shadow-md mb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Categoría</label>
                        <select value={categoria} onChange={(e) => setCategoria(e.target.value)} className="w-full border rounded-lg p-2">
                            <option value="">Todas</option>
                            {categoriasList.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Apto para discapacidad</label>
                        <select value={aptoDiscapacidad} onChange={(e) => setAptoDiscapacidad(e.target.value)} className="w-full border rounded-lg p-2">
                            <option value="">Todos</option>
                            <option value="true">Sí</option>
                            <option value="false">No</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Palabra clave</label>
                        <input type="text" placeholder="Ej. Taller, Caracas..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} className="w-full border rounded-lg p-2" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Ordenar por</label>
                        <select value={orden} onChange={(e) => setOrden(e.target.value)} className="w-full border rounded-lg p-2">
                            <option value="recientes">Más recientes</option>
                            <option value="proximos">Próximos eventos</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Fecha desde</label>
                        <input type="date" value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)} className="w-full border rounded-lg p-2" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Fecha hasta</label>
                        <input type="date" value={fechaFin} onChange={(e) => setFechaFin(e.target.value)} className="w-full border rounded-lg p-2" />
                    </div>
                    <div className="flex items-center pt-6">
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 cursor-pointer">
                            <input type="checkbox" checked={soloDisponibles} onChange={(e) => setSoloDisponibles(e.target.checked)} className="w-4 h-4 text-voluntario-primary border-gray-300 rounded focus:ring-voluntario-primary" />
                            Solo con cupos disponibles
                        </label>
                    </div>
                    <div className="flex gap-2 items-end">
                        <button onClick={aplicarFiltros} className="bg-voluntario-primary text-white px-4 py-2 rounded-lg">Filtrar</button>
                        <button onClick={limpiarFiltros} className="border border-gray-300 px-4 py-2 rounded-lg">Limpiar</button>
                    </div>
                </div>
            </div>

            {/* Lista de publicaciones */}
            <div className="space-y-6">
                {filtered.length === 0 ? (
                    <p className="text-center text-gray-500">No hay oportunidades que coincidan con los filtros.</p>
                ) : (
                    filtered.map(pub => {
                        // Verificación ultra-segura de discapacidad (maneja 1/0 o true/false)
                        const userTieneDiscapacidad = user?.tiene_discapacidad === true || user?.tiene_discapacidad === 1 || user?.tiene_discapacidad === '1' || user?.tiene_discapacidad === 'true';

                        const esAptoGeneral = pub.apto_discapacidad === true || pub.apto_discapacidad === 1 || pub.apto_discapacidad === '1';

                        const esIncompatible = user?.rol === 'voluntario' && 
                            userTieneDiscapacidad && (
                                !esAptoGeneral ||
                                (Array.isArray(pub.discapacidades_no_aptas) && pub.discapacidades_no_aptas.some(res => 
                                    res.tipo && user?.tipo_discapacidad &&
                                    normalize(res.tipo) === normalize(user.tipo_discapacidad)
                                ))
                            );

                        return (
                            <div key={pub.id} className="bg-white rounded-xl shadow-md overflow-hidden">
                            <div className="p-6">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-10 h-10 bg-voluntario-light rounded-full flex items-center justify-center text-voluntario-deep font-bold">
                                        {pub.organizacion_nombre?.charAt(0) || 'O'}
                                    </div>
                                    <span className="text-gray-600">{pub.organizacion_nombre}</span>
                                </div>
                                <h2 className="text-xl font-bold text-gray-800">{pub.titulo}</h2>
                                <p className="text-gray-600 mt-2">{pub.descripcion}</p>
                                <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-500">
                                    <span>📅 {pub.fecha_actividad ? new Date(pub.fecha_actividad).toLocaleDateString('es-ES', { timeZone: 'UTC' }) : 'Fecha por definir'}</span>
                                    <span>📍 {pub.lugar || 'No especificado'}</span>
                                    <span className={`font-medium ${pub.plazas_disponibles <= 0 ? 'text-red-600' : 'text-voluntario-forest'}`}>
                                        {pub.plazas_disponibles <= 0 
                                            ? '🚫 Sin cupos' 
                                            : `👥 ${pub.plazas_disponibles} cupos disponibles`}
                                    </span>
                                </div>
                                {pub.apto_discapacidad && (
                                    <span className="inline-block mt-2 bg-voluntario-mid text-voluntario-deep text-xs px-2 py-1 rounded-full">
                                        ♿ Apto para discapacidad
                                    </span>
                                )}
                            </div>
                            <div className="px-6 pb-6">
                                {esIncompatible ? (
                                    <div className="bg-orange-50 border-l-4 border-orange-400 p-4 rounded-r-lg">
                                        <p className="text-orange-800 text-sm italic">
                                            "Valoramos mucho tu interés, pero debido a los requerimientos de esta actividad, no es la más adecuada para tu perfil. <strong>¡No te detengas!</strong> Hay muchísimas otras causas esperando por alguien con tu corazón."
                                        </p>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => handleAplicar(pub.id)}
                                        disabled={aplicando === pub.id || pub.yaAplico || pub.plazas_disponibles <= 0}
                                        className="w-full bg-voluntario-primary hover:bg-voluntario-dark text-white font-semibold py-2 rounded-lg transition disabled:opacity-50 disabled:bg-gray-400"
                                    >
                                        {aplicando === pub.id ? 'Aplicando...' : (pub.yaAplico ? 'Ya aplicaste' : (pub.plazas_disponibles <= 0 ? 'Cupos agotados' : '🙌 Aplicar ahora'))}
                                    </button>
                                )}
                            </div>
                        </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default FeedVoluntario;