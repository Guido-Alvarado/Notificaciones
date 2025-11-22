
import pool from "../config/db.js";

// Obtener todas las cuotas
export const obtenerCuotas = async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT 
                c.*, 
                u.nombre, u.apellido, u.dni,
                cu.nombre as curso_nombre
            FROM cuotas c
            JOIN alumnos a ON c.alumno_id = a.id
            JOIN usuarios u ON a.id = u.id
            JOIN cursos cu ON a.curso_id = cu.id
            ORDER BY c.fecha_vencimiento DESC
        `);
        return res.json(rows);
    } catch (error) {
        console.error("[ERROR obtenerCuotas]", error);
        return res.status(500).json({ error: "Error al obtener cuotas" });
    }
};

// Obtener cuotas de un alumno
export const obtenerCuotasAlumno = async (req, res) => {
    try {
        const { alumno_id } = req.params;
        
        const [rows] = await pool.query(
            `SELECT * FROM cuotas 
             WHERE alumno_id = ? 
             ORDER BY fecha_vencimiento DESC`,
            [alumno_id]
        );
        
        return res.json(rows);
    } catch (error) {
        console.error("[ERROR obtenerCuotasAlumno]", error);
        return res.status(500).json({ error: "Error al obtener cuotas del alumno" });
    }
};

// Obtener alumnos con deuda (usando la vista)
export const obtenerAlumnosConDeuda = async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT * FROM vista_deudas
            ORDER BY meses_deuda DESC, primer_vencimiento ASC
        `);
        return res.json(rows);
    } catch (error) {
        console.error("[ERROR obtenerAlumnosConDeuda]", error);
        return res.status(500).json({ error: "Error al obtener alumnos con deuda" });
    }
};

// Crear cuota
export const crearCuota = async (req, res) => {
    try {
        const { alumno_id, mes, anio, monto, fecha_vencimiento } = req.body;

        if (!alumno_id || !mes || !anio || !monto || !fecha_vencimiento) {
            return res.status(400).json({ error: "Faltan datos obligatorios" });
        }

        const [result] = await pool.query(
            `INSERT INTO cuotas (alumno_id, mes, anio, monto, fecha_vencimiento, pagado)
             VALUES (?, ?, ?, ?, ?, FALSE)`,
            [alumno_id, mes, anio, monto, fecha_vencimiento]
        );

        return res.json({
            success: true,
            message: "Cuota creada correctamente",
            id: result.insertId
        });
    } catch (error) {
        console.error("[ERROR crearCuota]", error);
        return res.status(500).json({ error: "Error al crear cuota" });
    }
};

// Registrar pago de cuota
export const registrarPago = async (req, res) => {
    try {
        const { id } = req.params;
        const { fecha_pago } = req.body;

        const [result] = await pool.query(
            `UPDATE cuotas 
             SET pagado = TRUE, fecha_pago = ?
             WHERE id = ?`,
            [fecha_pago || new Date(), id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Cuota no encontrada" });
        }

        return res.json({
            success: true,
            message: "Pago registrado correctamente"
        });
    } catch (error) {
        console.error("[ERROR registrarPago]", error);
        return res.status(500).json({ error: "Error al registrar pago" });
    }
};

// Generar cuotas para un alumno (varios meses)
export const generarCuotasAlumno = async (req, res) => {
    try {
        const { alumno_id, monto, meses } = req.body;

        if (!alumno_id || !monto || !meses || meses.length === 0) {
            return res.status(400).json({ error: "Faltan datos obligatorios" });
        }

        const values = meses.map(m => [
            alumno_id, 
            m.mes, 
            m.anio, 
            monto, 
            m.fecha_vencimiento, 
            false
        ]);

        const [result] = await pool.query(
            `INSERT INTO cuotas (alumno_id, mes, anio, monto, fecha_vencimiento, pagado)
             VALUES ?`,
            [values]
        );

        return res.json({
            success: true,
            message: `${meses.length} cuotas generadas correctamente`
        });
    } catch (error) {
        console.error("[ERROR generarCuotasAlumno]", error);
        return res.status(500).json({ error: "Error al generar cuotas" });
    }
};
