import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import ReCAPTCHA from 'react-google-recaptcha';
import api from '../../servicios/api';
import { obtenerPaises } from '../../servicios/ubicacion';
import venezuelaData from '../../data/venezuela.json';
import TituloGradiente from '../comunes/titulo_gradiente';

const RegistroOrganizacion = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        // Datos básicos
        nombre_oficial: '',
        nombre_comercial: '',
        tipo_organizacion: '',
        otro_tipo: '',
        rif: '',
        pais_constitucion: 'Venezuela',
        sitio_web: '',
        // Datos de contacto
        direccion_fiscal: '',
        ciudad_estado: '',
        municipio: '',
        codigo_postal: '',
        telefono_principal: '',
        telefono_secundario: '',
        email_oficial: '',
        // Representante legal
        representante_nombre: '',
        representante_cedula: '',
        representante_cargo: '',
        representante_email_personal: '',
        representante_telefono: '',
        // Datos de acceso
        email: '',
        password: '',
        confirmar_password: '',
        // Información complementaria
        sector_industria: '',
        num_empleados: '',
        descripcion: '',
        como_conocio: '',
        // Términos y captcha
        acepta_terminos: false,
        captchaToken: ''
    });

    const [paises, setPaises] = useState([]);
    const [estados, setEstados] = useState([]);
    const [municipios, setMunicipios] = useState([]);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [passwordError, setPasswordError] = useState('');

    // Cargar ubicaciones
    useEffect(() => {
        const cargarUbicaciones = async () => {
            try {
                const paisesData = await obtenerPaises();
                setPaises(paisesData);
                // Cargar estados desde JSON local
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
        if (formData.ciudad_estado && venezuelaData[formData.ciudad_estado]) {
            setMunicipios(venezuelaData[formData.ciudad_estado]);
        } else {
            setMunicipios([]);
        }
    }, [formData.ciudad_estado]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        const val = type === 'checkbox' ? checked : value;

        setFormData(prev => {
            const updated = { ...prev, [name]: val };
            // Si cambia el estado, reseteamos el municipio
            if (name === 'ciudad_estado') {
                updated.municipio = '';
            }
            return updated;
        });

        // Limpiar error de contraseña cuando el usuario escribe
        if (name === 'password') validatePassword(value);
    };

    const validatePassword = (password) => {
        const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!regex.test(password)) {
            setPasswordError('Debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial');
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

        // Validar contraseñas coincidentes
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

        const rifRegex = /^[GJ]-\d{8}-\d$/;
        if (!rifRegex.test(formData.rif)) {
            setError('El RIF debe tener el formato J-12345678-0 o G-12345678-0');
            return;
        }

        if (!formData.acepta_terminos) {
            setError('Debes aceptar los términos y condiciones');
            return;
        }
        if (!formData.captchaToken) {
            setError('Por favor completa el captcha');
            return;
        }

        setLoading(true);
        try {
            // Enviar al backend
            await api.post('/auth/registro/organizacion', formData);
            setSuccess(true);
            window.scrollTo(0, 0);
        } catch (err) {
            setError(err.response?.data?.error || 'Error en el registro');
        } finally {
            setLoading(false);
        }
    };

    const inputClasses = "mt-1 block w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-olive-leaf focus:border-transparent outline-none transition-all shadow-sm";

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4">
            <div className="max-w-4xl mx-auto bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
                <div className="text-center mb-2">
                    <TituloGradiente />
                </div>
                <h2 className="text-3xl font-extrabold text-voluntario-deep text-center mb-8">Registro de Organización</h2>
                
                {success ? (
                    <div className="text-center py-10 animate-fade-in">
                        <div className="bg-blue-100 text-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">!</div>
                        <h3 className="text-2xl font-bold text-gray-800 mb-2">¡Casi terminamos!</h3>
                        <p className="text-gray-600 mb-6">Hemos enviado un enlace de verificación a <strong>{formData.email}</strong>. Debes confirmar tu cuenta antes de poder ingresar.</p>
                        <Link to="/login" className="bg-olive-leaf text-white px-6 py-2 rounded-lg font-bold">Ir al Login</Link>
                    </div>
                ) : (
                <form onSubmit={handleSubmit} className="space-y-6">

                    {/* ========== 1. DATOS BÁSICOS ========== */}
                    <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 shadow-sm">
                        <h3 className="text-lg font-bold text-voluntario-deep border-b border-gray-200 pb-2 mb-4">Datos básicos</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Nombre oficial *</label>
                                <input type="text" name="nombre_oficial" required value={formData.nombre_oficial} onChange={handleChange} className={inputClasses} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Nombre comercial / marca</label>
                                <input type="text" name="nombre_comercial" value={formData.nombre_comercial} onChange={handleChange} className={inputClasses} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Tipo de organización *</label>
                                <select name="tipo_organizacion" required value={formData.tipo_organizacion} onChange={handleChange} className={inputClasses}>
                                    <option value="">Selecciona</option>
                                    <option value="empresa">Empresa con fines de lucro</option>
                                    <option value="ong">Organización sin fines de lucro (OSFL/ONG)</option>
                                    <option value="fundacion">Fundación</option>
                                    <option value="asociacion">Asociación / Cooperativa</option>
                                    <option value="otro">Otro</option>
                                </select>
                            </div>
                            {formData.tipo_organizacion === 'otro' && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Especificar otro tipo *</label>
                                    <input type="text" name="otro_tipo" value={formData.otro_tipo} onChange={handleChange} className={inputClasses} />
                                </div>
                            )}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">RIF / NIT *</label>
                                <input type="text" name="rif" required value={formData.rif} onChange={handleChange} className={inputClasses} placeholder="J-12345678-0" />
                                <p className="text-xs text-gray-500 mt-1">Formato: J-12345678-0 o G-12345678-0</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">País de constitución</label>
                                <select name="pais_constitucion" value={formData.pais_constitucion} onChange={handleChange} className={inputClasses}>
                                    {paises.map(pais => <option key={pais} value={pais}>{pais}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Sitio web</label>
                                <input type="url" name="sitio_web" value={formData.sitio_web} onChange={handleChange} className={inputClasses} />
                            </div>
                        </div>
                    </div>

                    {/* ========== 2. DATOS DE CONTACTO ========== */}
                    <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 shadow-sm">
                        <h3 className="text-lg font-bold text-voluntario-deep border-b border-gray-200 pb-2 mb-4">Datos de contacto</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Dirección fiscal *</label>
                                <textarea name="direccion_fiscal" rows="2" required value={formData.direccion_fiscal} onChange={handleChange} className={inputClasses}></textarea>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Ciudad / Estado *</label>
                                <select name="ciudad_estado" required value={formData.ciudad_estado} onChange={handleChange} className={inputClasses}>
                                    <option value="">Selecciona</option>
                                    {estados.map(estado => <option key={estado} value={estado}>{estado}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Municipio *</label>
                                <select name="municipio" required value={formData.municipio} onChange={handleChange} className={inputClasses}>
                                    <option value="">Selecciona</option>
                                    {municipios.map(m => <option key={m} value={m}>{m}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Código postal</label>
                                <input type="text" name="codigo_postal" value={formData.codigo_postal} onChange={handleChange} className={inputClasses} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Teléfono principal *</label>
                                <input type="tel" name="telefono_principal" required value={formData.telefono_principal} onChange={handleChange} className={inputClasses} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Teléfono secundario</label>
                                <input type="tel" name="telefono_secundario" value={formData.telefono_secundario} onChange={handleChange} className={inputClasses} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Correo electrónico oficial *</label>
                                <input type="email" name="email_oficial" required value={formData.email_oficial} onChange={handleChange} className={inputClasses} />
                            </div>
                        </div>
                    </div>

                    {/* ========== 3. REPRESENTANTE LEGAL ========== */}
                    <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 shadow-sm">
                        <h3 className="text-lg font-bold text-voluntario-deep border-b border-gray-200 pb-2 mb-4">Representante legal / Administrador</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Nombre completo *</label>
                                <input type="text" name="representante_nombre" required value={formData.representante_nombre} onChange={handleChange} className={inputClasses} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Cédula / Pasaporte *</label>
                                <input type="text" name="representante_cedula" required value={formData.representante_cedula} onChange={handleChange} className={inputClasses} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Cargo dentro de la organización *</label>
                                <input type="text" name="representante_cargo" required value={formData.representante_cargo} onChange={handleChange} className={inputClasses} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Correo electrónico personal</label>
                                <input type="email" name="representante_email_personal" value={formData.representante_email_personal} onChange={handleChange} className={inputClasses} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Teléfono de contacto</label>
                                <input type="tel" name="representante_telefono" value={formData.representante_telefono} onChange={handleChange} className={inputClasses} />
                            </div>
                        </div>
                    </div>

                    {/* ========== 4. DATOS DE ACCESO ========== */}
                    <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 shadow-sm">
                        <h3 className="text-lg font-bold text-voluntario-deep border-b border-gray-200 pb-2 mb-4">Datos de acceso a la web</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Correo de acceso (Login) *</label>
                                <input type="email" name="email" required value={formData.email} onChange={handleChange} className={inputClasses} />
                            </div>
                            <div></div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Contraseña *</label>
                                <input type="password" name="password" required value={formData.password} onChange={handleChange} className={inputClasses} />
                                {passwordError && <p className="text-red-500 text-xs mt-1">{passwordError}</p>}
                                <p className="text-xs text-gray-500 mt-1">
                                    Mínimo 8 caracteres. Debe incluir: 
                                    Mayúsculas (ej: A, B), Minúsculas (ej: a, b), 
                                    Números (ej: 1, 2) y Caracteres especiales (ej: @, $, %, &, !). 
                                    <br />
                                    <strong>Ejemplo: Voluntario123%</strong> (No usar este ejemplo).
                                </p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Confirmar contraseña *</label>
                                <input type="password" name="confirmar_password" required value={formData.confirmar_password} onChange={handleChange} className={inputClasses} />
                            </div>
                        </div>
                    </div>

                    {/* ========== 5. INFORMACIÓN COMPLEMENTARIA ========== */}
                    <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 shadow-sm">
                        <h3 className="text-lg font-bold text-voluntario-deep border-b border-gray-200 pb-2 mb-4">Información complementaria</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Sector / industria</label>
                                <select name="sector_industria" value={formData.sector_industria} onChange={handleChange} className={inputClasses}>
                                    <option value="">Selecciona</option>
                                    <option value="Salud">Salud</option>
                                    <option value="Educación">Educación</option>
                                    <option value="Tecnología">Tecnología</option>
                                    <option value="Comercio">Comercio</option>
                                    <option value="Construcción">Construcción</option>
                                    <option value="Servicios sociales">Servicios sociales</option>
                                    <option value="Ambiental">Ambiental</option>
                                    <option value="Otro">Otro</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Número aproximado de empleados/miembros</label>
                                <input type="number" name="num_empleados" value={formData.num_empleados} onChange={handleChange} className={inputClasses} />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700">Breve descripción de la organización (máx 500 caracteres)</label>
                                <textarea name="descripcion" rows="3" maxLength="500" value={formData.descripcion} onChange={handleChange} className={inputClasses}></textarea>
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700">¿Cómo conoció la página?</label>
                                <input type="text" name="como_conocio" value={formData.como_conocio} onChange={handleChange} className={inputClasses} />
                            </div>
                        </div>
                    </div>

                    {/* ========== 6. ACEPTACIÓN DE TÉRMINOS Y CAPTCHA ========== */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <input type="checkbox" name="acepta_terminos" checked={formData.acepta_terminos} onChange={handleChange} required className="w-4 h-4 text-olive-leaf border-gray-300 rounded focus:ring-olive-leaf" />
                            <label className="text-sm text-gray-700">He leído y acepto los <a href="/terminos" className="text-olive-leaf hover:underline">Términos y Condiciones</a> y la <a href="/privacidad" className="text-olive-leaf hover:underline">Política de Privacidad</a>.</label>
                        </div>
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
                    </div>

                    {error && <div className="text-red-500 text-sm text-center">{error}</div>}

                    <div className="flex justify-between items-center pt-4">
                        <Link to="/login" className="text-olive-leaf font-medium hover:text-olive-leaf-400 transition-colors">¿Ya tienes cuenta? Inicia sesión</Link>
                        <button type="submit" disabled={loading} className="bg-olive-leaf hover:bg-olive-leaf-400 text-white font-bold py-3 px-8 rounded-xl shadow-lg hover:shadow-olive-leaf/20 transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50">
                            {loading ? 'Registrando...' : 'Registrar organización'}
                        </button>
                    </div>
                </form>
                )}
            </div>
        </div>
    );
};

export default RegistroOrganizacion;