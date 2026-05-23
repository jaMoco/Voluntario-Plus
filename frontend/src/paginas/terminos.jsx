import React from 'react';
import { Link } from 'react-router-dom';

const Terminos = () => {
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
                        Términos y <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">Condiciones</span>
                    </h1>
                    <p className="mt-4 text-xl text-gray-500">
                        Por favor, lee detenidamente nuestras políticas de uso.
                    </p>
                </div>

                <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                    <div className="p-8 sm:p-10 text-gray-600 space-y-8">
                        <section>
                            <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                                <span className="text-olive-leaf">1.</span> Aceptación
                            </h3>
                            <p className="leading-relaxed bg-gray-50 p-4 rounded-lg">
                                Al registrarte y utilizar la plataforma <strong>Voluntario+</strong>, aceptas tácitamente estos términos y condiciones. Si no estás de acuerdo con alguna parte de los mismos, te invitamos a no utilizar nuestros servicios.
                            </p>
                        </section>

                        <section>
                            <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                                <span className="text-olive-leaf">2.</span> Uso de la plataforma
                            </h3>
                            <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                                <p><strong>Para Voluntarios:</strong> Debes ser mayor de 16 años para registrarte de forma independiente. Si eres menor, requieres la supervisión y autorización de tus padres o representantes legales.</p>
                                <p><strong>Para Organizaciones:</strong> Es obligatorio proporcionar información veraz, incluyendo un número de RIF/NIT válido y documentación comprobable si la plataforma lo requiere.</p>
                            </div>
                        </section>

                        <section>
                            <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                                <span className="text-olive-leaf">3.</span> Responsabilidad
                            </h3>
                            <p className="leading-relaxed bg-gray-50 p-4 rounded-lg border-l-4 border-yellow-400">
                                Voluntario+ funciona estrictamente como un puente de conexión. No nos hacemos responsables por daños, perjuicios o incidentes derivados de las actividades de voluntariado en terreno. La relación, acuerdos y la ejecución del servicio son responsabilidad directa y exclusiva entre el voluntario y la organización anfitriona.
                            </p>
                        </section>

                        <section>
                            <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                                <span className="text-olive-leaf">4.</span> Privacidad y Datos
                            </h3>
                            <p className="leading-relaxed bg-gray-50 p-4 rounded-lg">
                                La protección de tus datos personales es vital para nosotros. Toda la información suministrada (incluyendo datos sensibles como condiciones de discapacidad) será tratada de manera confidencial y utilizada estrictamente para los fines de conexión en la plataforma. No comercializaremos tu información a terceros bajo ninguna circunstancia.
                            </p>
                        </section>

                        <section className="mt-8 pt-8 border-t border-gray-100 text-center">
                            <h3 className="text-xl font-bold text-gray-900 mb-4">¿Tienes alguna duda?</h3>
                            <p className="text-gray-500 mb-4">Estamos aquí para ayudarte. Contáctanos a través de nuestro correo oficial:</p>
                            <a href="mailto:soporte@voluntarioplus.com" className="inline-flex items-center text-lg font-bold text-olive-leaf hover:text-olive-leaf-400 transition-colors">
                                <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                soporte@voluntarioplus.com
                            </a>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Terminos;