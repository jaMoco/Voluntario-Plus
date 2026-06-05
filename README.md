# 🌱 Voluntario+

**Plataforma web inclusiva para la gestión integral del voluntariado.**  
Conecta organizaciones sociales con voluntarios, permite postularse a proyectos, gestionar postulantes, asignar insignias de reconocimiento y generar certificados digitales automáticos.  
Desarrollada con foco en accesibilidad (WCAG 2.1), seguridad y escalabilidad.

---

## 📑 Tabla de contenidos

1. [🚀 Tecnologías principales](#-tecnologías-principales)
2. [📁 Estructura del proyecto](#-estructura-del-proyecto)
3. [🧪 Credenciales de prueba](#-credenciales-de-prueba)
4. [📦 Instalación y ejecución general](#-instalación-y-ejecución-general)
5. [⚙️ Backend – API REST](#️-backend--api-rest)
   - [Tecnologías](#tecnologías-backend)
   - [Estructura](#estructura-backend)
   - [Variables de entorno](#variables-de-entorno-backend)
   - [Endpoints principales](#endpoints-principales)
   - [Seguridad implementada](#seguridad-implementada)
   - [Pruebas con curl](#pruebas-con-curl)
6. [🎨 Frontend – React + Vite](#-frontend--react--vite)
   - [Tecnologías](#tecnologías-frontend)
   - [Estructura](#estructura-frontend)
   - [Rutas principales](#rutas-principales)
   - [Accesibilidad](#accesibilidad)
   - [Proxy y variables de entorno](#proxy-y-variables-de-entorno)
7. [🚫 Archivos que no se deben subir (`.gitignore`)](#-archivos-que-no-se-deben-subir-gitignore)
8. [📄 Licencia](#-licencia)

---

## 🚀 Tecnologías principales

- **Frontend:** React 18 + Vite + React Router + Axios + CSS puro (accesible)
- **Backend:** Node.js + Express + JWT + bcrypt + Nodemailer + PDFKit
- **Base de datos:** MySQL (diseño relacional normalizado)
- **Seguridad:** reCAPTCHA v2, verificación de correo, cierre de sesión por inactividad

---

## 📁 Estructura del proyecto

voluntario-plus/
├── backend/ # API REST (Node.js + Express)
├── frontend/ # Aplicación React (SPA)
├── database/ # Scripts SQL (estructura y datos de prueba)
└── README.md


---

## 🧪 Credenciales de prueba

| Rol           | Email                          | Contraseña |
|---------------|--------------------------------|------------|
| Administrador | `admin@voluntario.com`         | `123456`   |
| Organización  | `ambiental@fundacion.org`      | `123456`   |
| Voluntario    | `voluntario.regular@test.com`  | `123456`   |

> ⚠️ **Nota:** Estas credenciales son solo para pruebas locales. En producción deben cambiarse.

---

## 📦 Instalación y ejecución general

### Requisitos previos
- Node.js (v20 o superior)
- MySQL (XAMPP, WAMP o standalone)
- Git

### Clonar el repositorio
`bash
``git clone https://github.com/tu-usuario/voluntario-plus.git
cd voluntario-plus``

Configurar la base de datos
Importa el archivo database/voluntario_plus.sql en tu MySQL (phpMyAdmin o línea de comandos).

Verifica que la base voluntario_plus se haya creado con todas las tablas.

FRONTEND
cd backend
npm install
cp .env.example .env   # (edita con tus credenciales locales)
npm run dev

BACKEND
cd frontend
npm install
npm run dev

Abre http://localhost:5173 en tu navegador.

⚙️ Backend – API REST
API RESTful para la plataforma de voluntariado. Desarrollada con Node.js, Express, MySQL y autenticación JWT.

Tecnologías backend
Tecnología	Propósito
Express	Framework web para Node.js
MySQL2	Driver con soporte de promesas y pool de conexiones
bcryptjs	Hashing de contraseñas
jsonwebtoken	Autenticación sin estado
Nodemailer	Envío de correos (verificación)
pdfkit	Generación de certificados PDF
dotenv	Variables de entorno

Estructura backend

backend/
├── config/           # Configuración (DB, mailer)
├── controllers/      # Lógica de negocio
├── middleware/       # Auth, validaciones
├── models/           # Consultas SQL
├── routes/           # Endpoints de la API
├── utils/            # Funciones auxiliares (pdf, captcha, validadores)
├── .env.example      # Plantilla de variables de entorno
├── package.json
└── server.js         # Punto de entrada

Variables de entorno (.env)
Copia el archivo .env.example a .env y completa los valores:Variables de entorno (.env)
Copia el archivo .env.example a .env y completa los valores:

PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=voluntario_plus
JWT_SECRET=clave_muy_segura
EMAIL_USER=tu_correo@gmail.com
EMAIL_PASS=contraseña_aplicacion
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
RECAPTCHA_SECRET=clave_recaptcha

Endpoints principales
Método	Ruta	Descripción	Acceso
POST	/api/auth/registro/voluntario	Registro de voluntario	Público
POST	/api/auth/registro/organizacion	Registro de organización	Público
POST	/api/auth/login	Inicio de sesión (devuelve JWT)	Público
GET	/api/publicaciones	Lista todas las oportunidades	Público
POST	/api/aplicaciones	Postularse a una oportunidad	Voluntario
GET	/api/organizacion/panel	Panel de organización	Organización
GET	/api/admin/panel	Panel de administración	Admin
POST	/api/organizacion/aplicaciones/:id/completar	Completar proyecto y generar PDF	Organización

Seguridad implementada
JWT con expiración de 24h (almacenado en localStorage en el frontend)

bcrypt hashing con 10 rondas

reCAPTCHA v2 en registros

Verificación de correo (token único de 32 bytes, expiración 24h)

Protección de rutas por rol (middleware verificarToken)

Variables de entorno para credenciales sensibles

Pruebas con curl (ejemplo)

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@voluntario.com","password":"123456"}'

  🎨 Frontend – React + Vite
Interfaz de usuario de la plataforma de voluntariado. Diseñada con enfoque en accesibilidad (WCAG 2.1), navegación por teclado y compatibilidad con lectores de pantalla.

Tecnologías frontend
Tecnología	Propósito
React 18	Biblioteca para interfaces de usuario
Vite	Empaquetador ultrarrápido (HMR, esbuild)
React Router DOM	Navegación SPA
Axios	Cliente HTTP con interceptores
React Hot Toast	Notificaciones accesibles
CSS puro	Estilos modulares por componente (sin frameworks)

Estructura frontend

frontend/
├── public/               # Índice y recursos estáticos
├── src/
│   ├── components/       # Componentes reutilizables
│   │   ├── auth/         # Login, registro (voluntario/organización)
│   │   ├── comunes/      # Layout, RutaProtegida, Loader
│   │   ├── voluntario/   # Feed, perfil, postulaciones, certificados
│   │   ├── organizacion/ # Panel, gestión de publicaciones, postulantes
│   │   └── admin/        # Panel de administración
│   ├── contexts/         # AuthContext (autenticación global)
│   ├── hooks/            # useIdleTimeout (cierre por inactividad)
│   ├── pages/            # Públicas: Welcome, AcercaDe, Terminos
│   ├── services/         # Configuración de Axios
│   ├── styles/           # CSS global
│   ├── App.jsx
│   └── index.jsx
├── .env                  # Variables de entorno (opcional)
├── package.json
└── vite.config.js        # Proxy para evitar CORS

Rutas principales
Ruta	Descripción	Acceso
/	Página de bienvenida (pública)	Todos
/login	Inicio de sesión	Todos
/registro/voluntario	Registro de voluntario	Todos
/registro/organizacion	Registro de organización	Todos
/feed	Feed de oportunidades	Voluntario
/perfil	Perfil del voluntario	Voluntario
/mis-postulaciones	Historial de postulaciones	Voluntario
/mis-certificados	Certificados descargables	Voluntario
/organizacion/panel	Panel de organización	Organización
/organizacion/nueva-publicacion	Crear oportunidad	Organización
/admin/panel	Panel de administración	Admin
Accesibilidad
Atributos ARIA (aria-label, role, aria-expanded) en componentes interactivos.

Navegación por teclado (Tab, Enter, Espacio). El foco es visible con outline.

Compatibilidad con lectores de pantalla (VoiceOver, TalkBack, NVDA).

Contraste de color según WCAG 2.1 (ratio ≥4.5:1).

Tamaños de fuente en rem y zoom hasta 200% sin pérdida de funcionalidad.

Proxy y variables de entorno
Configuración de proxy (Vite) – evita CORS en desarrollo

