
import express from "express";
import {
    obtenerCursos,
    crearCurso,
    obtenerCursados,
    crearCursado,
    obtenerAlumnos,
    inscribirAlumno
} from "../controllers/curso_controller.js";
import { authMiddleware, requireAdminOrMod } from "../middleware/auth_middleware.js";

const router = express.Router();

router.get("/cursos", authMiddleware, obtenerCursos);
router.post("/cursos", authMiddleware, requireAdminOrMod, crearCurso);
router.get("/cursados", authMiddleware, obtenerCursados);
router.post("/cursados", authMiddleware, requireAdminOrMod, crearCursado);
router.get("/alumnos", authMiddleware, obtenerAlumnos);
router.post("/alumnos/inscribir", authMiddleware, requireAdminOrMod, inscribirAlumno);

export default router;
