
import express from "express";
import {
    obtenerPlantillas,
    obtenerPlantillaPorId,
    crearPlantilla,
    actualizarPlantilla,
    eliminarPlantilla
} from "../controllers/plantilla_controller.js";
import { authMiddleware, requireAdminOrMod } from "../middleware/auth_middleware.js";

const router = express.Router();

router.get("/", authMiddleware, obtenerPlantillas);
router.get("/:id", authMiddleware, obtenerPlantillaPorId);
router.post("/", authMiddleware, requireAdminOrMod, crearPlantilla);
router.put("/:id", authMiddleware, requireAdminOrMod, actualizarPlantilla);
router.delete("/:id", authMiddleware, requireAdminOrMod, eliminarPlantilla);

export default router;
