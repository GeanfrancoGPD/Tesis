import { Router } from "express";
import GamificacionController from "../controllers/GamificacionBO";
import { authMiddleware } from "../middlewares/AuthMiddleware";

const router = Router();
// ========================================================================
// MUNDOS Y MAPA DE NIVELES
// ========================================================================
router.get("/mundos", authMiddleware, (req, res) =>
  GamificacionController.getMundos(req, res),
);

router.get("/mundos/:mundoId/sesiones", authMiddleware, (req, res) =>
  GamificacionController.getSesionesPorMundo(req, res),
);

// ========================================================================
// SESIONES Y PROGRESO / GAMIFICACIÓN
// ========================================================================
router.get("/sesiones/:sesionId", authMiddleware, (req, res) =>
  GamificacionController.getSesionDetalle(req, res),
);

router.post("/sesiones/:sesionId/completar", authMiddleware, (req, res) =>
  GamificacionController.completarSesion(req, res),
);

// ========================================================================
// JEFE FINAL (EL BUG SUPREMO)
// ========================================================================
router.get("/jefe-final", authMiddleware, (req, res) =>
  GamificacionController.getJefeFinal(req, res),
);

router.post("/jefe-final/completar", authMiddleware, (req, res) =>
  GamificacionController.completarJefeFinal(req, res),
);

// ========================================================================
// COMENTARIOS POR SESIÓN
// ========================================================================
router.get("/sesiones/:sesionId/comentarios", authMiddleware, (req, res) =>
  GamificacionController.getComentarios(req, res),
);

router.post("/sesiones/:sesionId/comentarios", authMiddleware, (req, res) =>
  GamificacionController.crearComentario(req, res),
);

export default router;
