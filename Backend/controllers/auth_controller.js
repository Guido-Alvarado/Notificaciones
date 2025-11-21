import db from "../config/db.js";
import bcrypt from "bcryptjs"; 
import jwt from "jsonwebtoken";

export const login = async (req, res) => {
  try {
    console.log("[AUTH] /login body:", req.body);

    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ ok: false, error: "Faltan username o password" });
    }

    const [rows] = await db.query(
      "SELECT id, nombre, apellido, username, password_hash, rol_id, activo FROM usuarios WHERE username = ? OR email = ? LIMIT 1",
      [username, username]
    );

    if (!rows || rows.length === 0) {
      console.log("[AUTH] usuario no encontrado:", username);
      return res.status(401).json({ ok: false, error: "Usuario no encontrado" });
    }

    const user = rows[0];

    if (!user.password_hash) {
      console.log("[AUTH] usuario sin password_hash:", user);
      return res.status(500).json({ ok: false, error: "Usuario no tiene contraseña configurada" });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      console.log("[AUTH] contraseña incorrecta para:", username);
      return res.status(401).json({ ok: false, error: "Contraseña incorrecta" });
    }

    if (user.activo == 0) {
      return res.status(403).json({ ok: false, error: "Usuario inactivo" });
    }

    const token = jwt.sign(
      { id: user.id, rol_id: user.rol_id },
      process.env.JWT_SECRET,
      { expiresIn: "8h" }
    );

    return res.json({
      ok: true,
      usuario: {
        id: user.id,
        nombre: user.nombre,
        apellido: user.apellido,
        username: user.username,
        rol_id: user.rol_id
      },
      token
    });

  } catch (err) {
    console.error("[AUTH] error interno:", err);
    return res.status(500).json({ ok: false, error: "Error interno del servidor" });
  }
};
