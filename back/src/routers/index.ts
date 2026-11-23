import Router from "express";
import authRoutes from "./auth.routes.js";
import gamificacionRoutes from "./Gamificacion.routes.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/gamificacion", gamificacionRoutes);

export default router;
