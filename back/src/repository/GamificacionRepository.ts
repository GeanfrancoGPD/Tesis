import {
  ComentarioSesionDTO,
  CompletarSesionInput,
  CrearComentarioInput,
  MundoConProgresoDTO,
  ProgresoUsuarioDTO,
  RetoJefeFinalDTO,
  SesionDetalleDTO,
  SesionResumenDTO,
  ActualizarProgresoGamificacionDTO,
} from "../interfaces/gamificacion.interface";
import DB from "../components/DBComponent";

class GamificacionRepository {
  constructor(private readonly db = DB) {}

  // ==========================================================================
  // MUNDOS Y SESIONES
  // ==========================================================================

  async getMundosConProgreso(
    usuario_id: string,
  ): Promise<MundoConProgresoDTO[]> {
    const result = await this.db.excecuteNameQuery("getMundosConProgreso", {
      usuario_id,
    });
    return Array.isArray(result) ? result : [];
  }

  async getSesionesPorMundo(
    usuario_id: string,
    mundo_id: string,
  ): Promise<SesionResumenDTO[]> {
    const result = await this.db.excecuteNameQuery("getSesionesPorMundo", {
      usuario_id,
      mundo_id,
    });
    return Array.isArray(result) ? result : [];
  }

  async getSesionPorId(
    usuario_id: string,
    sesion_id: string,
  ): Promise<SesionDetalleDTO | undefined> {
    const result = await this.db.excecuteNameQuery("getSesionPorId", {
      usuario_id,
      sesion_id,
    });
    return result?.[0] || result;
  }

  async getSiguienteSesionEnMundo(
    mundo_id: string,
    siguiente_orden: number,
  ): Promise<{ id: string; orden: number } | undefined> {
    const result = await this.db.excecuteNameQuery(
      "getSiguienteSesionEnMundo",
      {
        mundo_id,
        siguiente_orden,
      },
    );
    return result?.[0] || result;
  }

  // ==========================================================================
  // PROGRESO Y DESBLOQUEO DE NIVELES
  // ==========================================================================

  async upsertProgresoCompletado(
    datos: CompletarSesionInput,
  ): Promise<ProgresoUsuarioDTO> {
    const result = await this.db.excecuteNameQuery(
      "upsertProgresoCompletado",
      datos,
    );
    return result?.[0] || result;
  }

  async desbloquearSiguienteSesion(
    usuario_id: string,
    siguiente_sesion_id: string,
  ): Promise<{ id: string; sesion_id: string; estado: string }> {
    const result = await this.db.excecuteNameQuery(
      "desbloquearSiguienteSesion",
      {
        usuario_id,
        siguiente_sesion_id,
      },
    );
    return result?.[0] || result;
  }

  async registrarIntentoFallido(
    usuario_id: string,
    sesion_id: string,
  ): Promise<{
    id: string;
    sesion_id: string;
    estado: string;
    intentos: number;
  }> {
    const result = await this.db.excecuteNameQuery("registrarIntentoFallido", {
      usuario_id,
      sesion_id,
    });
    return result?.[0] || result;
  }

  // ==========================================================================
  // JEFE FINAL (EL BUG SUPREMO)
  // ==========================================================================

  async getRetosJefeFinal(): Promise<RetoJefeFinalDTO[]> {
    const result = await this.db.excecuteNameQuery("getRetosJefeFinal", {});
    return Array.isArray(result) ? result : [];
  }

  // ==========================================================================
  // COMENTARIOS DE SESIÓN
  // ==========================================================================
  // ==========================================================================

  async getComentariosPorSesion(
    sesion_id: string,
  ): Promise<ComentarioSesionDTO[]> {
    const result = await this.db.excecuteNameQuery("getComentariosPorSesion", {
      sesion_id,
    });
    return Array.isArray(result) ? result : [];
  }

  async crearComentarioSesion(datos: CrearComentarioInput): Promise<{
    id: string;
    sesion_id: string;
    usuario_id: string;
    contenido: string;
    creado_en: Date;
  }> {
    const result = await this.db.excecuteNameQuery(
      "crearComentarioSesion",
      datos,
    );
    return result?.[0] || result;
  }

  async actualizarProgresoGamificacion(
    datos: ActualizarProgresoGamificacionDTO,
  ): Promise<{
    id: string;
    nombre_usuario: string;
    xp_total: number;
    nivel_actual: number;
    jefe_final_derrotado: boolean;
  }> {
    const result = await this.db.excecuteNameQuery(
      "actualizarProgresoGamificacion",
      datos,
    );
    return result?.[0] || result;
  }
}

export default new GamificacionRepository();
