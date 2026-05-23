import { useEffect, useRef } from 'react';
import { useAuth } from '../contextos/auth_context';

const useIdleTimeout = (timeoutMinutes = 10) => {
    const { user, logout } = useAuth();
    const timerRef = useRef(null);

    const resetTimer = () => {
        if (timerRef.current) clearTimeout(timerRef.current);
        if (!user) return; // No activar el temporizador si no hay sesión

        timerRef.current = setTimeout(() => {
            logout();
            window.location.href = '/login'; // Redirige al login
        }, timeoutMinutes * 60 * 1000);
    };

    useEffect(() => {
        const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click', 'mousemove'];
        const handleActivity = () => resetTimer();

        events.forEach(event => window.addEventListener(event, handleActivity));
        resetTimer();

        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
            events.forEach(event => window.removeEventListener(event, handleActivity));
        };
    }, [user]); // Reiniciar escuchas si el usuario cambia
};

export default useIdleTimeout;