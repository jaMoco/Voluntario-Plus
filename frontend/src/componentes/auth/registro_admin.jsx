import React, { useState } from 'react';
import api from '../../servicios/api';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const RegistroAdmin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/auth/registro/admin', { email, password });
            toast.success('Administrador creado correctamente');
            navigate('/admin/login');
        } catch (error) {
            toast.error(error.response?.data?.error || 'Error al crear admin');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow-md w-96">
                <h2 className="text-2xl font-bold mb-6 text-center text-red-600">Registro Admin</h2>
                <div className="mb-4">
                    <label className="block text-sm font-medium">Correo Electrónico</label>
                    <input 
                        type="email" 
                        className="w-full border p-2 rounded mt-1" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        required 
                    />
                </div>
                <div className="mb-6">
                    <label className="block text-sm font-medium">Contraseña</label>
                    <input 
                        type="password" 
                        className="w-full border p-2 rounded mt-1" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        required 
                    />
                </div>
                <button 
                    type="submit" 
                    className="w-full bg-red-600 text-white py-2 rounded hover:bg-red-700 transition"
                >
                    Registrar Administrador
                </button>
            </form>
        </div>
    );
};

export default RegistroAdmin;