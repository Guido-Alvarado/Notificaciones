import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cron from "node-cron";

// Importar rutas
import authRoutes from "./routes/auth_routes.js";
import userRoutes from "./routes/user_routes.js";
import plantillaRoutes from "./routes/plantilla_routes.js";
import cursoRoutes from "./routes/curso_routes.js";
import cuotaRoutes from "./routes/cuota_routes.js";
import notificacionRoutes from "./routes/notificacion_routes.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Registrar rutas
app.use("/auth", authRoutes);
app.use("/usuarios", userRoutes);
app.use("/plantillas", plantillaRoutes);
app.use("/academico", cursoRoutes);
app.use("/cuotas", cuotaRoutes);
app.use("/notificaciones", notificacionRoutes);

// Ruta de prueba
app.get("/", (req, res) => {
    res.json({ 
        message: "Sistema de Notificaciones - ISDM", 
        version: "1.0.0",
        status: "running" 
    });
});

// Programar tarea automática diaria a las 9:00 AM
cron.schedule('0 9 * * *', async () => {
    console.log('[CRON] Ejecutando verificación automática de notificaciones...');
    try {
        const response = await fetch('http://localhost:4000/notificaciones/verificar-automaticas', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });
        const data = await response.json();
        console.log('[CRON] Resultado:', data);
    } catch (error) {
        console.error('[CRON] Error:', error);
    }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`✓ Servidor corriendo en puerto ${PORT}`);
    console.log(`✓ Sistema de notificaciones activo`);
    console.log(`✓ Verificación automática programada para las 9:00 AM diariamente`);
});
