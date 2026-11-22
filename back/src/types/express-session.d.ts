import "express-session";

// Interfaz para el usuario guardado en la sesión
export interface SessionUser {
  id: string;
  correo: string;
  nombre_usuario: string;
  xp_total: number;
  nivel_actual: number;
}

// Extendemos el tipo SessionData nativo de express-session
declare module "express-session" {
  interface SessionData {
    user?: SessionUser;
  }
}
