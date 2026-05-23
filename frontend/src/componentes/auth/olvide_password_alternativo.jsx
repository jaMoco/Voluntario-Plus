import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../servicios/api';

const OlvidePasswordAlternativo = () => {
    const [formData, setFormData] = useState({
        email: '',
        telefono: '',
        documento: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await api.post('/auth/olvide-password-alternativo', formData);
            // Si es exitoso, nos devuelve el token. Redirigimos directo a reset-password con el token en la URL.
            if (res.data.token) {
                navigate(`/reset-password?token=${res.data.token}`);
            }
        } catch (err) {
            console.error('Error:', err);
            setError(err.response?.data?.error || 'Hubo un error al procesar tu solicitud. Verifica que tus datos sean exactamente los que usaste al registrarte.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <h2 className="mt-6 text-center text-3xl font-extrabold text-voluntario-deep">
                    Recuperación Alternativa
                </h2>
                <p className="mt-4 text-center text-sm text-gray-600 leading-relaxed px-4">
                    Si perdiste acceso a tu correo, ingresa tus datos de seguridad exactos para verificar tu identidad y cambiar tu contraseña inmediatamente.
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-gray-100">
                    {error && <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4 text-red-700 text-sm">{error}</div>}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Correo electrónico registrado</label>
                            <div className="mt-1">
                                <input id="email" name="email" type="email" required value={formData.email} onChange={handleChange} className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-voluntario-primary focus:border-voluntario-primary sm:text-sm" placeholder="tu@correo.com" />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="telefono" className="block text-sm font-medium text-gray-700">Número de teléfono registrado</label>
                            <div className="mt-1">
                                <input id="telefono" name="telefono" type="text" required value={formData.telefono} onChange={handleChange} className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-voluntario-primary focus:border-voluntario-primary sm:text-sm" placeholder="Ej: 04121234567" />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="documento" className="block text-sm font-medium text-gray-700">Cédula o RIF registrado</label>
                            <div className="mt-1">
                                <input id="documento" name="documento" type="text" required value={formData.documento} onChange={handleChange} className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-voluntario-primary focus:border-voluntario-primary sm:text-sm" placeholder="Ej: 12345678 o J123456780" />
                            </div>
                        </div>

                        <div>
                            <button type="submit" disabled={loading} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-voluntario-primary hover:bg-voluntario-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-voluntario-primary disabled:opacity-50">
                                {loading ? 'Verificando datos...' : 'Verificar Identidad'}
                            </button>
                        </div>
                        
                        <div className="flex flex-col items-center mt-4 space-y-3">
                            <Link to="/olvide-password" className="font-medium text-olive-leaf hover:text-olive-leaf-400 text-sm">Volver al método por correo electrónico</Link>
                            <Link to="/login" className="font-medium text-gray-500 hover:text-gray-700 text-sm">Volver al inicio de sesión</Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default OlvidePasswordAlternativo;
