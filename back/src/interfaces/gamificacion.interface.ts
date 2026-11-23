// ============================================================================
// TIPOS BASE Y ESTADOS
// ============================================================================
export type TipoSesion = "normal" | "guardian";
export type EstadoProgreso = "bloqueado" | "activo" | "completado";

// ============================================================================
// MUNDOS
// ============================================================================
export interface MundoConProgresoDTO {
  id: string;
  orden: number;
  titulo: string;
  subtitulo: string;
  descripcion: string;
  nombre_gema: string;
  icono_slug: string;
  total_sesiones: number;
  sesiones_completadas: number;
  gema_desbloqueada: boolean;
}

// ============================================================================
// CONTENIDO JSONB DE SESIONES
// ============================================================================
export interface SimuladorMemoria {
  tipo: string;
  direccion: string;
  identificador: string;
  valor_inicial: string | number;
  tipo_inferido: string;
  valores_prueba: (string | number)[];
}

export interface TarjetaTeorica {
  orden: number;
  badge: string;
  titulo: string;
  descripcion: string;
  analogia?: string;
  archivo?: string;
  codigo?: string;
  simulador?: SimuladorMemoria;
}

export interface ContenidoTeoricoJSON {
  tarjetas?: TarjetaTeorica[];
  guardian?: {
    nombre: string;
    gema_recompensa: string;
    mision: string;
  };
}

export interface OpcionPregunta {
  id: string;
  texto: string;
}

export interface FeedbackArtur {
  titulo_correcto: string;
  explicacion_correcta: string;
  explicacion_incorrectas: string;
}

export interface PreguntaCuestionario {
  id: string;
  dificultad: string;
  enunciado: string;
  opciones: OpcionPregunta[];
  respuesta_correcta: string;
  feedback_artur: FeedbackArtur;
}

export interface CuestionarioJSON {
  preguntas: PreguntaCuestionario[];
}

// ============================================================================
// SESIONES Y PROGRESO
// ============================================================================
export interface SesionResumenDTO {
  id: string;
  mundo_id: string;
  orden: number;
  titulo: string;
  tipo_sesion: TipoSesion;
  xp_recompensa: number;
  estado: EstadoProgreso;
  puntaje_obtenido: number;
  xp_ganada: number;
  intentos: number;
}

export interface SesionDetalleDTO extends SesionResumenDTO {
  contenido_teorico: ContenidoTeoricoJSON;
  cuestionario_json: CuestionarioJSON;
}

export interface ProgresoUsuarioDTO {
  id: string;
  usuario_id: string;
  sesion_id: string;
  estado: EstadoProgreso;
  puntaje_obtenido: number;
  xp_ganada: number;
  intentos: number;
  completado_en: Date | null;
}

// DTOs de entrada para completar / desbloquear sesiones
export interface CompletarSesionInput {
  usuario_id: string;
  sesion_id: string;
  puntaje_obtenido: number;
  xp_ganada: number;
}

// ============================================================================
// JEFE FINAL (EL BUG SUPREMO)
// ============================================================================
export interface BloquesOpcionesJefeJSON {
  fichas: string[];
  solucion: Record<string, string>;
}

export interface RetoJefeFinalDTO {
  id: string;
  mundo_id: string;
  mundo_titulo: string;
  ronda: number;
  enunciado_mision: string;
  plantilla_codigo: string;
  bloques_opciones: BloquesOpcionesJefeJSON;
  pista_artur: string;
}

// ============================================================================
// COMENTARIOS POR SESIÓN
// ============================================================================
export interface ComentarioSesionDTO {
  id: string;
  sesion_id: string;
  usuario_id: string;
  nombre_usuario: string;
  nivel_actual: number;
  contenido: string;
  creado_en: Date;
}

export interface CrearComentarioInput {
  sesion_id: string;
  usuario_id: string;
  contenido: string;
}

// DTO para actualizar el progreso de gamificación al completar niveles o vencer al jefe
export interface ActualizarProgresoGamificacionDTO {
  id: string;
  xp_total: number;
  nivel_actual: number;
  jefe_final_derrotado: boolean;
}

// Respuesta del UPDATE sobre el progreso de gamificación en usuarios
export interface ProgresoGamificacionUsuarioDTO {
  id: string;
  nombre_usuario: string;
  xp_total: number;
  nivel_actual: number;
  jefe_final_derrotado: boolean;
}
