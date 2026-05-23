import React, { useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import api from '../../servicios/api';

const ResetPassword = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const navigate = useNavigate();

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [mensaje, setMensaje] = useState('');
    const [error, setError] = useState('');
    const [passwordError, setPasswordError] = useState('');

    const validatePassword = (pass) => {
        // Permite cualquier carácter especial, mayúsculas, minúsculas y números (Mínimo 8)
        const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
        if (!regex.test(pass)) {
            setPasswordError('Mínimo 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial.');
        } else {
            setPasswordError('');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMensaje('');

        if (password !== confirmPassword) {
            return setError('Las contraseñas no coinciden.');
        }
        if (passwordError) {
            return setError('La contraseña no cumple los requisitos de seguridad.');
        }

        setLoading(true);
        try {
            const res = await api.post('/auth/reset-password', { token, password });
            setMensaje(res.data.message);
            setTimeout(() => {
                navigate('/login');
            }, 3000);
        } catch (err) {
            setError(err.response?.data?.error || 'Error al restablecer la contraseña.');
        } finally {
            setLoading(false);
        }
    };

    if (!token) {
        return <div className="min-h-screen flex items-center justify-center bg-slate-50"><p className="text-red-500 font-bold">Token de restablecimiento inválido o no proporcionado.</p></div>;
    }

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <h2 className="mt-6 text-center text-3xl font-extrabold text-voluntario-deep">Crear Nueva Contraseña</h2>
            </div>
            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-gray-100">
                    {mensaje && <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-4 text-green-700 text-sm">{mensaje} <br /> Redirigiendo al login...</div>}
                    {error && <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4 text-red-700 text-sm">{error}</div>}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Nueva Contraseña</label>
                            <input type="password" required value={password} onChange={(e) => { setPassword(e.target.value); validatePassword(e.target.value); }} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-voluntario-primary focus:border-voluntario-primary" />
                    {passwordError ? <p className="text-red-500 text-xs mt-1">{passwordError}</p> : 
                    <p className="text-xs text-gray-500 mt-1">
                        Mínimo 8 caracteres. Debe incluir: Mayúsculas, Minúsculas, Números y Caracteres especiales (ej: @, $, %, &, !).
                    </p>
                    }
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Confirmar Nueva Contraseña</label>
                            <input type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-voluntario-primary focus:border-voluntario-primary" />
                        </div>
                        <button type="submit" disabled={loading} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-voluntario-primary hover:bg-voluntario-dark disabled:opacity-50">
                            {loading ? 'Restableciendo...' : 'Restablecer Contraseña'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;