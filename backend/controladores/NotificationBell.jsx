import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const NotificationBell = () => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    const cargarDatos = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            setNotifications([]);
            setUnreadCount(0);
            return;
        }

        try {
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
                <i className="fas fa-bell" style={{ fontSize: '1.4rem', color: '#007bff' }}></i>
                {unreadCount > 0 && (
                    <span className="badge rounded-pill bg-danger" style={{ 
                        position: 'absolute', 
                        top: '5px', 
                        right: '2px', 
                        fontSize: '0.65rem' 
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
                    zIndex: 1050
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