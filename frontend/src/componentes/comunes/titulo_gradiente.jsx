import React from 'react';

export default function TituloGradiente() {
  return (
    <h1 className="text-4xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-indigo-400 drop-shadow-sm">
      Voluntario<span className="text-blue-500">+</span>
    </h1>
  );
}