import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const NotificationBell = () => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    const cargarDatos = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;
            const config = { headers: { Authorization: `Bearer ${token}` } };
            
            const [resLista, resConteo] = await Promise.all([
                axios.get('http://localhost:5000/api/notificaciones', config),
                axios.get('http://localhost:5000/api/notificaciones/conteo', config)
            ]);

            setNotifications(resLista.data);
            setUnreadCount(resConteo.data.total);
        } catch (error) {
            console.error('Error al cargar notificaciones:', error);
        }
    };

    useEffect(() => {
        cargarDatos();
        const interval = setInterval(cargarDatos, 30000); // Actualiza cada 30 seg
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleMarcarLeida = async (id) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`http://localhost:5000/api/notificaciones/${id}/leida`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            cargarDatos();
        } catch (error) {
            console.error('Error al marcar como leída:', error);
        }
    };

    return (
        <div className="nav-item dropdown" style={{ position: 'relative', listStyle: 'none' }} ref={dropdownRef}>
            <button 
                className="btn btn-link nav-link" 
                onClick={() => setIsOpen(!isOpen)}
                style={{ position: 'relative', padding: '10px' }}
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: '1.6rem', height: '1.6rem', color: '#3b82f6' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
                </svg>
                {unreadCount > 0 && (
                    <span className="bg-red-600 text-white flex items-center justify-center" style={{ 
                        position: 'absolute', 
                        top: '8px', 
                        right: '8px', 
                        fontSize: '0.65rem',
                        borderRadius: '50%',
                        width: '16px',
                        height: '16px'
                    }}>
                        {unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="dropdown-menu show shadow" style={{ 
                    position: 'absolute', 
                    right: 0, 
                    width: '300px', 
                    maxHeight: '400px', 
                    overflowY: 'auto',
                    display: 'block',
                    zIndex: 1050,
                    backgroundColor: '#03507dc9',
                    border: '1px solid rgba(0,0,0,0.1)'
                }}>
                    <div className="dropdown-header border-bottom bg-light">
                        <h6 className="m-0">Notificaciones</h6>
                    </div>
                    {notifications.length === 0 ? (
                        <div className="p-3 text-center text-muted">No hay notificaciones</div>
                    ) : (
                        notifications.map(notif => (
                            <div 
                                key={notif.id} 
                                className={`dropdown-item p-3 border-bottom ${!notif.leida ? 'bg-light' : ''}`} 
                                style={{ whiteSpace: 'normal', cursor: 'pointer' }}
                                onClick={() => handleMarcarLeida(notif.id)}
                            >
                                <div style={{ fontSize: '0.85rem', fontWeight: notif.leida ? 'normal' : 'bold' }}>
                                    {notif.mensaje}
                                </div>
                                <small className="text-muted d-block mt-1">
                                    {new Date(notif.fecha_creacion).toLocaleString()}
                                </small>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

export default NotificationBell;