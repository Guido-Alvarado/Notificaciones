import express from "express";
import { crearUsuario } from "../controllers/user_controller.js";
import { authMiddleware, requireAdminOrMod } from "../middleware/auth_middleware.js";

const router = express.Router();

router.post("/crear", authMiddleware, requireAdminOrMod, crearUsuario);

export default router;