import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth_routes.js";
import userRoutes from "./routes/user_routes.js";
import alumnosRoutes from "./routes/alumnos_routes.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/usuarios", userRoutes);
app.use("/alumnos", alumnosRoutes);

app.listen(process.env.PORT || 4000, () => {
    console.log("Servidor corriendo en puerto 4000");
});
