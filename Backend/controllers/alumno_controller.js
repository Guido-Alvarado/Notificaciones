import pool from "../config/db.js";


export const listarAlumnosNoAsignados = async (req, res) => {
    try {
        const [rows] = await pool.query(
            `SELECT id, nombre, apellido, dni
             FROM usuarios
             WHERE rol_id = 3 AND id NOT IN (SELECT cursado_id FROM alumnos)`
        );
        res.json(rows);
    } catch (error) {
        console.error("[ERROR listarAlumnosNoAsignados]", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
};


export const listarCursos = async (req, res) => {
    try {
        const [rows] = await pool.query(
            "SELECT id, nombre FROM cursos WHERE activo = 1"
        );
        res.json(rows);
    } catch (error) {
        console.error("[ERROR listarCursos]", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
};


export const registrarAlumno = async (req, res) => {
    const { alumno_id, curso_id } = req.body;
    if (!alumno_id || !curso_id) return res.status(400).json({ error: "Faltan datos" });

    try {
        await pool.query(
            "INSERT INTO alumnos (usuario_id, cursado_id, fecha_inscripcion) VALUES (?, ?, NOW())",
            [alumno_id, curso_id]
        );
        res.json({ success: true, message: "Alumno registrado en el curso" });
    } catch (error) {
        console.error("[ERROR registrarAlumno]", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
};
