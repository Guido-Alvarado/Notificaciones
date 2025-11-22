import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function CrearPlantilla() {
  const navigate = useNavigate();

  const [templates, setTemplates] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [form, setForm] = useState({
    name: "",
    channel: "",
    subject: "",
    target: "",
    body: "",
    active: true
  });
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");

  const API_BASE = "http://localhost:3000"; // Cambiar según tu backend
  const headers = { 
    "Content-Type": "application/json",
    "X-Role": "admin",
    "X-User-Id": "admin1"
  };

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/templates`, { headers });
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
      name: template.name,
      channel: template.channel,
      subject: template.subject || "",
      target: template.target,
      body: template.body,
      active: !!template.active
    });
  };

  const handleDelete = async (templateId) => {
    if (!window.confirm("¿Eliminar plantilla?")) return;
    try {
      const res = await fetch(`${API_BASE}/api/templates/${templateId}`, {
        method: "DELETE",
        headers
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

    if (!form.name || !form.channel) {
      setError("Complete los campos obligatorios");
      return;
    }

    const url = editingTemplate ? `${API_BASE}/api/templates/${editingTemplate.id}` : `${API_BASE}/api/templates`;
    const method = editingTemplate ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers,
        body: JSON.stringify(form)
      });
      if (res.ok) {
        setMensaje("Plantilla guardada correctamente");
        setEditingTemplate(null);
        setForm({ name: "", channel: "", subject: "", target: "", body: "", active: true });
        loadTemplates();
      } else setError("Error al guardar plantilla");
    } catch (err) {
      console.error(err);
      setError("Error de conexión");
    }
  };

  const filteredTemplates = templates.filter(t =>
    t.name.toLowerCase().includes(searchTerm.toLowerCase())
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
              <th className="p-2">Nombre</th>
              <th className="p-2">Canal</th>
              <th className="p-2">Asunto</th>
              <th className="p-2">Destinatarios</th>
              <th className="p-2">Estado</th>
              <th className="p-2">Última Edición</th>
              <th className="p-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredTemplates.map(t => (
              <tr key={t.id} className="hover:bg-green-100/20">
                <td className="p-2">{t.name}</td>
                <td className="p-2">{t.channel}</td>
                <td className="p-2">{t.subject || "-"}</td>
                <td className="p-2">{t.target}</td>
                <td className="p-2">
                  <span className={`px-2 py-1 rounded font-bold ${t.active ? "bg-green-500" : "bg-gray-500"}`}>
                    {t.active ? "Activa" : "Inactiva"}
                  </span>
                </td>
                <td className="p-2">{t.updated_at ? new Date(t.updated_at).toLocaleDateString() : "-"}</td>
                <td className="p-2 flex gap-2">
                  <button className="bg-green-500 px-2 py-1 rounded text-white" onClick={() => handleEdit(t)}>Editar</button>
                  <button className="bg-red-600 px-2 py-1 rounded text-white" onClick={() => handleDelete(t.id)}>Eliminar</button>
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
            name="name"
            placeholder="Nombre de la plantilla"
            className="p-2 border rounded"
            value={form.name}
            onChange={handleFormChange}
            required
          />

          <select
            name="channel"
            className="p-2 border rounded"
            value={form.channel}
            onChange={handleFormChange}
            required
          >
            <option value="">Seleccione un canal</option>
            <option value="sms">SMS</option>
            <option value="whatsapp">WhatsApp</option>
            <option value="email">Email</option>
          </select>

          <input
            type="text"
            name="subject"
            placeholder="Asunto / descripción breve"
            className="p-2 border rounded"
            value={form.subject}
            onChange={handleFormChange}
          />

          <select
            name="target"
            className="p-2 border rounded"
            value={form.target}
            onChange={handleFormChange}
          >
            <option value="">Seleccione destinatarios</option>
            <option value="all-students">Todos los alumnos</option>
            <option value="single-student">Alumno específico</option>
            <option value="one-overdue">1 cuota vencida</option>
            <option value="two-overdue">2 cuotas vencidas</option>
            <option value="three-overdue">3 o más cuotas vencidas</option>
            <option value="paid-up">Pagos al día</option>
          </select>

          {form.target === "single-student" && (
            <input type="text" placeholder="Buscar alumno" className="p-2 border rounded" />
          )}

          <textarea
            name="body"
            placeholder="Cuerpo del mensaje"
            className="p-2 border rounded h-32 resize-none"
            value={form.body}
            onChange={handleFormChange}
          />

          <label className="flex items-center gap-2 mt-2">
            <input type="checkbox" name="active" checked={form.active} onChange={handleFormChange} />
            Activa
          </label>

          <div className="flex justify-end gap-2 mt-3">
            <button type="button" onClick={() => { setEditingTemplate(null); setForm({name:"",channel:"",subject:"",target:"",body:"",active:true}) }} className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500">
              Cancelar
            </button>
            <button type="submit" className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
