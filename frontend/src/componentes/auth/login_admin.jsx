import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contextos/auth_context';
import toast from 'react-hot-toast';

const LoginAdmin = () => {
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
            if (user.rol === 'admin') {
                toast.success('Bienvenido, Administrador!');
                navigate('/admin/panel');
            } else {
                // Si un usuario que no es admin intenta iniciar sesión aquí
                toast.error('Acceso denegado. Solo administradores.');
                // Opcional: desloguear si el token se obtuvo pero el rol no es admin
                // logout(); 
                setError('Credenciales inválidas para acceso de administrador.');
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Error al iniciar sesión');
            toast.error(err.response?.data?.error || 'Error al iniciar sesión');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4">
            <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg">
                <h2 className="text-3xl font-bold text-red-600 text-center mb-6">Acceso de Administrador</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Correo electrónico</label>
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="mt-1 block w-full border border-gray-300 rounded-md p-2" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Contraseña</label>
                        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="mt-1 block w-full border border-gray-300 rounded-md p-2" />
                    </div>
                    {error && <div className="text-red-500 text-sm text-center">{error}</div>}
                    <button type="submit" disabled={loading} className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 rounded-lg disabled:opacity-50 transition-colors">
                        {loading ? 'Ingresando...' : 'Ingresar como Administrador'}
                    </button>
                </form>
                {/* Opcional: Puedes añadir un enlace para registrar un nuevo admin si es necesario, pero generalmente se hace por consola o por un admin existente. */}
                {/* <div className="mt-4 text-center text-sm">
                    <Link to="/admin/registro" className="text-red-600 hover:underline">Registrar nuevo administrador</Link>
                </div> */}
            </div>
        </div>
    );
};

export default LoginAdmin;