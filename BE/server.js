require('dotenv').config();

const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');

const app = express();
app.use(cors());
app.use(express.json());

// Config DB
const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_USER = process.env.DB_USER || 'root';
const DB_PASSWORD = process.env.DB_PASSWORD;
const DB_DATABASE = process.env.DB_DATABASE || 'notificaciones';

let pool;
async function initDB(){
  pool = await mysql.createPool({
    host: DB_HOST,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_DATABASE,
    connectionLimit: 10,
    charset: 'utf8mb4'
  });
  console.log('✅ Conectado a MySQL (DB:', DB_DATABASE, ')');
}
initDB().catch(err => {
  console.error('❌ Error al conectar MySQL:', err);
  process.exit(1);
});

// Utilidad: obtener alumnoId desde headers o usar 1 por defecto
function getAlumnoId(req){
  // Si envías X-User-Id con el Id numérico del alumno, lo usamos
  const fromHeader = Number(req.headers['x-user-id']);
  return Number.isInteger(fromHeader) ? fromHeader : 1; // default Alumno.Id = 1
}

// ========== AUTH DEMO (opcional) ==========
app.post('/api/login', async (req, res) => {
  // No usamos tablas de auth reales aquí; devolvemos un "rol" para frontend
  const { username } = req.body;
  const role = (username || '').includes('admin') ? 'admin' : 'alumno';
  // Para alumno elegimos Id=1 por defecto. Cambia según tus datos reales
  const userId = role === 'alumno' ? 1 : 0;
  res.json({ token: 'fake-token-' + Date.now(), role, userId });
});

// Middleware para rol (simulado por headers)
app.use((req, res, next) => {
  req.role = req.headers['x-role'] || 'alumno';
  next();
});

// ========== PREFERENCIAS (tabla Preferencias_notificacion) ==========
// GET /api/preferences
app.get('/api/preferences', async (req, res) => {
  try {
    const alumnoId = getAlumnoId(req);
    const [rows] = await pool.execute(
      `SELECT id_preferencia, canal_ppal, canal_secundario, silenciado, horario_preferido, frecuencia_maxima
       FROM Preferencias_notificacion WHERE id_alumno = ? LIMIT 1`,
      [alumnoId]
    );

    // Defaults
    let canal_ppal = 'email';
    let canal_secundario = 'app';
    let silenciado = 0;
    let horario_preferido = '22:00-07:00';
    let frecuencia_maxima = 'normal';

    if (rows.length) {
      const p = rows[0];
      canal_ppal = p.canal_ppal || canal_ppal;
      canal_secundario = p.canal_secundario || canal_secundario;
      silenciado = p.silenciado ? 1 : 0;
      horario_preferido = p.horario_preferido || horario_preferido;
      frecuencia_maxima = p.frecuencia_maxima || frecuencia_maxima;
    } else {
      // crear default si no existe
      await pool.execute(
        `INSERT INTO Preferencias_notificacion (id_alumno, canal_ppal, canal_secundario, silenciado, horario_preferido, frecuencia_maxima)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [alumnoId, canal_ppal, canal_secundario, silenciado, horario_preferido, frecuencia_maxima]
      );
    }

    // Parse horario_preferido "HH:MM-HH:MM" a from/to enteros
    const [fromStr, toStr] = horario_preferido.split('-');
    const from = Number((fromStr || '22:00').split(':')[0]) || 22;
    const to = Number((toStr || '07:00').split(':')[0]) || 7;

    // Derivar booleans de canales
    const toBool = (ch) => ch === canal_ppal || ch === canal_secundario;
    const channels = {
      app: toBool('app'),
      email: toBool('email'),
      sms: toBool('sms'),
      whatsapp: toBool('whatsapp')
    };

    // Silenciado: si está activo, podemos interpretarlo como "no molestar" full; lo conservamos aparte
    res.json({
      channels,
      dnd: { from, to },
      events: {
        // No hay campos por tipo de evento en tu tabla; devolvemos defaults activos
        upcoming_due: true,
        overdue: true,
        payment_confirmed: true
      },
      silenciado: !!silenciado,
      canal_ppal,
      canal_secundario,
      frecuencia_maxima
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Error cargando preferencias' });
  }
});

// PUT /api/preferences
// Body esperado (desde tu frontend actual):
// { channels:{app,email,sms,whatsapp}, dnd:{from,to}, events:{...} }
app.put('/api/preferences', async (req, res) => {
  try {
    const alumnoId = getAlumnoId(req);
    const { channels, dnd, silenciado, canal_ppal, canal_secundario, frecuencia_maxima } = req.body;

    // Si no envían canal_ppal/secundario, los inferimos por prioridad: app > email > whatsapp > sms
    const order = ['app','email','whatsapp','sms'];
    function inferChannels() {
      const actives = order.filter(k => channels?.[k]);
      const ppal = canal_ppal || actives[0] || 'email';
      const sec = canal_secundario || actives[1] || 'app';
      return { ppal, sec };
    }
    const inferred = inferChannels();

    // Construir horario_preferido "HH:00-HH:00"
    const from = Number.isInteger(dnd?.from) ? dnd.from : 22;
    const to = Number.isInteger(dnd?.to) ? dnd.to : 7;
    const horario_preferido = `${String(from).padStart(2,'0')}:00-${String(to).padStart(2,'0')}:00`;

    const freq = frecuencia_maxima || 'normal';

    // Upsert
    await pool.execute(
      `INSERT INTO Preferencias_notificacion (id_alumno, canal_ppal, canal_secundario, silenciado, horario_preferido, frecuencia_maxima)
       VALUES (?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         canal_ppal = VALUES(canal_ppal),
         canal_secundario = VALUES(canal_secundario),
         silenciado = VALUES(silenciado),
         horario_preferido = VALUES(horario_preferido),
         frecuencia_maxima = VALUES(frecuencia_maxima)`,
      [alumnoId, inferred.ppal, inferred.sec, silenciado ? 1 : 0, horario_preferido, freq]
    );

    res.json({ ok: true, message: 'Preferencias guardadas' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Error guardando preferencias' });
  }
});

// ========== NOTIFICACIONES (tabla Notificacion) ==========
// GET /api/notifications
app.get('/api/notifications', async (req, res) => {
  try {
    const alumnoId = getAlumnoId(req);
    const [rows] = await pool.execute(
      `SELECT n.id_notificacion, n.tipo, n.canal, n.fecha_horario_envio, n.estado_envio, n.mensaje_personalizado,
              p.fecha AS fecha_pago, p.estado AS estado_pago
       FROM Notificacion n
       LEFT JOIN Pago p ON p.id_pago = n.id_pago
       WHERE n.id_alumno = ?
       ORDER BY n.id_notificacion DESC
       LIMIT 50`,
      [alumnoId]
    );

    if (!rows.length) {
      // Fallback si no hay datos aún
      return res.json([
        { text: '✅ Bienvenido al panel de notificaciones.', date: new Date().toLocaleString() }
      ]);
    }

    const list = rows.map(r => {
      const when = r.fecha_horario_envio || r.fecha_pago || '';
      const textoBase = r.mensaje_personalizado || `[${r.tipo || 'notificación'}] por ${r.canal || 'canal'}`;
      return {
        text: textoBase,
        date: when
      };
    });
    res.json(list);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Error listando notificaciones' });
  }
});

// ========== PAGOS (tabla Pago) ==========
// GET /api/payments/status
app.get('/api/payments/status', async (req, res) => {
  try {
    const alumnoId = getAlumnoId(req);

    // Último pago "pagado"
    const [[lastPaid]] = await pool.execute(
      `SELECT fecha, monto FROM Pago 
       WHERE id_alumno = ? AND (estado = 'pagado' OR tipo = 'Pago')
       ORDER BY id_pago DESC LIMIT 1`,
      [alumnoId]
    );

    // Algún pago pendiente
    const [[pending]] = await pool.execute(
      `SELECT fecha, tipo, estado FROM Pago 
       WHERE id_alumno = ? AND (estado = 'pendiente' OR estado = 'vencido')
       ORDER BY id_pago DESC LIMIT 1`,
      [alumnoId]
    );

    // "Próxima a vencer" no está directamente; usamos el último pendiente/vencido como referencia
    const nextDueDate = pending?.fecha || null;

    res.json({
      lastPaymentDate: lastPaid?.fecha || null,
      pending: pending ? `${pending.tipo || 'Cuota'} (${pending.estado})` : null,
      nextDueDate: nextDueDate
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Error consultando pagos' });
  }
});

// ========== PLANTILLAS (tabla Plantilla) ==========
// Solo permitir si rol=admin (simulado por header X-Role: admin)
function requireAdmin(req, res){
  if (req.role !== 'admin') {
    res.status(403).json({ error: 'Forbidden: Solo administradores' });
    return false;
  }
  return true;
}

// GET /api/templates
app.get('/api/templates', async (req, res) => {
  if (!requireAdmin(req, res)) return;
  try {
    const [rows] = await pool.execute(
      `SELECT id_plantilla, tipo_evento, canal, asunto, cuerpo, activa
       FROM Plantilla
       ORDER BY id_plantilla DESC`
    );
    const data = rows.map(r => ({
      id: r.id_plantilla,
      name: r.tipo_evento,        // mapeo: nombre = tipo_evento
      channel: r.canal || '',
      subject: r.asunto || '',
      target: r.tipo_evento || '', // tu esquema no separa target; usamos tipo_evento como descriptor
      body: r.cuerpo || '',
      active: !!r.activa
    }));
    res.json(data);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Error listando plantillas' });
  }
});

// POST /api/templates
app.post('/api/templates', async (req, res) => {
  if (!requireAdmin(req, res)) return;
  try {
    const { name, channel, subject, target, body, active } = req.body;
    // En tu esquema, "tipo_evento" es el tipo/descriptor
    const tipo_evento = target || name || 'general';

    if (!channel || !body) {
      return res.status(400).json({ error: 'Faltan campos: channel y body son requeridos' });
    }

    const [result] = await pool.execute(
      `INSERT INTO Plantilla (tipo_evento, canal, asunto, cuerpo, activa)
       VALUES (?, ?, ?, ?, ?)`,
      [tipo_evento, channel, subject || '', body, active ? 1 : 1]
    );

    res.status(201).json({
      id: result.insertId,
      name: tipo_evento,
      channel,
      subject: subject || '',
      target: tipo_evento,
      body,
      active: active !== false
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Error creando plantilla' });
  }
});

// PUT /api/templates/:id
app.put('/api/templates/:id', async (req, res) => {
  if (!requireAdmin(req, res)) return;
  try {
    const id = Number(req.params.id);
    const { name, channel, subject, target, body, active } = req.body;
    const tipo_evento = target || name || null;

    // Verificar existencia
    const [[exists]] = await pool.execute(
      'SELECT id_plantilla FROM Plantilla WHERE id_plantilla = ?',
      [id]
    );
    if (!exists) return res.status(404).json({ error: 'Plantilla no encontrada' });

    await pool.execute(
      `UPDATE Plantilla
       SET 
         tipo_evento = COALESCE(?, tipo_evento),
         canal = COALESCE(?, canal),
         asunto = COALESCE(?, asunto),
         cuerpo = COALESCE(?, cuerpo),
         activa = COALESCE(?, activa)
       WHERE id_plantilla = ?`,
      [
        tipo_evento,
        channel ?? null,
        subject ?? null,
        body ?? null,
        (active === undefined ? null : (active ? 1 : 0)),
        id
      ]
    );

    const [[row]] = await pool.execute(
      `SELECT id_plantilla, tipo_evento, canal, asunto, cuerpo, activa
       FROM Plantilla WHERE id_plantilla = ?`,
      [id]
    );

    res.json({
      id: row.id_plantilla,
      name: row.tipo_evento,
      channel: row.canal || '',
      subject: row.asunto || '',
      target: row.tipo_evento || '',
      body: row.cuerpo || '',
      active: !!row.activa
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Error actualizando plantilla' });
  }
});

// DELETE /api/templates/:id
app.delete('/api/templates/:id', async (req, res) => {
  if (!requireAdmin(req, res)) return;
  try {
    const id = Number(req.params.id);
    const [r] = await pool.execute('DELETE FROM Plantilla WHERE id_plantilla = ?', [id]);
    if (r.affectedRows === 0) return res.status(404).json({ error: 'Plantilla no encontrada' });
    res.json({ ok: true, message: 'Plantilla eliminada' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Error eliminando plantilla' });
  }
});

// ========== START ==========
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ API escuchando en http://localhost:${PORT}`);
  console.log(`🗄️ Conectado a DB "${DB_DATABASE}"`);
});