import React, { useState, useEffect } from 'react';

const AccesibilidadMenu = ({ isDark }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [settings, setSettings] = useState({
        textSize: 100,
        darkMode: false,
        highContrast: false,
        dyslexicFont: false,
        highSpacing: false,
        largeFocus: false,
        reduceMotion: false,
        underlineLinks: false,
    });

    // Cargar preferencias guardadas al iniciar
    useEffect(() => {
        const saved = localStorage.getItem('accesibilidad_voluntarioplus');
        
        // Valores por defecto
        let currentSettings = {
            textSize: 100, darkMode: false, highContrast: false, dyslexicFont: false,
            highSpacing: false, largeFocus: false, reduceMotion: false, underlineLinks: false
        };

        if (saved) {
            // Fusionar guardado con defaults por si agregamos opciones nuevas
            currentSettings = { ...currentSettings, ...JSON.parse(saved) };
        } else {
            // Si es la primera vez, respetar la preferencia del sistema operativo
            const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
            if (prefersDark) currentSettings.darkMode = true;
        }
        
        setSettings(currentSettings);
        applySettings(currentSettings);
    }, []);

    const applySettings = (newSettings) => {
        const root = document.documentElement;
        
        // 1. Tamaño del texto
        root.style.fontSize = `${newSettings.textSize}%`;
        
        // Alternar clases CSS globales en la etiqueta <html>
        const toggleClass = (condition, className) => {
            if (condition) root.classList.add(className);
            else root.classList.remove(className);
        };

        toggleClass(newSettings.darkMode, 'dark-theme');
        toggleClass(newSettings.highContrast, 'high-contrast-mode');
        toggleClass(newSettings.dyslexicFont, 'font-dyslexic');
        toggleClass(newSettings.highSpacing, 'high-spacing');
        toggleClass(newSettings.largeFocus, 'large-focus');
        toggleClass(newSettings.reduceMotion, 'reduce-motion');
        toggleClass(newSettings.underlineLinks, 'underline-links');
    };

    const updateSetting = (key, value) => {
        const newSettings = { ...settings, [key]: value };
        setSettings(newSettings);
        localStorage.setItem('accesibilidad_voluntarioplus', JSON.stringify(newSettings));
        applySettings(newSettings);
    };

    return (
        <div className="relative">
            {/* Inyección de estilos globales aplicables a todo el sitio */}
            <style>{`
                html {
                    transition: filter 0.4s ease;
                }
                /* Tema Oscuro Universal mediante Inversión de Color */
                html.dark-theme {
                    filter: invert(1) hue-rotate(180deg);
                    background-color: #fff; /* Al invertirse será negro, evitando fondos rotos */
                }
                /* Revertir fotos, videos y svgs para que no luzcan como negativos */
                html.dark-theme img,
                html.dark-theme video,
                html.dark-theme svg {
                    filter: invert(1) hue-rotate(180deg);
                }
                .high-contrast-mode {
                    filter: contrast(1.5) saturate(1.2);
                }
                .font-dyslexic * {
                    font-family: 'OpenDyslexic', 'Comic Sans MS', sans-serif !important;
                }
                .high-spacing * {
                    line-height: 1.8 !important;
                    letter-spacing: 0.05em !important;
                    word-spacing: 0.1em !important;
                }
                .large-focus *:focus, .large-focus *:focus-visible {
                    outline: 4px solid #dda15e !important; /* Color de tu paleta Sunlit Clay */
                    outline-offset: 4px !important;
                }
                .reduce-motion * {
                    animation: none !important;
                    transition: none !important;
                    scroll-behavior: auto !important;
                }
                .underline-links a {
                    text-decoration: underline !important;
                    text-decoration-thickness: 2px !important;
                    text-underline-offset: 2px !important;
                }
            `}</style>

            <button 
                onClick={() => setIsOpen(!isOpen)}
                className={`p-2 transition-colors rounded-full flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-olive-leaf ${isDark ? 'text-white hover:bg-white/10' : 'text-gray-600 hover:text-olive-leaf hover:bg-gray-100'}`}
                aria-label="Ajustes de accesibilidad"
                aria-expanded={isOpen}
                aria-haspopup="menu"
            >
                {/* Icono de engranaje universal */}
                <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" role="img" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                </svg>
            </button>

            {isOpen && (
                <div role="menu" className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 p-5 overflow-y-auto max-h-[85vh]">
                    <h3 className="font-bold text-gray-900 mb-4 border-b border-gray-100 pb-3 flex items-center gap-2">
                        <span>♿</span> Accesibilidad Universal
                    </h3>
                    
                    <div className="space-y-5">
                        {/* 1. Tamaño de texto */}
                        <div>
                            <span className="text-sm font-semibold text-gray-800 block mb-2" id="text-size-label">Tamaño del texto</span>
                            <div className="flex items-center gap-3 bg-gray-50 p-2 rounded-lg" role="group" aria-labelledby="text-size-label">
                                <button aria-label="Disminuir texto" onClick={() => updateSetting('textSize', Math.max(80, settings.textSize - 10))} className="flex-1 py-1 bg-white hover:bg-gray-100 shadow-sm border border-gray-200 rounded text-sm font-bold text-black transition">-</button>
                                <span className="text-sm font-bold w-12 text-center text-black" aria-live="polite">{settings.textSize}%</span>
                                <button aria-label="Aumentar texto" onClick={() => updateSetting('textSize', Math.min(200, settings.textSize + 10))} className="flex-1 py-1 bg-white hover:bg-gray-100 shadow-sm border border-gray-200 rounded text-sm font-bold text-black transition">+</button>
                            </div>
                        </div>

                        <hr className="border-gray-50" />

                        {/* Opciones con Interruptores (Toggles) */}
                        {[
                            { id: 'darkMode', label: 'Modo Oscuro', desc: 'Tema nocturno adaptativo' },
                            { id: 'highContrast', label: 'Alto Contraste', desc: 'Aumenta la saturación y contraste' },
                            { id: 'dyslexicFont', label: 'Fuente amigable', desc: 'Tipografía para dislexia' },
                            { id: 'highSpacing', label: 'Mayor espaciado', desc: 'Separa líneas y párrafos' },
                            { id: 'largeFocus', label: 'Resaltar foco', desc: 'Anillo amarillo al navegar' },
                            { id: 'underlineLinks', label: 'Subrayar enlaces', desc: 'Destaca hipervínculos' },
                            { id: 'reduceMotion', label: 'Reducir animaciones', desc: 'Desactiva transiciones' }
                        ].map(opt => (
                            <label key={opt.id} className="flex items-center justify-between cursor-pointer group">
                                <div>
                                    <span className="text-sm font-semibold text-gray-800 block">{opt.label}</span>
                                    <span className="text-xs text-gray-500">{opt.desc}</span>
                                </div>
                                <div className="relative">
                                    <input
                                        type="checkbox"
                                        className="sr-only peer"
                                        checked={settings[opt.id]}
                                        onChange={(e) => updateSetting(opt.id, e.target.checked)}
                                        aria-label={opt.label}
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-olive-leaf/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-olive-leaf"></div>
                                </div>
                            </label>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AccesibilidadMenu;
