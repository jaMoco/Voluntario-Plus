import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contextos/auth_context';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import FacebookLogin from 'react-facebook-login/dist/facebook-login-render-props';
import api from '../../servicios/api';
import TituloGradiente from '../comunes/titulo_gradiente';
// Workaround para la compatibilidad de Vite con módulos antiguos
const FacebookLoginComponent = FacebookLogin.default || FacebookLogin;

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const user = await login(email, password);
            // Redirigir según el rol
            if (user.rol === 'voluntario') navigate('/feed');
            else if (user.rol === 'organizacion') navigate('/organizacion/panel');
            else if (user.rol === 'admin') navigate('/admin/panel');
            else navigate('/');
        } catch (err) {
            setError(err.response?.data?.error || 'Error al iniciar sesión');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSuccess = async (credentialResponse) => {
        try {
            setLoading(true);
            setError('');
            const res = await api.post('/auth/google', { credential: credentialResponse.credential });
            
            if (res.data.nuevo_usuario) {
                // Redirigir al registro y enviar los datos de Google para pre-llenar el formulario
                navigate('/registro/voluntario', { state: { googleData: res.data.user } });
            } else {
                // Sesión exitosa: Inyectamos el token directo y recargamos para que auth_context lo tome
                localStorage.setItem('token', res.data.token);
                const user = res.data.user;
                if (user.rol === 'voluntario') window.location.href = '/feed';
                else if (user.rol === 'organizacion') window.location.href = '/organizacion/panel';
                else if (user.rol === 'admin') window.location.href = '/admin/panel';
                else window.location.href = '/';
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Error al conectar con Google.');
        } finally {
            setLoading(false);
        }
    };

    const handleFacebookResponse = async (response) => {
        if (response.error || !response.accessToken) {
            setError('Error al conectar con Facebook.');
            return;
        }
        try {
            setLoading(true);
            setError('');
            const res = await api.post('/auth/facebook', { accessToken: response.accessToken, userID: response.userID });
            
            if (res.data.nuevo_usuario) {
                // Redirigir al registro y enviar los datos de Facebook
                navigate('/registro/voluntario', { state: { facebookData: res.data.user } });
            } else {
                localStorage.setItem('token', res.data.token);
                const user = res.data.user;
                if (user.rol === 'voluntario') window.location.href = '/feed';
                else if (user.rol === 'organizacion') window.location.href = '/organizacion/panel';
                else if (user.rol === 'admin') window.location.href = '/admin/panel';
                else window.location.href = '/';
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Error al conectar con Facebook.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || "TU_CLIENTE_ID_DE_GOOGLE"}>
            <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4">
            <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg">
                <div className="text-center mb-4">
                    <TituloGradiente />
                </div>
                <h2 className="text-3xl font-bold text-voluntario-deep text-center mb-6">Iniciar sesión</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Correo electrónico</label>
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="mt-1 block w-full border border-gray-300 rounded-md p-2" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Contraseña</label>
                        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="mt-1 block w-full border border-gray-300 rounded-md p-2" />
                    </div>
                    <div className="flex items-center justify-end mt-2">
                        <Link to="/olvide-password" className="text-sm font-medium text-olive-leaf hover:underline">
                    ¿Olvidaste tu contraseña?</Link>
                    </div>

                    {error && <div className="text-red-500 text-sm">{error}</div>}
                    <button type="submit" disabled={loading} className="w-full bg-olive-leaf hover:bg-olive-leaf-400 text-white font-bold py-2 rounded-lg disabled:opacity-50">
                        {loading ? 'Ingresando...' : 'Ingresar'}
                    </button>
                </form>

                <div className="mt-6 flex flex-col items-center">
                    <div className="w-full flex items-center gap-2 mb-4">
                        <div className="flex-1 h-px bg-gray-200"></div>
                        <span className="text-sm text-gray-400 font-medium">O continúa con</span>
                        <div className="flex-1 h-px bg-gray-200"></div>
                    </div>
                    <GoogleLogin 
                        onSuccess={handleGoogleSuccess} 
                        onError={() => setError('Error al inicializar el login de Google')} 
                        useOneTap 
                    />
                </div>

                <div className="mt-4 w-full flex justify-center">
                    <FacebookLoginComponent
                        appId={import.meta.env.VITE_FACEBOOK_APP_ID || "TU_APP_ID_DE_FACEBOOK"}
                        autoLoad={false}
                        fields="name,email,picture"
                        callback={handleFacebookResponse}
                        render={renderProps => (
                            <button type="button" onClick={renderProps.onClick} className="w-full flex items-center justify-center gap-2 bg-[#1877F2] text-white font-bold py-2 px-4 rounded shadow hover:bg-[#166FE5] transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                                    <path d="M16 8.049c0-4.446-3.582-8.05-8-8.05C3.58 0-.002 3.603-.002 8.05c0 4.017 2.926 7.347 6.75 7.951v-5.625h-2.03V8.05H6.75V6.275c0-2.017 1.195-3.131 3.022-3.131.876 0 1.791.157 1.791.157v1.98h-1.009c-.993 0-1.303.621-1.303 1.258v1.51h2.218l-.354 2.326H9.25V16c3.824-.604 6.75-3.934 6.75-7.951z"/>
                                </svg>
                                Continuar con Facebook
                            </button>
                        )}
                    />
                </div>

                <div className="mt-4 text-center text-sm">
                    <Link to="/registro/voluntario" className="text-olive-leaf hover:underline">Regístrate como voluntario</Link>
                    {' | '}
                    <Link to="/registro/organizacion" className="text-olive-leaf hover:underline">Regístrate como organización</Link>
                </div>
            </div>
        </div>
        </GoogleOAuthProvider>
    );
};

export default Login;