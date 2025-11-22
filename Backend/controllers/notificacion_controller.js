
import pool from "../config/db.js";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Función para reemplazar tokens en la plantilla
const reemplazarTokens = (texto, datos) => {
    return texto
        .replace(/\{\{nombre\}\}/g, datos.nombre || '')
        .replace(/\{\{apellido\}\}/g, datos.apellido || '')
        .replace(/\{\{dni\}\}/g, datos.dni || '')
        .replace(/\{\{meses_deuda\}\}/g, datos.meses_deuda || '')
        .replace(/\{\{importe_total\}\}/g, datos.importe_total || '')
        .replace(/\{\{vencimiento_min\}\}/g, datos.vencimiento_min || '');
};

// Enviar notificación individual
export const enviarNotificacion = async (req, res) => {
    try {
        const { alumno_id, plantilla_id, medio } = req.body;

        if (!alumno_id || !plantilla_id || !medio) {
            return res.status(400).json({ error: "Faltan datos obligatorios" });
        }

        // Obtener datos del alumno
        const [alumno] = await pool.query(`
            SELECT u.*, a.curso_id
            FROM usuarios u
            JOIN alumnos a ON u.id = a.id
            WHERE u.id = ?
        `, [alumno_id]);

        if (alumno.length === 0) {
            return res.status(404).json({ error: "Alumno no encontrado" });
        }

        // Obtener plantilla
        const [plantilla] = await pool.query(
            "SELECT * FROM plantillas_mensajes WHERE id = ? AND activo = TRUE",
            [plantilla_id]
        );

        if (plantilla.length === 0) {
            return res.status(404).json({ error: "Plantilla no encontrada o inactiva" });
        }

        // Obtener deuda del alumno
        const [deuda] = await pool.query(`
            SELECT 
                COUNT(*) as meses_deuda,
                SUM(monto) as importe_total,
                MIN(fecha_vencimiento) as vencimiento_min
            FROM cuotas
            WHERE alumno_id = ? AND pagado = FALSE
        `, [alumno_id]);

        const datosAlumno = {
            ...alumno[0],
            meses_deuda: deuda[0].meses_deuda || 0,
            importe_total: deuda[0].importe_total || 0,
            vencimiento_min: deuda[0].vencimiento_min
        };

        // Reemplazar tokens en el mensaje
        const titulo = reemplazarTokens(plantilla[0].titulo || '', datosAlumno);
        const cuerpo = reemplazarTokens(plantilla[0].cuerpo, datosAlumno);

        let exito = false;
        let detalleError = null;
        let referenciaExterna = null;

        // Enviar según el medio
        switch(medio) {
            case 'email':
                try {
                    if (!process.env.EMAIL_USER) {
                        console.log("[SIMULADO] Email a:", datosAlumno.email);
                        console.log("[SIMULADO] Título:", titulo);
                        console.log("[SIMULADO] Cuerpo:", cuerpo);
                        exito = true;
                        referenciaExterna = `SIM-${Date.now()}`;
                    } else {
                        const info = await transporter.sendMail({
                            from: process.env.EMAIL_USER,
                            to: datosAlumno.email,
                            subject: titulo,
                            text: cuerpo,
                            html: `<p>${cuerpo.replace(/\n/g, '<br>')}</p>`
                        });
                        exito = true;
                        referenciaExterna = info.messageId;
                    }
                } catch (err) {
                    detalleError = err.message;
                    console.error("[ERROR envío email]", err);
                }
                break;

            case 'whatsapp':
                // Simulación de WhatsApp (requiere API de WhatsApp Business)
                console.log("[SIMULADO] WhatsApp a:", datosAlumno.telefono);
                console.log("[SIMULADO] Mensaje:", cuerpo);
                exito = true;
                referenciaExterna = `WA-${Date.now()}`;
                break;

            case 'push':
                // Simulación de push notification
                console.log("[SIMULADO] Push a alumno:", alumno_id);
                console.log("[SIMULADO] Mensaje:", cuerpo);
                exito = true;
                referenciaExterna = `PUSH-${Date.now()}`;
                break;

            default:
                return res.status(400).json({ error: "Medio no válido" });
        }

        // Registrar en historial
        await pool.query(
            `INSERT INTO notificaciones_enviadas 
             (alumno_id, plantilla_id, medio, exito, detalle_error, referencia_externa)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [alumno_id, plantilla_id, medio, exito, detalleError, referenciaExterna]
        );

        return res.json({
            success: true,
            message: exito ? "Notificación enviada correctamente" : "Error al enviar notificación",
            exito,
            referencia: referenciaExterna
        });

    } catch (error) {
        console.error("[ERROR enviarNotificacion]", error);
        return res.status(500).json({ error: "Error al enviar notificación" });
    }
};

// Enviar notificaciones masivas
export const enviarNotificacionesMasivas = async (req, res) => {
    try {
        const { plantilla_id, medio, criterio } = req.body;

        if (!plantilla_id || !medio) {
            return res.status(400).json({ error: "Faltan datos obligatorios" });
        }

        // Determinar alumnos según criterio
        let query = `
            SELECT DISTINCT u.id as alumno_id
            FROM usuarios u
            JOIN alumnos a ON u.id = a.id
            WHERE u.rol_id = 3 AND u.activo = TRUE
        `;

        if (criterio?.meses_deuda) {
            query += ` AND u.id IN (
                SELECT alumno_id FROM cuotas 
                WHERE pagado = FALSE 
                GROUP BY alumno_id 
                HAVING COUNT(*) >= ${criterio.meses_deuda}
            )`;
        }

        const [alumnos] = await pool.query(query);

        let enviados = 0;
        let errores = 0;

        for (const alumno of alumnos) {
            try {
                // Reutilizar la función de envío individual
                await enviarNotificacionInterno(alumno.alumno_id, plantilla_id, medio);
                enviados++;
            } catch (err) {
                console.error(`Error enviando a alumno ${alumno.alumno_id}:`, err);
                errores++;
            }
        }

        return res.json({
            success: true,
            message: `Notificaciones enviadas: ${enviados}, Errores: ${errores}`,
            enviados,
            errores
        });

    } catch (error) {
        console.error("[ERROR enviarNotificacionesMasivas]", error);
        return res.status(500).json({ error: "Error al enviar notificaciones masivas" });
    }
};

// Función interna para envío (sin respuesta HTTP)
async function enviarNotificacionInterno(alumno_id, plantilla_id, medio) {
    const [alumno] = await pool.query(`
        SELECT u.* FROM usuarios u
        JOIN alumnos a ON u.id = a.id
        WHERE u.id = ?
    `, [alumno_id]);

    const [plantilla] = await pool.query(
        "SELECT * FROM plantillas_mensajes WHERE id = ?",
        [plantilla_id]
    );

    const [deuda] = await pool.query(`
        SELECT COUNT(*) as meses_deuda, SUM(monto) as importe_total,
               MIN(fecha_vencimiento) as vencimiento_min
        FROM cuotas WHERE alumno_id = ? AND pagado = FALSE
    `, [alumno_id]);

    const datosAlumno = {
        ...alumno[0],
        meses_deuda: deuda[0].meses_deuda,
        importe_total: deuda[0].importe_total,
        vencimiento_min: deuda[0].vencimiento_min
    };

    const cuerpo = reemplazarTokens(plantilla[0].cuerpo, datosAlumno);

    let exito = true;
    let referenciaExterna = `${medio.toUpperCase()}-${Date.now()}`;

    console.log(`[SIMULADO] ${medio} a:`, datosAlumno.email || datosAlumno.telefono);

    await pool.query(
        `INSERT INTO notificaciones_enviadas 
         (alumno_id, plantilla_id, medio, exito, referencia_externa)
         VALUES (?, ?, ?, ?, ?)`,
        [alumno_id, plantilla_id, medio, exito, referenciaExterna]
    );
}

// Obtener historial de notificaciones
export const obtenerHistorialNotificaciones = async (req, res) => {
    try {
        const { alumno_id } = req.query;

        let query = `
            SELECT 
                n.*,
                u.nombre, u.apellido, u.email,
                p.titulo as plantilla_titulo
            FROM notificaciones_enviadas n
            JOIN usuarios u ON n.alumno_id = u.id
            LEFT JOIN plantillas_mensajes p ON n.plantilla_id = p.id
        `;

        const params = [];
        if (alumno_id) {
            query += " WHERE n.alumno_id = ?";
            params.push(alumno_id);
        }

        query += " ORDER BY n.fecha_envio DESC LIMIT 100";

        const [rows] = await pool.query(query, params);
        return res.json(rows);
    } catch (error) {
        console.error("[ERROR obtenerHistorialNotificaciones]", error);
        return res.status(500).json({ error: "Error al obtener historial" });
    }
};

// Verificar y enviar notificaciones automáticas (para cron job)
export const verificarYEnviarAutomaticas = async (req, res) => {
    try {
        // Obtener configuraciones activas
        const [configs] = await pool.query(`
            SELECT * FROM configuracion_notificaciones
            WHERE activo = TRUE
        `);

        let totalEnviados = 0;

        for (const config of configs) {
            // Obtener alumnos con esa cantidad de meses de deuda
            const [alumnos] = await pool.query(`
                SELECT 
                    u.id as alumno_id,
                    COUNT(*) as meses_deuda
                FROM usuarios u
                JOIN alumnos a ON u.id = a.id
                JOIN cuotas c ON a.id = c.alumno_id
                WHERE c.pagado = FALSE AND u.activo = TRUE
                GROUP BY u.id
                HAVING meses_deuda = ?
            `, [config.meses_deuda]);

            // Buscar plantilla apropiada
            const [plantillas] = await pool.query(`
                SELECT id, tipo FROM plantillas_mensajes
                WHERE activo = TRUE
                ORDER BY fecha_creacion DESC
                LIMIT 1
            `);

            if (plantillas.length === 0) continue;

            for (const alumno of alumnos) {
                // Enviar según canales configurados
                if (config.enviar_email) {
                    await enviarNotificacionInterno(alumno.alumno_id, plantillas[0].id, 'email');
                    totalEnviados++;
                }
                if (config.enviar_whatsapp) {
                    await enviarNotificacionInterno(alumno.alumno_id, plantillas[0].id, 'whatsapp');
                    totalEnviados++;
                }
                if (config.enviar_push) {
                    await enviarNotificacionInterno(alumno.alumno_id, plantillas[0].id, 'push');
                    totalEnviados++;
                }
            }
        }

        return res.json({
            success: true,
            message: `Verificación completada. ${totalEnviados} notificaciones enviadas`
        });

    } catch (error) {
        console.error("[ERROR verificarYEnviarAutomaticas]", error);
        return res.status(500).json({ error: "Error en verificación automática" });
    }
};
