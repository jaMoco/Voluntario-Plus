import React from 'react';

const InsigniasList = ({ insignias }) => {
    if (insignias.length === 0) {
        return (
            <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-500">Aún no tienes insignias. Participa como voluntario para obtenerlas.</p>
            </div>
        );
    }

    return (
        <div>
            <h2 className="text-xl font-semibold text-voluntario-deep mb-3">Mis insignias</h2>
            <div className="flex flex-wrap gap-3">
                {insignias.map(ins => (
                    <div key={ins.id} className="bg-voluntario-light rounded-lg p-3 text-center w-32">
                        <div className="text-2xl mb-1">🏅</div>
                        <p className="font-semibold text-sm">{ins.nombre}</p>
                        <p className="text-xs text-gray-600">{new Date(ins.fecha_otorgada).toLocaleDateString('es-ES')}</p>
                        <p className="text-xs text-voluntario-forest">por {ins.otorgado_por}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default InsigniasList;