import zod from "zod";

class ValidatorGamificacion {
  constructor() {}

  validateMundoId(mundoId: string) {
    const mundoIdSchema = zod
      .string()
      .uuid("El ID del mundo debe ser un UUID válido");
    return mundoIdSchema.safeParse(mundoId);
  }

  validateSesionId(sesionId: string) {
    const sesionIdSchema = zod
      .string()
      .uuid("El ID de la sesión debe ser un UUID válido");
    return sesionIdSchema.safeParse(sesionId);
  }

  validateUuid(uuid: string) {
    const uuidSchema = zod.string().uuid("El valor debe ser un UUID válido");
    return uuidSchema.safeParse(uuid);
  }

  validateCompletarSesion(payload: unknown) {
    const schema = zod.object({
      sesionId: zod.string().uuid("El ID de la sesión debe ser un UUID válido"),
      aprobado: zod.boolean(),
      puntaje_obtenido: zod.number().min(0).max(100).optional(),
    });
    return schema.safeParse(payload);
  }

  validateComentario(payload: unknown) {
    const schema = zod.object({
      sesionId: zod.string().uuid("El ID de la sesión debe ser un UUID válido"),
      contenido: zod
        .string()
        .min(2, "El comentario es muy corto")
        .max(500, "El comentario excede el máximo de 500 caracteres"),
    });
    return schema.safeParse(payload);
  }
}

export default new ValidatorGamificacion();
