import pool from "../config/db.js";
import bcrypt from "bcryptjs";

export const crearUsuario = async (req, res) => {
    try {
        const { nombre, apellido, dni, email, username, password, telefono, rol_id } = req.body;

        if (!nombre || !apellido || !dni || !email || !username || !password) {
            return res.status(400).json({ error: "Faltan datos obligatorios" });
        }

        const [dniExiste] = await pool.query(
            "SELECT dni FROM usuarios WHERE dni = ?",
            [dni]
        );
        if (dniExiste.length > 0) {
            return res.status(400).json({ error: "El DNI ya está registrado" });
        }

        const [emailExiste] = await pool.query(
            "SELECT email FROM usuarios WHERE email = ?",
            [email]
        );
        if (emailExiste.length > 0) {
            return res.status(400).json({ error: "El email ya está registrado" });
        }

        const [userExiste] = await pool.query(
            "SELECT username FROM usuarios WHERE username = ?",
            [username]
        );
        if (userExiste.length > 0) {
            return res.status(400).json({ error: "El nombre de usuario ya existe" });
        }

        const hash = await bcrypt.hash(password, 10);

        const [result] = await pool.query(
            `INSERT INTO usuarios 
                (nombre, apellido, dni, email, username, password_hash, telefono, rol_id)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [nombre, apellido, dni, email, username, hash, telefono || null, rol_id]
        );

        return res.json({
            success: true,
            message: "Usuario creado correctamente",
            user: {
                id: result.insertId,
                nombre,
                apellido,
                dni,
                email,
                username,
                telefono,
                rol_id
            }
        });

    } catch (error) {
        console.error("[ERROR crearUsuario]", error);
        return res.status(500).json({ error: "Error interno del servidor" });
    }
};
