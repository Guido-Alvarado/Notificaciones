import express from "express";
import { listarAlumnosNoAsignados, listarCursos, registrarAlumno } from "../controllers/alumno_controller.js";
import { authMiddleware, requireAdminOrMod } from "../middleware/auth_middleware.js";

const router = express.Router();

router.get("/no-asignados", authMiddleware, requireAdminOrMod, listarAlumnosNoAsignados);

router.get("/cursos-disponibles", authMiddleware, requireAdminOrMod, listarCursos);

router.post("/registrar", authMiddleware, requireAdminOrMod, registrarAlumno);

export default router;
