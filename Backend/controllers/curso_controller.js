
import pool from "../config/db.js";

// Obtener todos los cursos
export const obtenerCursos = async (req, res) => {
    try {
        const [rows] = await pool.query("SELECT * FROM cursos ORDER BY nombre");
        return res.json(rows);
    } catch (error) {
        console.error("[ERROR obtenerCursos]", error);
        return res.status(500).json({ error: "Error al obtener cursos" });
    }
};

// Crear curso
export const crearCurso = async (req, res) => {
    try {
        const { nombre, descripcion } = req.body;

        if (!nombre) {
            return res.status(400).json({ error: "El nombre es obligatorio" });
        }

        const [result] = await pool.query(
            "INSERT INTO cursos (nombre, descripcion, activo) VALUES (?, ?, TRUE)",
            [nombre, descripcion]
        );

        return res.json({
            success: true,
            message: "Curso creado correctamente",
            id: result.insertId
        });
    } catch (error) {
        console.error("[ERROR crearCurso]", error);
        return res.status(500).json({ error: "Error al crear curso" });
    }
};

// Obtener cursados por curso
export const obtenerCursados = async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT c.*, cu.nombre as curso_nombre
            FROM cursados c
            JOIN cursos cu ON c.curso_id = cu.id
            ORDER BY c.fecha_inicio DESC
        `);
        return res.json(rows);
    } catch (error) {
        console.error("[ERROR obtenerCursados]", error);
        return res.status(500).json({ error: "Error al obtener cursados" });
    }
};

// Crear cursado
export const crearCursado = async (req, res) => {
    try {
        const { curso_id, nombre, fecha_inicio, fecha_fin } = req.body;

        if (!curso_id || !nombre) {
            return res.status(400).json({ error: "Faltan datos obligatorios" });
        }

        const [result] = await pool.query(
            `INSERT INTO cursados (curso_id, nombre, fecha_inicio, fecha_fin, activo)
             VALUES (?, ?, ?, ?, TRUE)`,
            [curso_id, nombre, fecha_inicio, fecha_fin]
        );

        return res.json({
            success: true,
            message: "Cursado creado correctamente",
            id: result.insertId
        });
    } catch (error) {
        console.error("[ERROR crearCursado]", error);
        return res.status(500).json({ error: "Error al crear cursado" });
    }
};

// Obtener alumnos
export const obtenerAlumnos = async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT 
                u.id, u.nombre, u.apellido, u.dni, u.email, u.telefono,
                a.curso_id, a.cursado_id, a.fecha_inscripcion,
                c.nombre as curso_nombre,
                cu.nombre as cursado_nombre
            FROM usuarios u
            JOIN alumnos a ON u.id = a.id
            JOIN cursos c ON a.curso_id = c.id
            JOIN cursados cu ON a.cursado_id = cu.id
            WHERE u.rol_id = 3 AND u.activo = TRUE
            ORDER BY u.apellido, u.nombre
        `);
        return res.json(rows);
    } catch (error) {
        console.error("[ERROR obtenerAlumnos]", error);
        return res.status(500).json({ error: "Error al obtener alumnos" });
    }
};

// Inscribir alumno a curso
export const inscribirAlumno = async (req, res) => {
    try {
        const { usuario_id, curso_id, cursado_id, fecha_inscripcion } = req.body;

        if (!usuario_id || !curso_id || !cursado_id) {
            return res.status(400).json({ error: "Faltan datos obligatorios" });
        }

        // Verificar que el usuario sea alumno
        const [user] = await pool.query(
            "SELECT rol_id FROM usuarios WHERE id = ?",
            [usuario_id]
        );

        if (user.length === 0 || user[0].rol_id !== 3) {
            return res.status(400).json({ error: "El usuario no es un alumno válido" });
        }

        const [result] = await pool.query(
            `INSERT INTO alumnos (id, curso_id, cursado_id, fecha_inscripcion)
             VALUES (?, ?, ?, ?)`,
            [usuario_id, curso_id, cursado_id, fecha_inscripcion || new Date()]
        );

        return res.json({
            success: true,
            message: "Alumno inscrito correctamente"
        });
    } catch (error) {
        console.error("[ERROR inscribirAlumno]", error);
        return res.status(500).json({ error: "Error al inscribir alumno" });
    }
};
