
import express from "express";
import {
    obtenerCuotas,
    obtenerCuotasAlumno,
    obtenerAlumnosConDeuda,
    crearCuota,
    registrarPago,
    generarCuotasAlumno
} from "../controllers/cuota_controller.js";
import { authMiddleware, requireAdminOrMod } from "../middleware/auth_middleware.js";

const router = express.Router();

router.get("/", authMiddleware, obtenerCuotas);
router.get("/alumno/:alumno_id", authMiddleware, obtenerCuotasAlumno);
router.get("/deudas", authMiddleware, obtenerAlumnosConDeuda);
router.post("/", authMiddleware, requireAdminOrMod, crearCuota);
router.post("/generar", authMiddleware, requireAdminOrMod, generarCuotasAlumno);
router.put("/:id/pagar", authMiddleware, requireAdminOrMod, registrarPago);

export default router;
