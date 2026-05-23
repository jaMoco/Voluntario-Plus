import api from './api';

export const obtenerPaises = async () => {
    const res = await api.get('/ubicacion/paises');
    return res.data;
};

export const obtenerEstados = async () => {
    const res = await api.get('/ubicacion/estados');
    return res.data;
};

export const obtenerMunicipios = async () => {
    const res = await api.get('/ubicacion/municipios');
    return res.data;
};