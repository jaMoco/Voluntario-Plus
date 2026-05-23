import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import ReCAPTCHA from 'react-google-recaptcha';
import api from '../../servicios/api';
import { obtenerPaises } from '../../servicios/ubicacion';
import venezuelaData from '../../data/venezuela.json';
import discapacidadData from '../../data/discapacidad.json';
import TituloGradiente from '../comunes/titulo_gradiente';

const RegistroVoluntario = () => {
    const [formData, setFormData] = useState({
        // Datos básicos
        nombre_completo: '',
        cedula: '',
        email: '',
        password: '',
        confirmar_password: '',
        edad: '',
        fecha_nacimiento: '',
        telefono: '',
        // Discapacidad
        tiene_discapacidad: false,
        discapacidad_categoria: '',
        discapacidad_nivel: '',
        tipo_discapacidad: '',
        otra_discapacidad: '',
        // Estudiante y servicio comunitario
        es_estudiante: false,
        requiere_servicio_comunitario: false,
        universidad: '',
        carrera: '',
        mencion: '',
        semestre: '',
        // Ubicación
        ubicacion_pais: 'Venezuela',
        ubicacion_estado: '',
        ubicacion_municipio: '',
        ubicacion_direccion: '',
        codigo_postal: '',
        // Captcha
        captchaToken: ''
    });

    const [paises, setPaises] = useState([]);
    const [estados, setEstados] = useState([]);
    const [municipios, setMunicipios] = useState([]);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // Cargar listas de ubicación
    useEffect(() => {
        const cargarUbicaciones = async () => {
            try {
                // Cargar países desde la API (Venezuela)
                const paisesData = await obtenerPaises();
                setPaises(paisesData);
                // Cargar estados directamente desde el JSON local
                const estadosLista = Object.keys(venezuelaData).sort();
                setEstados(estadosLista);
            } catch (err) {
                console.error('Error cargando ubicaciones:', err);
            }
        };
        cargarUbicaciones();
    }, []);

    // Cargar municipios dinámicamente según el estado seleccionado
    useEffect(() => {
        if (formData.ubicacion_estado && venezuelaData[formData.ubicacion_estado]) {
            setMunicipios(venezuelaData[formData.ubicacion_estado]);
        } else {
            setMunicipios([]);
        }
    }, [formData.ubicacion_estado]);

    const calcularEdad = (fechaNacimiento) => {
        const hoy = new Date();
        const nacimiento = new Date(fechaNacimiento);
        let edad = hoy.getFullYear() - nacimiento.getFullYear();
        const m = hoy.getMonth() - nacimiento.getMonth();
        if (m < 0 || (m === 0 && hoy.getDate() < nacimiento.getDate())) {
            edad--;
        }
        return edad;
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        let val = type === 'checkbox' ? checked : value;

        // Validaciones en tiempo real para mejorar la UX
        if (name === 'nombre_completo' && typeof val === 'string') {
            // Permitir solo letras (incluyendo acentos y ñ) y espacios
            val = val.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]/g, '');
        } else if ((name === 'cedula' || name === 'telefono' || name === 'codigo_postal') && typeof val === 'string') {
            // Permitir estrictamente solo números
            val = val.replace(/\D/g, '');
        }

        setFormData(prev => {
            const updated = { ...prev, [name]: val };
            // Si cambia el estado, forzamos el reset del municipio inmediatamente
            if (name === 'ubicacion_estado') {
                updated.ubicacion_municipio = '';
            }
            // Resetear cascada de discapacidad si cambian selecciones superiores
            if (name === 'discapacidad_categoria') {
                updated.discapacidad_nivel = '';
                updated.tipo_discapacidad = '';
                updated.otra_discapacidad = '';
            }
            if (name === 'discapacidad_nivel') {
                updated.tipo_discapacidad = '';
                updated.otra_discapacidad = '';
            }
            if (name === 'tipo_discapacidad' && value !== 'otra') {
                updated.otra_discapacidad = '';
            }
            if (name === 'tiene_discapacidad' && !val) {
                updated.discapacidad_categoria = '';
                updated.discapacidad_nivel = '';
                updated.tipo_discapacidad = '';
                updated.otra_discapacidad = '';
            }
            return updated;
        });

        if (name === 'password') validatePassword(value);
    };

    const validatePassword = (password) => {
        const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!regex.test(password)) {
            setPasswordError('Mínimo 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial');
        } else {
            setPasswordError('');
        }
    };

    const handleCaptchaChange = (token) => {
        setFormData(prev => ({ ...prev, captchaToken: token }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Validar rango de cédula (2,000,000 - 33,000,000)
        const cedulaLimpia = formData.cedula.replace(/\D/g, '');
        const numCedula = parseInt(cedulaLimpia, 10);
        if (isNaN(numCedula) || numCedula < 2000000 || numCedula > 33000000) {
            setError('La cédula de identidad debe estar entre 2,000,000 y 33,000,000.');
            return;
        }
        
        // Validar edad mínima de 16 años
        if (formData.fecha_nacimiento) {
            const edadCalculada = calcularEdad(formData.fecha_nacimiento);

            // Validar que la edad coincida con la fecha de nacimiento
            if (formData.edad && parseInt(formData.edad) !== edadCalculada) {
                setError(`La edad ingresada (${formData.edad}) no coincide con tu fecha de nacimiento (${edadCalculada} años).`);
                return;
            }

            if (edadCalculada < 16) {
                setError('Debes tener al menos 16 años para registrarte como voluntario.');
                return;
            }
        } else if (formData.edad && parseInt(formData.edad) < 16) {
            setError('Debes tener al menos 16 años para registrarte como voluntario.');
            return;
        }

        if (formData.password !== formData.confirmar_password) {
            setError('Las contraseñas no coinciden');
            return;
        }
        if (formData.password === 'Voluntario123%') {
            setError('No puedes utilizar la contraseña de ejemplo.');
            return;
        }
        if (passwordError) {
            setError('La contraseña no cumple los requisitos');
            return;
        }

        // Validar captcha
        if (!formData.captchaToken) {
            setError('Por favor, completa el captcha "No soy un robot".');
            return;
        }

        setLoading(true);
        try {
            // Preparar datos finales: si seleccionó "otra", usar el valor del input manual
            const dataToSend = {
                ...formData,
                tipo_discapacidad: formData.tipo_discapacidad === 'otra' 
                    ? formData.otra_discapacidad 
                    : formData.tipo_discapacidad
            };

            // Enviar al backend
            await api.post('/auth/registro/voluntario', dataToSend);
            setSuccess(true);
            setError('');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (err) {
            setError(err.response?.data?.error || 'Error en el registro');
        } finally {
            setLoading(false);
        }
    };

    const inputClasses = "mt-1 block w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-olive-leaf focus:border-transparent outline-none transition-all shadow-sm";

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4">
            <div className="max-w-3xl mx-auto bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
                <div className="text-center mb-2">
                    <TituloGradiente />
                </div>
                <h2 className="text-3xl font-extrabold text-voluntario-deep text-center mb-8">Registro de Voluntario</h2>
                
                {success ? (
                    <div className="text-center py-12 animate-fade-in">
                        <div className="bg-green-100 text-green-600 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl">✓</div>
                        <h3 className="text-2xl font-bold text-gray-800 mb-4">¡Revisa tu correo!</h3>
                        <p className="text-gray-600 mb-8 max-w-md mx-auto">Hemos enviado un enlace de activación a <strong>{formData.email}</strong>. Por favor, verifica tu cuenta para poder iniciar sesión.</p>
                        <Link to="/login" className="text-olive-leaf font-bold hover:underline">Volver al inicio de sesión</Link>
                    </div>
                ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* === DATOS PERSONALES === */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-6 rounded-xl border border-gray-200">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Nombre completo *</label>
                            <input type="text" name="nombre_completo" required value={formData.nombre_completo} onChange={handleChange} className={inputClasses} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Cédula de identidad *</label>
                            <input 
                                type="text" 
                                inputMode="numeric" 
                                pattern="[0-9]*" 
                                name="cedula" 
                                required 
                                value={formData.cedula} 
                                onChange={handleChange} 
                                className={inputClasses} 
                                placeholder="Ej: 12345678" 
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Correo electrónico *</label>
                            <input type="email" name="email" required value={formData.email} onChange={handleChange} className={inputClasses} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Teléfono</label>
                            <input 
                                type="tel" 
                                inputMode="numeric" 
                                pattern="[0-9]*" 
                                name="telefono" 
                                value={formData.telefono} 
                                onChange={handleChange} 
                                className={inputClasses} 
                                placeholder="Ej: 04121234567" 
                            />
                        </div>
                        <div>
                        
                            <label className="block text-sm font-medium text-gray-700">Edad</label>
                            <input type="number" name="edad" value={formData.edad} onChange={handleChange} className={inputClasses} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Fecha de nacimiento</label>
                            <input type="date" name="fecha_nacimiento" value={formData.fecha_nacimiento} onChange={handleChange} className={inputClasses} />
                        </div>
                    </div>

                    {/* === DISCAPACIDAD === */}
                    <div className="flex items-center gap-2 p-2">
                        <input type="checkbox" name="tiene_discapacidad" checked={formData.tiene_discapacidad} onChange={handleChange} className="w-4 h-4 text-olive-leaf border-gray-300 rounded focus:ring-olive-leaf" />
                        <label className="text-sm font-medium text-gray-700">¿Tienes alguna discapacidad?</label>
                    </div>
                    {formData.tiene_discapacidad && (
                        <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 space-y-4 animate-fade-in">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Categoría / Tipo *</label>
                                <select name="discapacidad_categoria" required value={formData.discapacidad_categoria} onChange={handleChange} className={inputClasses}>
                                    <option value="">Selecciona una categoría</option>
                                    {Object.keys(discapacidadData).map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>

                            {formData.discapacidad_categoria && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Nivel de funcionalidad *</label>
                                    <select name="discapacidad_nivel" required value={formData.discapacidad_nivel} onChange={handleChange} className={inputClasses}>
                                        <option value="">Selecciona el nivel</option>
                                        <option value="leve">Leve</option>
                                        <option value="moderado">Moderado</option>
                                        <option value="severo">Severo</option>
                                    </select>
                                </div>
                            )}

                            {formData.discapacidad_nivel && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Discapacidad específica *</label>
                                    <select name="tipo_discapacidad" required value={formData.tipo_discapacidad} onChange={handleChange} className={inputClasses}>
                                        <option value="">Selecciona una opción</option>
                                        {discapacidadData[formData.discapacidad_categoria][formData.discapacidad_nivel].map(disc => (
                                            <option key={disc} value={disc}>{disc}</option>
                                        ))}
                                        <option value="otra">Otra (especificar)</option>
                                    </select>
                                </div>
                            )}

                            {formData.tipo_discapacidad === 'otra' && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Especifica tu condición *</label>
                                    <input 
                                        type="text" 
                                        name="otra_discapacidad" 
                                        required 
                                        value={formData.otra_discapacidad} 
                                        onChange={handleChange} 
                                        className={inputClasses} 
                                        placeholder="Escribe el nombre de la condición..." 
                                    />
                                </div>
                            )}
                        </div>
                    )}

                    {/* === ESTUDIANTE === */}
                    <div className="flex items-center gap-2 p-2">
                        <input type="checkbox" name="es_estudiante" checked={formData.es_estudiante} onChange={handleChange} className="w-4 h-4 text-olive-leaf border-gray-300 rounded focus:ring-olive-leaf" />
                        <label className="text-sm font-medium text-gray-700">¿Eres estudiante?</label>
                    </div>
                    {formData.es_estudiante && (
                        <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 animate-fade-in">
                            <div className="flex items-center gap-2 mt-2">
                                <input type="checkbox" name="requiere_servicio_comunitario" checked={formData.requiere_servicio_comunitario} onChange={handleChange} className="w-4 h-4 text-olive-leaf border-gray-300 rounded focus:ring-olive-leaf" />
                                <label className="text-sm font-medium text-gray-700">¿Requieres servicio comunitario?</label>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Universidad</label>
                                    <input type="text" name="universidad" value={formData.universidad} onChange={handleChange} className={inputClasses} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Carrera</label>
                                    <input type="text" name="carrera" value={formData.carrera} onChange={handleChange} className={inputClasses} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Mención</label>
                                    <input type="text" name="mencion" value={formData.mencion} onChange={handleChange} className={inputClasses} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Semestre</label>
                                    <input type="number" name="semestre" value={formData.semestre} onChange={handleChange} className={inputClasses} />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* === UBICACIÓN === */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-6 rounded-xl border border-gray-200">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">País</label>
                            <select name="ubicacion_pais" value={formData.ubicacion_pais} onChange={handleChange} className={inputClasses}>
                                <option value="">Selecciona un país</option>
                                {paises.map(pais => <option key={pais} value={pais}>{pais}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Estado</label>
                            <select name="ubicacion_estado" value={formData.ubicacion_estado} onChange={handleChange} className={inputClasses}>
                                <option value="">Selecciona</option>
                                {estados.map(estado => <option key={estado} value={estado}>{estado}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Municipio</label>
                            <select name="ubicacion_municipio" value={formData.ubicacion_municipio} onChange={handleChange} className={inputClasses}>
                                <option value="">Selecciona</option>
                                {municipios.map(municipio => <option key={municipio} value={municipio}>{municipio}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Código postal</label>
                            <input 
                                type="text" 
                                inputMode="numeric" 
                                pattern="[0-9]*" 
                                name="codigo_postal" 
                                value={formData.codigo_postal} 
                                onChange={handleChange} 
                                className={inputClasses} 
                                placeholder="Ej: 1010" 
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700">Dirección detallada</label>
                            <textarea name="ubicacion_direccion" rows="2" value={formData.ubicacion_direccion} onChange={handleChange} className={inputClasses}></textarea>
                        </div>
                    </div>

                    {/* === CONTRASEÑA === */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-6 rounded-xl border border-gray-200">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Contraseña *</label>
                            <input type="password" name="password" required value={formData.password} onChange={handleChange} className={inputClasses} />
                            {passwordError ? <p className="text-red-500 text-xs mt-1">{passwordError}</p> : 
                            <p className="text-xs text-gray-500 mt-1">
                                Mínimo 8 caracteres. Debe incluir: 
                                Mayúsculas (ej: A, B), Minúsculas (ej: a, b), 
                                Números (ej: 1, 2) y Caracteres especiales (ej: @, $, %, &, !). 
                                <br />
                                <strong>Ejemplo: Voluntario123%</strong> (No usar este ejemplo).
                            </p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Confirmar contraseña *</label>
                            <input type="password" name="confirmar_password" required value={formData.confirmar_password} onChange={handleChange} className={inputClasses} />
                        </div>
                    </div>

                    {/* === CAPTCHA === */}
                    <div className="flex justify-center">
                        {import.meta.env.VITE_RECAPTCHA_SITE_KEY || "6LfNtc8sAAAAAPvgOLf-30Tn_EJg04g6Pq5ts4Dg" ? (
                            <ReCAPTCHA
                                sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY || "6LfNtc8sAAAAAPvgOLf-30Tn_EJg04g6Pq5ts4Dg"}
                                onChange={handleCaptchaChange}
                            />
                        ) : (
                            <p className="text-red-500 text-xs">Error: reCAPTCHA no configurado</p>
                        )}
                    </div>

                    {error && <div className="text-red-500 text-sm text-center">{error}</div>}

                    <div className="flex justify-between items-center pt-4">
                        <Link to="/login" className="text-olive-leaf font-medium hover:text-olive-leaf-400 transition-colors">¿Ya tienes cuenta? Inicia sesión</Link>
                        <button type="submit" disabled={loading} className="bg-olive-leaf hover:bg-olive-leaf-400 text-white font-bold py-3 px-8 rounded-xl shadow-lg hover:shadow-olive-leaf/20 transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50">
                            {loading ? 'Registrando...' : 'Registrarse'}
                        </button>
                    </div>
                </form>
                )}
            </div>
        </div>
    );
};

export default RegistroVoluntario;