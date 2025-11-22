import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function CrearPlantilla() {
  const navigate = useNavigate();

  const [templates, setTemplates] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [form, setForm] = useState({
    titulo: "",
    tipo: "",
    cuerpo: "",
    activo: true
  });
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");

  const API_BASE = "http://localhost:4000";
  
  const getHeaders = () => ({
    "Content-Type": "application/json",
    "Authorization": `Bearer ${localStorage.getItem("token")}`
  });

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const res = await fetch(`${API_BASE}/plantillas`, { 
        headers: getHeaders() 
      });
      const data = await res.json();
      setTemplates(data);
    } catch (err) {
      console.error(err);
      setError("Error cargando plantillas");
    }
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleEdit = (template) => {
    setEditingTemplate(template);
    setForm({
      titulo: template.titulo || "",
      tipo: template.tipo,
      cuerpo: template.cuerpo,
      activo: !!template.activo
    });
  };

  const handleDelete = async (templateId) => {
    if (!window.confirm("¿Eliminar plantilla?")) return;
    try {
      const res = await fetch(`${API_BASE}/plantillas/${templateId}`, {
        method: "DELETE",
        headers: getHeaders()
      });
      if (res.ok) {
        setMensaje("Plantilla eliminada");
        loadTemplates();
      } else setError("Error al eliminar plantilla");
    } catch (err) {
      console.error(err);
      setError("Error de conexión");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje("");
    setError("");

    if (!form.tipo || !form.cuerpo) {
      setError("Complete los campos obligatorios (tipo y cuerpo)");
      return;
    }

    const url = editingTemplate ? `${API_BASE}/plantillas/${editingTemplate.id}` : `${API_BASE}/plantillas`;
    const method = editingTemplate ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: getHeaders(),
        body: JSON.stringify(form)
      });
      if (res.ok) {
        setMensaje("Plantilla guardada correctamente");
        setEditingTemplate(null);
        setForm({ titulo: "", tipo: "", cuerpo: "", activo: true });
        loadTemplates();
      } else {
        const errorData = await res.json();
        setError(errorData.error || "Error al guardar plantilla");
      }
    } catch (err) {
      console.error(err);
      setError("Error de conexión");
    }
  };

  const filteredTemplates = templates.filter(t =>
    (t.titulo || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (t.tipo || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-100 p-4 gap-6">
      {/* Lista de plantillas */}
      <div className="flex-1 bg-white p-6 rounded-xl shadow-lg overflow-auto">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-green-400">Plantillas</h1>
          <input
            type="text"
            placeholder="Buscar plantillas..."
            className="p-2 border rounded w-60"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="self-start mb-4">
                <button
                    onClick={() => navigate("/home")}
                    className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                >
                    ← Volver
                </button>
            </div>

        <table className="w-full border-collapse table-auto">
          <thead>
            <tr className="bg-green-800 text-white">
              <th className="p-2">Título</th>
              <th className="p-2">Tipo</th>
              <th className="p-2">Creador</th>
              <th className="p-2">Estado</th>
              <th className="p-2">Fecha Creación</th>
              <th className="p-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredTemplates.map(t => (
              <tr key={t.id} className="hover:bg-green-100/20">
                <td className="p-2">{t.titulo || "Sin título"}</td>
                <td className="p-2">
                  <span className={`px-2 py-1 rounded text-xs ${
                    t.tipo === 'email' ? 'bg-blue-200' : 
                    t.tipo === 'whatsapp' ? 'bg-green-200' : 
                    'bg-purple-200'
                  }`}>
                    {t.tipo}
                  </span>
                </td>
                <td className="p-2">{t.nombre && t.apellido ? `${t.nombre} ${t.apellido}` : "-"}</td>
                <td className="p-2">
                  <span className={`px-2 py-1 rounded font-bold text-white text-xs ${t.activo ? "bg-green-500" : "bg-gray-500"}`}>
                    {t.activo ? "Activa" : "Inactiva"}
                  </span>
                </td>
                <td className="p-2">{t.fecha_creacion ? new Date(t.fecha_creacion).toLocaleDateString() : "-"}</td>
                <td className="p-2 flex gap-2">
                  <button className="bg-green-500 px-2 py-1 rounded text-white text-sm" onClick={() => handleEdit(t)}>Editar</button>
                  <button className="bg-red-600 px-2 py-1 rounded text-white text-sm" onClick={() => handleDelete(t.id)}>Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Formulario de crear/editar */}
      <div className="flex-1 bg-white p-6 rounded-xl shadow-lg">
        <h2 className="text-xl font-bold mb-4">{editingTemplate ? "Editar Plantilla" : "Crear Plantilla"}</h2>

        {mensaje && <div className="bg-green-100 text-green-700 p-2 rounded mb-3">{mensaje}</div>}
        {error && <div className="bg-red-100 text-red-700 p-2 rounded mb-3">{error}</div>}

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="text"
            name="titulo"
            placeholder="Título de la plantilla (opcional)"
            className="p-2 border rounded"
            value={form.titulo}
            onChange={handleFormChange}
          />

          <select
            name="tipo"
            className="p-2 border rounded"
            value={form.tipo}
            onChange={handleFormChange}
            required
          >
            <option value="">Seleccione un tipo *</option>
            <option value="email">📧 Email</option>
            <option value="whatsapp">📱 WhatsApp</option>
            <option value="push">🔔 Push Notification</option>
          </select>

          <div className="bg-blue-50 p-3 rounded text-sm">
            <p className="font-bold mb-1">Tokens disponibles:</p>
            <ul className="list-disc list-inside text-xs space-y-1">
              <li><code>{"{{nombre}}"}</code> - Nombre del alumno</li>
              <li><code>{"{{apellido}}"}</code> - Apellido del alumno</li>
              <li><code>{"{{dni}}"}</code> - DNI del alumno</li>
              <li><code>{"{{meses_deuda}}"}</code> - Cantidad de meses con deuda</li>
              <li><code>{"{{importe_total}}"}</code> - Importe total adeudado</li>
              <li><code>{"{{vencimiento_min}}"}</code> - Fecha del primer vencimiento</li>
            </ul>
          </div>

          <textarea
            name="cuerpo"
            placeholder="Cuerpo del mensaje (use los tokens disponibles) *"
            className="p-2 border rounded h-40 resize-none font-mono text-sm"
            value={form.cuerpo}
            onChange={handleFormChange}
            required
          />

          <label className="flex items-center gap-2 mt-2">
            <input type="checkbox" name="activo" checked={form.activo} onChange={handleFormChange} />
            <span className="font-semibold">Plantilla Activa</span>
          </label>

          <div className="flex justify-end gap-2 mt-3">
            <button type="button" onClick={() => { setEditingTemplate(null); setForm({titulo:"",tipo:"",cuerpo:"",activo:true}) }} className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500">
              Cancelar
            </button>
            <button type="submit" className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">
              {editingTemplate ? "Actualizar" : "Crear"} Plantilla
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
