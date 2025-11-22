
import express from "express";
import {
    enviarNotificacion,
    enviarNotificacionesMasivas,
    obtenerHistorialNotificaciones,
    verificarYEnviarAutomaticas
} from "../controllers/notificacion_controller.js";
import { authMiddleware, requireAdminOrMod } from "../middleware/auth_middleware.js";

const router = express.Router();

router.post("/enviar", authMiddleware, requireAdminOrMod, enviarNotificacion);
router.post("/enviar-masivas", authMiddleware, requireAdminOrMod, enviarNotificacionesMasivas);
router.get("/historial", authMiddleware, obtenerHistorialNotificaciones);
router.post("/verificar-automaticas", verificarYEnviarAutomaticas); // Para cron job

export default router;
