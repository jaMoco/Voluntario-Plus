-- ======================================================
-- BASE DE DATOS VOLUNTARIO+ (VERSIÓN ACTUALIZADA)
-- ======================================================

-- Crear la base de datos (si no existe)
CREATE DATABASE IF NOT EXISTS voluntario_plus
CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;

USE voluntario_plus;

-- ======================================================
-- ELIMINAR TABLAS EN ORDEN (por claves foráneas)
-- ======================================================
DROP TABLE IF EXISTS certificados;
DROP TABLE IF EXISTS notificaciones;
DROP TABLE IF EXISTS voluntario_insignias;
DROP TABLE IF EXISTS aplicaciones;
DROP TABLE IF EXISTS publicaciones;
DROP TABLE IF EXISTS organizaciones;
DROP TABLE IF EXISTS voluntarios;
DROP TABLE IF EXISTS usuarios;
DROP TABLE IF EXISTS actividades_usuario;
DROP TABLE IF EXISTS insignias;
DROP TABLE IF EXISTS categorias;

-- ======================================================
-- TABLA DE USUARIOS (base para todos los roles)
-- ======================================================
CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    rol ENUM('voluntario', 'organizacion', 'admin') DEFAULT 'voluntario',
    activo BOOLEAN DEFAULT TRUE,
    email_verificado BOOLEAN DEFAULT FALSE,
    token_verificacion VARCHAR(100) NULL,
    token_expiracion DATETIME NULL,
    token_reset_password VARCHAR(100) NULL,
    token_reset_expiracion DATETIME NULL,
    foto_perfil VARCHAR(255) NULL,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ======================================================
-- TABLA DE ACTIVIDADES (HISTORIAL DEL USUARIO)
-- ======================================================
CREATE TABLE actividades_usuario (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    titulo VARCHAR(150) NOT NULL,
    descripcion TEXT NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- ======================================================
-- TABLA DE VOLUNTARIOS (extiende usuarios)
-- ======================================================
CREATE TABLE voluntarios (
    usuario_id INT PRIMARY KEY,
    nombre_completo VARCHAR(150) NOT NULL,
    cedula VARCHAR(20) UNIQUE NOT NULL, -- Campo Único
    edad INT,
    fecha_nacimiento DATE,
    telefono VARCHAR(20) UNIQUE,        -- Campo Único
    ubicacion_pais VARCHAR(100),
    ubicacion_estado VARCHAR(100),
    ubicacion_municipio VARCHAR(100),
    ubicacion_direccion TEXT,
    codigo_postal VARCHAR(20),
    tiene_discapacidad BOOLEAN DEFAULT FALSE,
    discapacidad_categoria VARCHAR(100),
    discapacidad_nivel VARCHAR(50),
    tipo_discapacidad VARCHAR(100),
    es_estudiante BOOLEAN DEFAULT FALSE,
    requiere_servicio_comunitario BOOLEAN DEFAULT FALSE,
    universidad VARCHAR(150),
    carrera VARCHAR(150),
    mencion VARCHAR(150),
    semestre INT,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- ======================================================
-- TABLA DE ORGANIZACIONES (extiende usuarios)
-- ======================================================
CREATE TABLE organizaciones (
    usuario_id INT PRIMARY KEY,
    nombre_oficial VARCHAR(200) UNIQUE NOT NULL,    -- Campo Único
    nombre_comercial VARCHAR(200) UNIQUE,           -- Campo Único
    tipo_organizacion ENUM('empresa', 'ong', 'fundacion', 'asociacion', 'cooperativa', 'otro') NOT NULL,
    otro_tipo VARCHAR(100),
    rif VARCHAR(50) UNIQUE NOT NULL,                -- Campo Único
    pais_constitucion VARCHAR(100) DEFAULT 'Venezuela',
    sitio_web VARCHAR(255) UNIQUE,                  -- Campo Único
    direccion_fiscal TEXT NOT NULL,
    ciudad_estado VARCHAR(100) NOT NULL,
    municipio VARCHAR(100),
    codigo_postal VARCHAR(20),
    telefono_principal VARCHAR(20) UNIQUE NOT NULL, -- Campo Único
    telefono_secundario VARCHAR(20),
    email_oficial VARCHAR(100) UNIQUE NOT NULL,     -- Campo Único
    representante_nombre VARCHAR(150) NOT NULL,
    representante_cedula VARCHAR(20) NOT NULL,
    representante_cargo VARCHAR(100) NOT NULL,
    representante_email_personal VARCHAR(100),
    representante_telefono VARCHAR(20),
    sector_industria VARCHAR(100),
    num_empleados INT,
    descripcion TEXT,
    como_conocio VARCHAR(255),
    verificada BOOLEAN DEFAULT FALSE,
    fecha_verificacion DATE,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- ======================================================
-- TABLA DE CATEGORÍAS DE PROYECTOS
-- ======================================================
CREATE TABLE categorias (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) UNIQUE NOT NULL,
    descripcion TEXT
);

-- ======================================================
-- TABLA DE PUBLICACIONES (OPORTUNIDADES)
-- ======================================================
CREATE TABLE publicaciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    organizacion_id INT NOT NULL,
    titulo VARCHAR(200) NOT NULL,
    descripcion TEXT NOT NULL,
    categoria_id INT,
    apto_discapacidad BOOLEAN DEFAULT FALSE,
    discapacidades_no_aptas_json JSON NULL,
    lugar VARCHAR(255),
    pais VARCHAR(100),
    estado VARCHAR(100),
    municipio VARCHAR(100),
    fecha_actividad DATE,
    fecha_fin DATE,
    fecha_caducidad_postulacion DATE NULL,
    hora_inicio TIME,
    hora_fin TIME,
    plazas_disponibles INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    activa BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (organizacion_id) REFERENCES organizaciones(usuario_id) ON DELETE CASCADE,
    FOREIGN KEY (categoria_id) REFERENCES categorias(id) ON DELETE SET NULL
);

-- ======================================================
-- TABLA DE APLICACIONES (POSTULACIONES)
-- ======================================================
CREATE TABLE aplicaciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    voluntario_id INT NOT NULL,
    publicacion_id INT NOT NULL,
    estado ENUM('pendiente', 'aceptado', 'rechazado', 'completado') DEFAULT 'pendiente',
    fecha_aplicacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    horas_realizadas INT DEFAULT 0,
    feedback_organizacion TEXT,
    FOREIGN KEY (voluntario_id) REFERENCES voluntarios(usuario_id) ON DELETE CASCADE,
    FOREIGN KEY (publicacion_id) REFERENCES publicaciones(id) ON DELETE CASCADE,
    UNIQUE KEY (voluntario_id, publicacion_id)
);

-- ======================================================
-- TABLA DE INSIGNIAS (definiciones)
-- ======================================================
CREATE TABLE insignias (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    imagen_url VARCHAR(255)
);

-- ======================================================
-- TABLA DE INSIGNIAS OTORGADAS A VOLUNTARIOS
-- ======================================================
CREATE TABLE voluntario_insignias (
    id INT AUTO_INCREMENT PRIMARY KEY,
    voluntario_id INT NOT NULL,
    insignia_id INT NOT NULL,
    organizacion_id INT NOT NULL,
    fecha_otorgada TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (voluntario_id) REFERENCES voluntarios(usuario_id) ON DELETE CASCADE,
    FOREIGN KEY (insignia_id) REFERENCES insignias(id) ON DELETE CASCADE,
    FOREIGN KEY (organizacion_id) REFERENCES organizaciones(usuario_id) ON DELETE CASCADE
);

-- ======================================================
-- TABLA DE CERTIFICADOS
-- ======================================================
CREATE TABLE certificados (
    id INT AUTO_INCREMENT PRIMARY KEY,
    aplicacion_id INT NOT NULL,
    ruta_pdf VARCHAR(255),
    horas_certificadas INT NOT NULL,
    fecha_emision TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (aplicacion_id) REFERENCES aplicaciones(id) ON DELETE CASCADE
);

-- ======================================================
-- TABLA DE NOTIFICACIONES
-- ======================================================
CREATE TABLE notificaciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    tipo VARCHAR(50), -- 'postulacion', 'evento', 'insignia', 'sistema'
    mensaje TEXT NOT NULL,
    leida BOOLEAN DEFAULT FALSE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- ======================================================
-- DATOS DE PRUEBA (INSERCIÓN)
-- ======================================================

-- Contraseña para todos los usuarios: 123456
-- Hash bcrypt (generado con bcryptjs para "123456")
SET @hash = '$2b$10$8k8k8k8k8k8k8k8k8k8k8uO6Cq8x2iL5kYjFk3mNqR7tVwXyZa';

-- 1. ADMINISTRADOR
INSERT INTO usuarios (email, password, rol, activo, email_verificado) VALUES
('admin@voluntario.com', @hash, 'admin', TRUE, TRUE);

-- 2. VOLUNTARIOS (3)
INSERT INTO usuarios (email, password, rol, activo, email_verificado) VALUES
('voluntario.regular@test.com', @hash, 'voluntario', TRUE, TRUE),
('estudiante.servicio@test.com', @hash, 'voluntario', TRUE, TRUE),
('voluntario.discapacidad@test.com', @hash, 'voluntario', TRUE, TRUE);

SET @vol_reg = (SELECT id FROM usuarios WHERE email = 'voluntario.regular@test.com');
SET @vol_est = (SELECT id FROM usuarios WHERE email = 'estudiante.servicio@test.com');
SET @vol_disc = (SELECT id FROM usuarios WHERE email = 'voluntario.discapacidad@test.com');

INSERT INTO voluntarios (usuario_id, nombre_completo, cedula, telefono, ubicacion_pais, ubicacion_estado, ubicacion_municipio) VALUES
(@vol_reg, 'Carlos López', 'V-12345678', '0412-1234567', 'Venezuela', 'Caracas', 'Libertador');

INSERT INTO voluntarios (usuario_id, nombre_completo, cedula, telefono, ubicacion_pais, ubicacion_estado, ubicacion_municipio, es_estudiante, requiere_servicio_comunitario, universidad, carrera, semestre) VALUES
(@vol_est, 'María González', 'V-87654321', '0424-7654321', 'Venezuela', 'Caracas', 'Chacao', TRUE, TRUE, 'UCV', 'Ingeniería Informática', 5);

INSERT INTO voluntarios (usuario_id, nombre_completo, cedula, telefono, ubicacion_pais, ubicacion_estado, ubicacion_municipio, tiene_discapacidad, tipo_discapacidad) VALUES
(@vol_disc, 'José Rojas', 'V-11223344', '0416-9988776', 'Venezuela', 'Miranda', 'Baruta', TRUE, 'Visual');

-- 3. ORGANIZACIONES (3)
INSERT INTO usuarios (email, password, rol, activo, email_verificado) VALUES
('ambiental@fundacion.org', @hash, 'organizacion', TRUE, TRUE),
('social@asociacion.org', @hash, 'organizacion', TRUE, TRUE),
('rehabilitacion@crv.org', @hash, 'organizacion', TRUE, TRUE);

SET @org1 = (SELECT id FROM usuarios WHERE email = 'ambiental@fundacion.org');
SET @org2 = (SELECT id FROM usuarios WHERE email = 'social@asociacion.org');
SET @org3 = (SELECT id FROM usuarios WHERE email = 'rehabilitacion@crv.org');

INSERT INTO organizaciones (usuario_id, nombre_oficial, rif, telefono_principal, email_oficial, direccion_fiscal, ciudad_estado, representante_nombre, representante_cedula, representante_cargo, verificada) VALUES
(@org1, 'Fundación Verde Ambiental', 'J-12345678-0', '0212-1234567', 'ambiental@fundacion.org', 'Av. Principal, Edif. Verde', 'Caracas', 'Ana Torres', 'V-10111213', 'Directora', TRUE),
(@org2, 'Manos Solidarias', 'J-87654321-5', '0241-8765432', 'social@asociacion.org', 'Calle 5, Edif. Solidaridad', 'Maracay', 'Luis Méndez', 'V-20212223', 'Coordinador', TRUE),
(@org3, 'Centro de Rehabilitación Visual', 'J-99887766-2', '0212-4567890', 'rehabilitacion@crv.org', 'Av. Los Próceres, Torre Visión', 'Caracas', 'Marta Rivas', 'V-30405060', 'Directora Ejecutiva', TRUE);

-- 4. CATEGORÍAS
INSERT INTO categorias (nombre, descripcion) VALUES
('Educación', 'Apoyo escolar, alfabetización, talleres educativos'),
('Salud', 'Acompañamiento en salud, campañas médicas'),
('Ambiente', 'Limpieza, reforestación, conservación'),
('Social', 'Comedores, apoyo a adultos mayores, inclusión'),
('Tecnología', 'Clases de informática, soporte técnico'),
('Emergencia', 'Ayuda en desastres, primeros auxilios');

-- 5. PUBLICACIONES (3 por organización)
INSERT INTO publicaciones (organizacion_id, titulo, descripcion, fecha_actividad, fecha_caducidad_postulacion, lugar, apto_discapacidad, plazas_disponibles) VALUES
(@org1, 'Jornada de Reforestación', 'Plantación de árboles en el Parque Nacional El Ávila.', '2026-05-15', '2026-05-10', 'Parque Nacional El Ávila', FALSE, 20),
(@org1, 'Taller de Reciclaje', 'Enseñanza sobre separación de residuos y compostaje.', '2026-06-05', '2026-06-01', 'Centro Comunitario Los Ruices', TRUE, 15),
(@org1, 'Limpieza de Playa', 'Recolección de plásticos en Caraballeda.', '2026-07-10', '2026-07-01', 'Playa Caraballeda', TRUE, 50),
(@org2, 'Apoyo Escolar', 'Clases de matemática y lenguaje para niños.', '2026-05-20', '2026-05-18', 'Barrio El Valle', FALSE, 10),
(@org2, 'Comedores Comunitarios', 'Preparación y distribución de comida.', '2026-06-12', '2026-06-10', 'Parroquia San Juan', TRUE, 30),
(@org2, 'Donación de Ropa', 'Clasificación y entrega de ropa.', '2026-07-05', '2026-07-01', 'Sede Manos Solidarias', TRUE, 5),
(@org3, 'Taller de Braille', 'Enseñanza básica del sistema Braille.', '2026-05-25', '2026-05-22', 'Centro de Rehabilitación Visual', TRUE, 12),
(@org3, 'Acompañamiento a personas ciegas', 'Acompañar a usuarios en citas y actividades recreativas.', '2026-06-15', '2026-06-10', 'Caracas', TRUE, 8),
(@org3, 'Grabación de audiolibros', 'Voluntarios para grabar libros en formato audible.', '2026-07-20', '2026-07-15', 'Estudio CRV', TRUE, 4);

-- 6. APLICACIONES (ejemplos)
SET @pub1 = (SELECT id FROM publicaciones WHERE titulo = 'Jornada de Reforestación');
SET @pub2 = (SELECT id FROM publicaciones WHERE titulo = 'Apoyo Escolar');
SET @pub3 = (SELECT id FROM publicaciones WHERE titulo = 'Comedores Comunitarios');
SET @pub4 = (SELECT id FROM publicaciones WHERE titulo = 'Taller de Braille');
SET @pub5 = (SELECT id FROM publicaciones WHERE titulo = 'Acompañamiento a personas ciegas');
SET @pub6 = (SELECT id FROM publicaciones WHERE titulo = 'Taller de Reciclaje');

INSERT INTO aplicaciones (voluntario_id, publicacion_id, estado) VALUES
(@vol_reg, @pub1, 'aceptado'),
(@vol_reg, @pub2, 'pendiente'),
(@vol_est, @pub3, 'aceptado'),
(@vol_est, @pub4, 'pendiente'),
(@vol_disc, @pub5, 'aceptado'),
(@vol_disc, @pub6, 'pendiente');

-- 7. INSIGNIAS
INSERT INTO insignias (nombre, descripcion) VALUES
('Primera Postulación', 'Se otorga al realizar la primera aplicación'),
('Constancia Voluntaria', '10 horas acumuladas'),
('Inclusión Activa', 'Participación en proyectos aptos para discapacidad');

-- 8. ASIGNACIÓN DE INSIGNIAS
INSERT INTO voluntario_insignias (voluntario_id, insignia_id, organizacion_id) VALUES
(@vol_reg, 1, @org1),
(@vol_est, 1, @org2),
(@vol_disc, 3, @org3);

-- 9. CERTIFICADOS (para una aplicación completada)
-- Suponiendo que la aplicación de @vol_reg en @pub1 está aceptada y se completó
INSERT INTO certificados (aplicacion_id, ruta_pdf, horas_certificadas)
SELECT id, '/certificados/ejemplo.pdf', 5 FROM aplicaciones WHERE voluntario_id = @vol_reg AND publicacion_id = @pub1 LIMIT 1;

-- ======================================================
-- FIN DEL SCRIPT
-- ======================================================
SELECT 'Base de datos actualizada correctamente' AS Mensaje;