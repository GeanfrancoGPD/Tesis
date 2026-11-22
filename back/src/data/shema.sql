CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Tabla de Usuarios (Estudiantes)
CREATE TABLE usuarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre_usuario VARCHAR(50) UNIQUE NOT NULL,
    correo VARCHAR(120) UNIQUE NOT NULL,
    clave_hash TEXT NULL,
    proveedor_auth VARCHAR(20) NOT NULL DEFAULT 'local' CHECK (proveedor_auth IN ('local', 'google', 'github')),
    xp_total INTEGER NOT NULL DEFAULT 0,
    nivel_actual INTEGER NOT NULL DEFAULT 1,
    jefe_final_derrotado BOOLEAN NOT NULL DEFAULT FALSE,
    creado_en TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 2. Tabla de Mundos (Los 4 bloques temáticos)
CREATE TABLE mundos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    orden INTEGER UNIQUE NOT NULL,
    titulo VARCHAR(100) NOT NULL,
    subtitulo VARCHAR(150) NOT NULL,
    descripcion TEXT NOT NULL,
    nombre_gema VARCHAR(60) NOT NULL,
    icono_slug VARCHAR(50) NOT NULL
);

-- 3. Tabla de Sesiones (Niveles teóricos y Retos de Guardián)
CREATE TABLE sesiones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mundo_id UUID NOT NULL REFERENCES mundos(id) ON DELETE CASCADE,
    orden INTEGER NOT NULL,
    titulo VARCHAR(120) NOT NULL,
    tipo_sesion VARCHAR(20) NOT NULL DEFAULT 'normal' CHECK (tipo_sesion IN ('normal', 'guardian')),
    xp_recompensa INTEGER NOT NULL DEFAULT 100,
    contenido_teorico JSONB NOT NULL,
    cuestionario_json JSONB NOT NULL,
    UNIQUE (mundo_id, orden)
);

-- 4. Tabla de Progreso por Usuario y Sesión
CREATE TABLE progreso_usuarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    sesion_id UUID NOT NULL REFERENCES sesiones(id) ON DELETE CASCADE,
    estado VARCHAR(20) NOT NULL DEFAULT 'bloqueado' CHECK (estado IN ('bloqueado', 'activo', 'completado')),
    puntaje_obtenido INTEGER NOT NULL DEFAULT 0,
    xp_ganada INTEGER NOT NULL DEFAULT 0,
    intentos INTEGER NOT NULL DEFAULT 0,
    completado_en TIMESTAMP NULL,
    UNIQUE (usuario_id, sesion_id)
);

-- 5. Tabla de Comentarios por Sesión
CREATE TABLE comentarios_sesion (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sesion_id UUID NOT NULL REFERENCES sesiones(id) ON DELETE CASCADE,
    usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    contenido TEXT NOT NULL,
    creado_en TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 6. Tabla de Retos del Jefe Final (Ligada 1 a 1 con mundos.id)
CREATE TABLE jefe_final_retos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mundo_id UUID UNIQUE NOT NULL REFERENCES mundos(id) ON DELETE CASCADE,
    ronda INTEGER UNIQUE NOT NULL,
    enunciado_mision TEXT NOT NULL,
    plantilla_codigo TEXT NOT NULL,
    bloques_opciones JSONB NOT NULL,
    pista_artur TEXT NOT NULL
);