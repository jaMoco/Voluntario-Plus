import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../servicios/api';

const OlvidePassword = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [mensaje, setMensaje] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setMensaje('');

        try {
            const res = await api.post('/auth/forgot-password', { email });
            setMensaje('¡Solicitud enviada! Por favor, revisa tu bandeja de entrada en el correo indicado (o en tu carpeta de spam / correos no deseados). Luego, al abrir el correo que te llegó, haz clic en el enlace e irás a una página para que puedas cambiar tu contraseña.');
        } catch (err) {
            console.error('Error detallado:', err);
            if (!err.response) {
                setError('Error de conexión: El servidor backend parece estar apagado o no responde.');
            } else if (err.response.status === 404 && typeof err.response.data === 'string') {
                setError('Error de ruta (404): Falta configurar la ruta en tu archivo auth_rutas.js');
            } else {
                setError(err.response?.data?.error || 'Hubo un error al procesar tu solicitud.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <h2 className="mt-6 text-center text-3xl font-extrabold text-voluntario-deep">
                    Recuperar Contraseña
                </h2>
            <p className="mt-4 text-center text-sm text-gray-600 leading-relaxed px-4">
                Ingresa tu correo a continuación. Deberás ver tu bandeja de entrada en el correo indicado o en tu carpeta de spam (correos no deseados). Luego, al abrir el correo que te llegó, irás a una página para que puedas cambiar la contraseña.
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-gray-100">
                {mensaje && <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-4 text-green-800 text-sm leading-relaxed">{mensaje}</div>}
                    {error && <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4 text-red-700 text-sm">{error}</div>}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Correo electrónico</label>
                            <div className="mt-1">
                                <input id="email" name="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-voluntario-primary focus:border-voluntario-primary sm:text-sm" placeholder="tu@correo.com" />
                            </div>
                        </div>
                        <div>
                            <button type="submit" disabled={loading} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-voluntario-primary hover:bg-voluntario-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-voluntario-primary disabled:opacity-50">
                                {loading ? 'Enviando...' : 'Enviar enlace de recuperación'}
                            </button>
                        </div>
                        
                        <div className="flex flex-col items-center mt-4 space-y-3 pt-2">
                            <Link to="/olvide-password-alternativo" className="font-medium text-olive-leaf hover:text-olive-leaf-400 text-sm text-center">
                                ¿Perdiste acceso a tu correo? <br/>Recupera con tus datos de seguridad
                            </Link>
                            <Link to="/login" className="font-medium text-voluntario-primary hover:text-voluntario-dark text-sm">Volver al inicio de sesión</Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default OlvidePassword;