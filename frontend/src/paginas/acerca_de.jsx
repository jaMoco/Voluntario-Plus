import React from 'react';
import { Link } from 'react-router-dom';

const AcercaDe = () => {
    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                {/* Botón Volver */}
                <div className="mb-8">
                    <Link to="/" className="inline-flex items-center text-sm font-medium text-olive-leaf hover:text-olive-leaf-400 transition-colors bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-100 hover:shadow-md">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Volver al inicio
                    </Link>
                </div>

                <div className="text-center mb-12">
                    <h1 className="text-4xl font-extrabold text-voluntario-deep tracking-tight sm:text-5xl">
                        Acerca de <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">Voluntario+</span>
                    </h1>
                    <p className="mt-4 text-xl text-gray-500">
                        Conectando el talento con las causas que importan.
                    </p>
                </div>

                <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                    <div className="p-8 sm:p-10 space-y-6 text-gray-600 leading-relaxed">
                        <p className="text-lg">
                            <strong className="text-gray-900 font-bold">Voluntario+</strong> es una plataforma inclusiva diseñada para tender un puente entre personas con vocación de servicio y organizaciones que trabajan activamente por generar un impacto positivo en nuestra sociedad.
                        </p>
                        
                        <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-r-xl">
                            <h3 className="text-xl font-bold text-blue-900 mb-2">Nuestra Misión</h3>
                            <p className="text-blue-800">
                                Democratizar el acceso a oportunidades de voluntariado, garantizando que todas las personas, independientemente de sus capacidades, condición o situación académica, puedan aportar su granito de arena al cambio social.
                            </p>
                        </div>

                        <p>
                            Desarrollada por un equipo comprometido de estudiantes de informática, Voluntario+ integra tecnología moderna con sólidos principios de <strong>accesibilidad universal</strong>. Nos hemos asegurado de incluir herramientas e interfaces que faciliten el registro y postulación para personas con discapacidad, promoviendo una verdadera inclusión.
                        </p>

                        <div className="grid md:grid-cols-2 gap-6 mt-8">
                            <div className="border border-gray-100 rounded-xl p-6 bg-gray-50">
                                <h4 className="text-lg font-bold text-voluntario-deep mb-3 flex items-center gap-2">
                                    <span className="text-2xl">🙋‍♂️</span> Para Voluntarios
                                </h4>
                                <ul className="space-y-2 text-sm">
                                    <li>✓ Encuentra oportunidades según tus intereses</li>
                                    <li>✓ Filtra por ubicación y opciones de accesibilidad</li>
                                    <li>✓ Obtén certificados avalados por tus horas donadas</li>
                                    <li>✓ Cumple de forma segura con tu servicio comunitario</li>
                                </ul>
                            </div>
                            <div className="border border-gray-100 rounded-xl p-6 bg-gray-50">
                                <h4 className="text-lg font-bold text-voluntario-deep mb-3 flex items-center gap-2">
                                    <span className="text-2xl">🏢</span> Para Organizaciones
                                </h4>
                                <ul className="space-y-2 text-sm">
                                    <li>✓ Publica y difunde necesidades de voluntariado</li>
                                    <li>✓ Gestiona postulantes de forma sencilla y eficiente</li>
                                    <li>✓ Emite certificados digitales automáticamente</li>
                                    <li>✓ Lleva un control preciso de horas y asistencia</li>
                                </ul>
                            </div>
                        </div>

                        <div className="text-center pt-8 border-t border-gray-100">
                            <h3 className="text-2xl font-bold text-gray-900 mb-4">¡Súmate al cambio!</h3>
                            <p className="mb-6">Únete hoy y sé parte de nuestra red de impacto social.</p>
                            <div className="flex flex-col sm:flex-row justify-center gap-4">
                                <Link to="/registro/voluntario" className="inline-block bg-olive-leaf hover:bg-olive-leaf-400 text-white font-bold py-3 px-8 rounded-xl shadow-lg transition-transform transform hover:-translate-y-1">
                                    Únete como Voluntario
                                </Link>
                                <Link to="/registro/organizacion" className="inline-block bg-white text-olive-leaf border-2 border-olive-leaf hover:bg-blue-50 font-bold py-3 px-8 rounded-xl shadow-lg transition-transform transform hover:-translate-y-1">
                                    Registra tu Organización
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AcercaDe;