// 1. Representación exacta de la tabla en BD (para el Repository)
export type ProveedorAuth = "local" | "google" | "github";

export interface Usuario {
  id: string; // UUID de PostgreSQL
  nombre_usuario: string;
  correo: string;
  clave_hash: string | null; // Null si el registro fue mediante OAuth (Google/GitHub)
  proveedor_auth: ProveedorAuth;
  xp_total: number;
  nivel_actual: number;
  jefe_final_derrotado: boolean;
  creado_en: Date;
}

// 2. DTOs e Interfaces de Entrada / Salida

// DTO para la creación de usuario (Registro local u OAuth)
export interface CrearUsuarioDTO {
  nombre_usuario: string;
  correo: string;
  clave_hash: string | null;
  proveedor_auth?: ProveedorAuth; // Por defecto 'local' en BD
}

// DTO para actualizar los datos básicos del perfil del usuario
export interface ActualizarUsuarioDTO {
  id: string;
  nombre_usuario: string;
  correo: string;
}

// DTO para actualizar el progreso de gamificación al completar niveles o vencer al jefe
export interface ActualizarProgresoGamificacionDTO {
  id: string;
  xp_total: number;
  nivel_actual: number;
  jefe_final_derrotado: boolean;
}

// Respuesta limpia para el frontend (omite clave_hash por seguridad)
export interface ObtenerUsuarioDTO {
  id: string;
  nombre_usuario: string;
  correo: string;
  proveedor_auth: ProveedorAuth;
  xp_total: number;
  nivel_actual: number;
  jefe_final_derrotado: boolean;
  creado_en: Date;
}

// Estructura del usuario guardado en la sesión (express-session)
export interface SessionUser {
  id: string;
  nombre_usuario: string;
  correo: string;
  xp_total: number;
  nivel_actual: number;
}
