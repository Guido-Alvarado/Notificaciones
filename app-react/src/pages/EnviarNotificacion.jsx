
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function EnviarNotificacion() {
    const navigate = useNavigate();
    const [plantillas, setPlantillas] = useState([]);
    const [alumnos, setAlumnos] = useState([]);
    const [alumnosConDeuda, setAlumnosConDeuda] = useState([]);
    
    const [form, setForm] = useState({
        plantilla_id: "",
        medio: "",
        alumno_id: "",
        tipo_envio: "individual" // individual o masivo
    });
    
    const [mensaje, setMensaje] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const API_BASE = "http://localhost:4000";
    const getHeaders = () => ({
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("token")}`
    });

    useEffect(() => {
        cargarDatos();
    }, []);

    const cargarDatos = async () => {
        try {
            const [plantRes, alumRes, deudaRes] = await Promise.all([
                fetch(`${API_BASE}/plantillas`, { headers: getHeaders() }),
                fetch(`${API_BASE}/academico/alumnos`, { headers: getHeaders() }),
                fetch(`${API_BASE}/cuotas/deudas`, { headers: getHeaders() })
            ]);

            const plantillasData = await plantRes.json();
            const alumnosData = await alumRes.json();
            const deudasData = await deudaRes.json();

            setPlantillas(plantillasData.filter(p => p.activo));
            setAlumnos(alumnosData);
            setAlumnosConDeuda(deudasData);
        } catch (err) {
            console.error(err);
            setError("Error al cargar datos");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMensaje("");
        setError("");
        setLoading(true);

        try {
            const url = form.tipo_envio === "individual" 
                ? `${API_BASE}/notificaciones/enviar`
                : `${API_BASE}/notificaciones/enviar-masivas`;

            const body = form.tipo_envio === "individual"
                ? { alumno_id: form.alumno_id, plantilla_id: form.plantilla_id, medio: form.medio }
                : { plantilla_id: form.plantilla_id, medio: form.medio };

            const res = await fetch(url, {
                method: "POST",
                headers: getHeaders(),
                body: JSON.stringify(body)
            });

            const data = await res.json();

            if (res.ok) {
                setMensaje(data.message || "Notificación enviada correctamente");
                setForm({ plantilla_id: "", medio: "", alumno_id: "", tipo_envio: "individual" });
            } else {
                setError(data.error || "Error al enviar notificación");
            }
        } catch (err) {
            console.error(err);
            setError("Error de conexión");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold">Enviar Notificación</h1>
                    <button
                        onClick={() => navigate("/home")}
                        className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                    >
                        ← Volver
                    </button>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-lg">
                    {mensaje && <div className="bg-green-100 text-green-700 p-3 rounded mb-4">{mensaje}</div>}
                    {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block font-semibold mb-2">Tipo de envío</label>
                            <select
                                className="w-full p-2 border rounded"
                                value={form.tipo_envio}
                                onChange={(e) => setForm({...form, tipo_envio: e.target.value, alumno_id: ""})}
                            >
                                <option value="individual">Individual (un alumno)</option>
                                <option value="masivo">Masivo (todos los alumnos activos)</option>
                            </select>
                        </div>

                        <div>
                            <label className="block font-semibold mb-2">Plantilla *</label>
                            <select
                                className="w-full p-2 border rounded"
                                value={form.plantilla_id}
                                onChange={(e) => setForm({...form, plantilla_id: e.target.value})}
                                required
                            >
                                <option value="">Seleccione una plantilla</option>
                                {plantillas.map(p => (
                                    <option key={p.id} value={p.id}>
                                        {p.titulo || `Plantilla ${p.id}`} ({p.tipo})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block font-semibold mb-2">Medio de envío *</label>
                            <select
                                className="w-full p-2 border rounded"
                                value={form.medio}
                                onChange={(e) => setForm({...form, medio: e.target.value})}
                                required
                            >
                                <option value="">Seleccione un medio</option>
                                <option value="email">📧 Email</option>
                                <option value="whatsapp">📱 WhatsApp</option>
                                <option value="push">🔔 Push Notification</option>
                            </select>
                        </div>

                        {form.tipo_envio === "individual" && (
                            <div>
                                <label className="block font-semibold mb-2">Alumno *</label>
                                <select
                                    className="w-full p-2 border rounded"
                                    value={form.alumno_id}
                                    onChange={(e) => setForm({...form, alumno_id: e.target.value})}
                                    required
                                >
                                    <option value="">Seleccione un alumno</option>
                                    {alumnos.map(a => (
                                        <option key={a.id} value={a.id}>
                                            {a.apellido}, {a.nombre} - {a.dni}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        <button
                            type="submit"
                            className="w-full bg-blue-600 text-white p-3 rounded hover:bg-blue-700 font-semibold"
                            disabled={loading}
                        >
                            {loading ? "Enviando..." : "Enviar Notificación"}
                        </button>
                    </form>
                </div>

                {/* Panel de alumnos con deuda */}
                <div className="bg-white p-6 rounded-xl shadow-lg mt-6">
                    <h2 className="text-xl font-bold mb-4">Alumnos con Deuda</h2>
                    <div className="overflow-auto max-h-96">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-gray-200">
                                    <th className="p-2 text-left">Alumno</th>
                                    <th className="p-2 text-left">DNI</th>
                                    <th className="p-2 text-left">Email</th>
                                    <th className="p-2 text-center">Meses Deuda</th>
                                </tr>
                            </thead>
                            <tbody>
                                {alumnosConDeuda.map(a => (
                                    <tr key={a.usuario_id} className="border-b hover:bg-gray-50">
                                        <td className="p-2">{a.apellido}, {a.nombre}</td>
                                        <td className="p-2">{a.dni}</td>
                                        <td className="p-2">{a.email}</td>
                                        <td className="p-2 text-center">
                                            <span className="bg-red-100 text-red-700 px-2 py-1 rounded font-bold">
                                                {a.meses_deuda}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
