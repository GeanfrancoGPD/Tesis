import { Request, Response } from "express";
import GamificacionRepository from "../repository/GamificacionRepository";
import UserRepository from "../repository/UserRepository";
import Validator from "../utils/validator/validatorGamificacion";

class GamificacionController {
  private readonly XP_POR_NIVEL = 500;

  constructor(
    private readonly repository = GamificacionRepository,
    private readonly usuarioRepository = UserRepository,
    private readonly validator = Validator,
  ) {}

  // Helper para extraer el ID del usuario autenticado desde express-session
  private getUsuarioId(req: Request): string | null {
    return req.session?.user?.id ?? null;
  }

  // Helper para calcular nivel según XP acumulada (Nivel 1: 0-499, Nivel 2: 500-999...)
  private calcularNivel(xpTotal: number): number {
    return Math.floor(xpTotal / this.XP_POR_NIVEL) + 1;
  }

  private ResolveSessionIDNivel(req: Request): string | null {
    const sesionId = req.params.sesionId;
    if (!sesionId) {
      return null;
    }
    return sesionId.toString();
  }

  // ==========================================================================
  // 1. SALA GENERAL: OBTENER MUNDOS + ESTADO DE GEMAS + PORTAL JEFE FINAL
  // ==========================================================================
  async getMundos(req: Request, res: Response): Promise<Response> {
    try {
      const usuarioId = this.getUsuarioId(req);
      if (!usuarioId) {
        return res
          .status(401)
          .json({ success: false, message: "No autenticado" });
      }

      const mundos = await this.repository.getMundosConProgreso(usuarioId);
      const gemasDesbloqueadas = mundos.filter(
        (m) => m.gema_desbloqueada,
      ).length;
      const jefeFinalDesbloqueado =
        mundos.length > 0 && gemasDesbloqueadas === mundos.length;

      return res.json({
        success: true,
        data: {
          mundos,
          gemas_desbloqueadas: gemasDesbloqueadas,
          total_gemas: mundos.length,
          jefe_final_desbloqueado: jefeFinalDesbloqueado,
        },
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Error al obtener los mundos de la plataforma",
      });
    }
  }

  // ==========================================================================
  // 2. MAPA DE NIVELES: OBTENER SESIONES DE UN MUNDO
  // ==========================================================================
  async getSesionesPorMundo(req: Request, res: Response): Promise<Response> {
    try {
      const usuarioId = this.getUsuarioId(req);
      if (!usuarioId) {
        return res
          .status(401)
          .json({ success: false, message: "No autenticado" });
      }

      const validacion = this.validator.validateUuid(
        req.params.mundoId.toString(),
      );
      if (!validacion.success) {
        return res
          .status(400)
          .json({ success: false, message: "ID de mundo inválido" });
      }

      const sesiones = await this.repository.getSesionesPorMundo(
        usuarioId,
        req.params.mundoId.toString(),
      );

      return res.json({
        success: true,
        data: sesiones,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Error al obtener las sesiones del mundo",
      });
    }
  }

  // ==========================================================================
  // 3. DETALLE DE SESIÓN (TARJETAS + CUESTIONARIO JSONB)
  // ==========================================================================
  async getSesionDetalle(req: Request, res: Response): Promise<Response> {
    try {
      const usuarioId = this.getUsuarioId(req);
      if (!usuarioId) {
        return res
          .status(401)
          .json({ success: false, message: "No autenticado" });
      }

      const sesionId = this.ResolveSessionIDNivel(req);
      if (!sesionId) {
        return res
          .status(400)
          .json({ success: false, message: "ID de sesión inválido" });
      }

      const validacion = this.validator.validateUuid(sesionId);
      if (!validacion.success) {
        return res
          .status(400)
          .json({ success: false, message: "ID de sesión inválido" });
      }

      const sesion = await this.repository.getSesionPorId(usuarioId, sesionId);

      if (!sesion) {
        return res
          .status(404)
          .json({ success: false, message: "Sesión no encontrada" });
      }

      if (sesion.estado === "bloqueado") {
        return res.status(403).json({
          success: false,
          message:
            "Debes completar el nivel anterior para desbloquear esta sesión",
        });
      }

      return res.json({
        success: true,
        data: sesion,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Error al cargar el contenido de la sesión",
      });
    }
  }

  // ==========================================================================
  // 4. COMPLETAR SESIÓN / GUARDIÁN (XP, SUBIDA DE NIVEL Y DESBLOQUEO)
  // ==========================================================================
  async completarSesion(req: Request, res: Response): Promise<Response> {
    try {
      const usuarioId = this.getUsuarioId(req);
      if (!usuarioId) {
        return res
          .status(401)
          .json({ success: false, message: "No autenticado" });
      }
      const sesionId = this.ResolveSessionIDNivel(req);
      if (!sesionId) {
        return res
          .status(400)
          .json({ success: false, message: "ID de sesión inválido" });
      }

      const validacion = this.validator.validateCompletarSesion({
        sesionId,
        ...req.body,
      });
      if (!validacion.success) {
        return res.status(400).json({
          success: false,
          message: "Datos de evaluación inválidos",
          errors: validacion.error,
        });
      }

      const { aprobado, puntaje_obtenido } = validacion.data;
      const sesion = await this.repository.getSesionPorId(usuarioId, sesionId);

      if (!sesion) {
        return res
          .status(404)
          .json({ success: false, message: "Sesión no encontrada" });
      }

      if (sesion.estado === "bloqueado") {
        return res.status(403).json({
          success: false,
          message: "No puedes completar una sesión bloqueada",
        });
      }

      // Si falló el test, solo registramos el intento y devolvemos respuesta limpia
      if (!aprobado) {
        const intento = await this.repository.registrarIntentoFallido(
          usuarioId,
          sesion.id,
        );
        return res.json({
          success: true,
          aprobado: false,
          message:
            "Intento registrado. Revisa el feedback de Artur e inténtalo de nuevo.",
          intentos: intento.intentos,
        });
      }

      // Verificar si ya estaba completada antes para no duplicar XP infinita
      const yaEstabaCompletada = sesion.estado === "completado";
      const xpOtorgada = yaEstabaCompletada ? 0 : sesion.xp_recompensa;

      // 1. Marcar progreso actual como completado
      const progresoActualizado =
        await this.repository.upsertProgresoCompletado({
          usuario_id: usuarioId,
          sesion_id: sesion.id,
          puntaje_obtenido: puntaje_obtenido ?? 100,
          xp_ganada: sesion.xp_recompensa,
        });

      // 2. Desbloquear la siguiente sesión dentro del mismo mundo (si existe)
      const siguienteSesion = await this.repository.getSiguienteSesionEnMundo(
        sesion.mundo_id,
        sesion.orden + 1,
      );
      if (siguienteSesion) {
        await this.repository.desbloquearSiguienteSesion(
          usuarioId,
          siguienteSesion.id,
        );
      }

      // 3. Actualizar XP y Nivel en la tabla usuarios (solo si es primera vez)
      const usuarioActual =
        await this.usuarioRepository.getUsuarioPorId(usuarioId);

      if (!usuarioActual) {
        return res.status(404).json({
          success: false,
          message: "Usuario no encontrado",
        });
      }

      let nuevoXp = usuarioActual.xp_total;
      let nuevoNivel = usuarioActual.nivel_actual;

      if (xpOtorgada > 0) {
        nuevoXp += xpOtorgada;
        nuevoNivel = this.calcularNivel(nuevoXp);

        await this.repository.actualizarProgresoGamificacion({
          id: usuarioId,
          xp_total: nuevoXp,
          nivel_actual: nuevoNivel,
          jefe_final_derrotado: usuarioActual.jefe_final_derrotado,
        });

        // Sincronizar sesión activa en express-session
        if (req.session.user) {
          req.session.user.xp_total = nuevoXp;
          req.session.user.nivel_actual = nuevoNivel;
        }
      }

      return res.json({
        success: true,
        aprobado: true,
        gema_obtenida: sesion.tipo_sesion === "guardian",
        xp_ganada_ahora: xpOtorgada,
        xp_total: nuevoXp,
        nivel_actual: nuevoNivel,
        siguiente_sesion_id: siguienteSesion?.id ?? null,
        progreso: progresoActualizado,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Error al registrar el progreso de la sesión",
      });
    }
  }

  // ==========================================================================
  // 5. JEFE FINAL (EL BUG SUPREMO): OBTENER RETOS Y REGISTRAR VICTORIA
  // ==========================================================================
  async getJefeFinal(req: Request, res: Response): Promise<Response> {
    try {
      const usuarioId = this.getUsuarioId(req);
      if (!usuarioId) {
        return res
          .status(401)
          .json({ success: false, message: "No autenticado" });
      }

      const mundos = await this.repository.getMundosConProgreso(usuarioId);
      const todasLasGemas =
        mundos.length > 0 && mundos.every((m) => m.gema_desbloqueada);

      if (!todasLasGemas) {
        return res.status(403).json({
          success: false,
          message:
            "Portal sellado: debes derrotar a los 4 Guardianes de Mundo para enfrentar al Bug Supremo.",
        });
      }

      const retos = await this.repository.getRetosJefeFinal();
      return res.json({
        success: true,
        data: retos,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Error al cargar la arena del Jefe Final",
      });
    }
  }

  async completarJefeFinal(req: Request, res: Response): Promise<Response> {
    try {
      const usuarioId = this.getUsuarioId(req);
      if (!usuarioId) {
        return res
          .status(401)
          .json({ success: false, message: "No autenticado" });
      }

      const usuarioActual =
        await this.usuarioRepository.getUsuarioPorId(usuarioId);

      if (!usuarioActual) {
        return res.status(404).json({
          success: false,
          message: "Usuario no encontrado",
        });
      }
      const XP_JEFE_FINAL = 500;

      const nuevoXp = usuarioActual.jefe_final_derrotado
        ? usuarioActual.xp_total
        : usuarioActual.xp_total + XP_JEFE_FINAL;
      const nuevoNivel = this.calcularNivel(nuevoXp);

      await this.repository.actualizarProgresoGamificacion({
        id: usuarioId,
        xp_total: nuevoXp,
        nivel_actual: nuevoNivel,
        jefe_final_derrotado: true,
      });

      if (req.session.user) {
        req.session.user.xp_total = nuevoXp;
        req.session.user.nivel_actual = nuevoNivel;
      }

      return res.json({
        success: true,
        message: "¡Has derrotado al Bug Supremo y dominado los fundamentos!",
        xp_total: nuevoXp,
        nivel_actual: nuevoNivel,
        jefe_final_derrotado: true,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Error al registrar la derrota del Jefe Final",
      });
    }
  }

  // ==========================================================================
  // 6. COMENTARIOS POR SESIÓN
  // ==========================================================================
  async getComentarios(req: Request, res: Response): Promise<Response> {
    try {
      const nivelSesionId = this.ResolveSessionIDNivel(req);
      if (!nivelSesionId) {
        return res
          .status(400)
          .json({ success: false, message: "ID de sesión inválido" });
      }

      const comentarios =
        await this.repository.getComentariosPorSesion(nivelSesionId);
      return res.json({ success: true, data: comentarios });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Error al obtener los comentarios",
      });
    }
  }

  async crearComentario(req: Request, res: Response): Promise<Response> {
    try {
      const usuarioId = this.getUsuarioId(req);
      if (!usuarioId) {
        return res
          .status(401)
          .json({ success: false, message: "No autenticado" });
      }

      const sesionId = this.ResolveSessionIDNivel(req);
      if (!sesionId) {
        return res
          .status(400)
          .json({ success: false, message: "ID de sesión inválido" });
      }

      const validacion = this.validator.validateComentario({
        sesionId: req.params.sesionId,
        contenido: req.body.contenido,
      });
      if (!validacion.success) {
        return res.status(400).json({
          success: false,
          message: "El comentario no es válido",
          errors: validacion.error,
        });
      }

      const nuevo = await this.repository.crearComentarioSesion({
        sesion_id: sesionId,
        usuario_id: usuarioId,
        contenido: validacion.data.contenido.trim(),
      });

      return res.status(201).json({
        success: true,
        message: "Comentario publicado",
        data: nuevo,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Error al publicar el comentario",
      });
    }
  }
}

export default new GamificacionController();
