
import pool from "../config/db.js";

// Obtener todas las plantillas
export const obtenerPlantillas = async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT p.*, u.nombre, u.apellido 
            FROM plantillas_mensajes p
            LEFT JOIN usuarios u ON p.creador_id = u.id
            ORDER BY p.fecha_creacion DESC
        `);
        return res.json(rows);
    } catch (error) {
        console.error("[ERROR obtenerPlantillas]", error);
        return res.status(500).json({ error: "Error al obtener plantillas" });
    }
};

// Obtener plantilla por ID
export const obtenerPlantillaPorId = async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await pool.query(
            "SELECT * FROM plantillas_mensajes WHERE id = ?",
            [id]
        );
        
        if (rows.length === 0) {
            return res.status(404).json({ error: "Plantilla no encontrada" });
        }
        
        return res.json(rows[0]);
    } catch (error) {
        console.error("[ERROR obtenerPlantillaPorId]", error);
        return res.status(500).json({ error: "Error al obtener plantilla" });
    }
};

// Crear plantilla
export const crearPlantilla = async (req, res) => {
    try {
        const { titulo, cuerpo, tipo } = req.body;
        const creador_id = req.user.id;

        if (!cuerpo || !tipo) {
            return res.status(400).json({ error: "Faltan datos obligatorios (cuerpo, tipo)" });
        }

        if (!['email', 'whatsapp', 'push'].includes(tipo)) {
            return res.status(400).json({ error: "Tipo inválido. Use: email, whatsapp, push" });
        }

        const [result] = await pool.query(
            `INSERT INTO plantillas_mensajes (titulo, cuerpo, tipo, creador_id, activo)
             VALUES (?, ?, ?, ?, TRUE)`,
            [titulo, cuerpo, tipo, creador_id]
        );

        return res.json({
            success: true,
            message: "Plantilla creada correctamente",
            id: result.insertId
        });
    } catch (error) {
        console.error("[ERROR crearPlantilla]", error);
        return res.status(500).json({ error: "Error al crear plantilla" });
    }
};

// Actualizar plantilla
export const actualizarPlantilla = async (req, res) => {
    try {
        const { id } = req.params;
        const { titulo, cuerpo, tipo, activo } = req.body;

        const [result] = await pool.query(
            `UPDATE plantillas_mensajes 
             SET titulo = ?, cuerpo = ?, tipo = ?, activo = ?
             WHERE id = ?`,
            [titulo, cuerpo, tipo, activo, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Plantilla no encontrada" });
        }

        return res.json({ success: true, message: "Plantilla actualizada" });
    } catch (error) {
        console.error("[ERROR actualizarPlantilla]", error);
        return res.status(500).json({ error: "Error al actualizar plantilla" });
    }
};

// Eliminar plantilla
export const eliminarPlantilla = async (req, res) => {
    try {
        const { id } = req.params;
        
        const [result] = await pool.query(
            "DELETE FROM plantillas_mensajes WHERE id = ?",
            [id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Plantilla no encontrada" });
        }

        return res.json({ success: true, message: "Plantilla eliminada" });
    } catch (error) {
        console.error("[ERROR eliminarPlantilla]", error);
        return res.status(500).json({ error: "Error al eliminar plantilla" });
    }
};
