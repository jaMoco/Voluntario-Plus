<p align="center">
  <img src="screenshots/logo.png" alt="Voluntario+ Logo" width="200"/>
</p>

<h1 align="center">🌱 Voluntario+</h1>

<p align="center">
  <strong>Plataforma web inclusiva para la gestión integral del voluntariado</strong><br/>
  Conecta organizaciones sociales con voluntarios, permite postularse a proyectos, gestionar postulantes, asignar insignias de reconocimiento y generar certificados digitales automáticos.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-18-blue?logo=react" alt="React"/>
  <img src="https://img.shields.io/badge/Node.js-20-green?logo=nodedotjs" alt="Node.js"/>
  <img src="https://img.shields.io/badge/MySQL-8.0-orange?logo=mysql" alt="MySQL"/>
  <img src="https://img.shields.io/badge/License-MIT-yellow" alt="MIT License"/>
  <img src="https://img.shields.io/badge/Accessibility-WCAG_2.1_AA-brightgreen" alt="WCAG 2.1 AA"/>
</p>

---

## 📋 Índice

- [✨ Características principales](#-características-principales)
- [🚀 Tecnologías utilizadas](#-tecnologías-utilizadas)
- [📁 Estructura del proyecto](#-estructura-del-proyecto)
- [📸 Capturas de pantalla](#-capturas-de-pantalla)
- [🧪 Credenciales de prueba](#-credenciales-de-prueba)
- [📦 Instalación y ejecución](#-instalación-y-ejecución)
- [⚙️ Backend – API REST](#️-backend--api-rest)
- [🎨 Frontend – React + Vite](#-frontend--react--vite)
- [🚫 Archivos a ignorar (`.gitignore`)](#-archivos-a-ignorar-gitignore)
- [📄 Licencia](#-licencia)

---

## ✨ Características principales

- **Tres roles diferenciados** – Administrador, organización y voluntario, con paneles específicos y rutas protegidas.
- **Registro inteligente** – Validación de edad mínima (16 años), contraseña segura, reCAPTCHA v2 y verificación de correo electrónico.
- **Feed de oportunidades** – Filtros por categoría, ubicación y apto para discapacidad. Postulación en un solo clic.
- **Panel de organización** – Crear publicaciones, gestionar postulantes (aceptar/rechazar), asignar insignias y completar proyectos.
- **Panel de administración** – Estadísticas globales, activar/desactivar usuarios y verificar organizaciones.
- **Certificados digitales** – Generación automática de PDF con `pdfkit` al completar proyectos (nombre, horas, proyecto, organización).
- **Gamificación** – Sistema de insignias que motiva a los voluntarios (Primera Postulación, Constancia Voluntaria, Inclusión Activa, etc.).
- **Accesibilidad total** – Cumple WCAG 2.1 nivel AA: navegación por teclado, lectores de pantalla (VoiceOver, TalkBack, NVDA) y alto contraste.
- **Seguridad robusta** – JWT, bcrypt, reCAPTCHA, verificación de correo, cierre de sesión por inactividad (10 minutos).

---

## 🚀 Tecnologías utilizadas

| Capa          | Tecnologías                                                                 |
|---------------|-----------------------------------------------------------------------------|
| **Frontend**  | React 18, Vite, React Router, Axios, CSS puro (accesible)                  |
| **Backend**   | Node.js, Express, JWT, bcrypt, Nodemailer, PDFKit                          |
| **Base datos**| MySQL (diseño relacional normalizado)                                      |
| **Seguridad** | reCAPTCHA v2, verificación de correo, cierre de sesión por inactividad     |

---

## 📁 Estructura del proyecto

voluntario-plus/
├── backend/
│   ├── config/               # Configuración (DB, mailer)
│   ├── controllers/          # Lógica de negocio
│   ├── middleware/           # Auth, validaciones
│   ├── models/               # Consultas SQL
│   ├── routes/               # Endpoints de la API
│   ├── utils/                # Funciones auxiliares (pdf, captcha, validadores)
│   ├── .env.example          # Plantilla de variables de entorno
│   └── server.js             # Punto de entrada
├── frontend/
│   ├── public/               # Índice y recursos estáticos
│   ├── src/
│   │   ├── components/       # Componentes reutilizables por rol
│   │   ├── contexts/         # AuthContext (autenticación global)
│   │   ├── hooks/            # useIdleTimeout, etc.
│   │   ├── pages/            # Páginas públicas (Welcome, AcercaDe)
│   │   ├── services/         # Configuración de Axios
│   │   ├── styles/           # CSS global
│   │   ├── App.jsx
│   │   └── index.jsx
│   ├── package.json
│   └── vite.config.js        # Proxy para evitar CORS
├── database/                 # Scripts SQL (estructura y datos de prueba)
├── screenshots/              # Capturas de pantalla (para este README)
└── README.md                 # Este archivo
