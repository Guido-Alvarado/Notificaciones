import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode"; // npm install jwt-decode

export default function HistorialNotificaciones() {
    const navigate = useNavigate();
    const [historial, setHistorial] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [usuario, setUsuario] = useState(null); // { id, rol_id, ... }
<<<<<<< HEAD
=======
    const [filtros, setFiltros] = useState({}); // filtros para el historial
>>>>>>> 4da385b (Dejar de trackear node_modules)

    const API_BASE = "http://localhost:4000";
    const getHeaders = () => ({
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("token")}`
    });

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            try {
                const decoded = jwtDecode(token);
                setUsuario(decoded); // asegurate que tenga decoded.id y decoded.rol_id
            } catch (err) {
                console.error("Error decodificando token:", err);
                setError("Error de autenticación");
            }
        } else {
            setError("No hay sesión activa");
        }
    }, []);

    useEffect(() => {
        if (usuario) {
            cargarHistorial();
        }
    }, [usuario]);

<<<<<<< HEAD
    const cargarHistorial = async () => {
        try {
            setLoading(true);

            // Si rol 1 o 2 → admin / staff: ve todo
            if (usuario.rol_id === 1 || usuario.rol_id === 2) {
                const res = await fetch(`${API_BASE}/notificaciones/historial`, {
                    headers: getHeaders()
                });
                const data = await res.json();
                setHistorial(data);
            } else {
                // Alumno: solo sus propias notificaciones
                const res = await fetch(`${API_BASE}/notificaciones/historial?alumno_id=${usuario.id}`, {
                    headers: getHeaders()
                });

                if (!res.ok) throw new Error("Error al cargar historial del alumno");

                const data = await res.json();
                setHistorial(data);
            }
        } catch (err) {
            console.error(err);
            setError("Error al cargar historial");
        } finally {
            setLoading(false);
        }
    };

    const esAdminOStaff = usuario && (usuario.rol_id === 1 || usuario.rol_id === 2);
=======
   const cargarHistorial = async () => {
    try {
        setLoading(true);

        let url = `${API_BASE}/notificaciones/historial`;

        const params = new URLSearchParams();

        if (!(usuario.rol_id === 1 || usuario.rol_id === 2)) {
            params.append("alumno_id", usuario.id);
        }

        // Agregar filtros si tienen valor
        Object.entries(filtros || {}).forEach(([k, v]) => {
            if (v) params.append(k, v);
        });

        if ([...params].length > 0) {
            url += `?${params.toString()}`;
        }

        const res = await fetch(url, {
            headers: getHeaders()
        });

        if (!res.ok) throw new Error("Error al cargar historial");

        const data = await res.json();
        setHistorial(data);

    } catch (err) {
        console.error(err);
        setError("Error al cargar historial");
    } finally {
        setLoading(false);
    }
};


    const esAdminOStaff = usuario && (usuario.rol_id === 1 || usuario.rol_id === 2);
    // Recuento de notificaciones
    const totalNotificaciones = historial.length;
    const notificacionesExitosas = historial.filter(h => h.exito).length;
    const notificacionesFallidas = historial.filter(h => h.exito === 0).length;
>>>>>>> 4da385b (Dejar de trackear node_modules)

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold">
                        {esAdminOStaff ? "Historial de Notificaciones" : "Mis Notificaciones"}
                    </h1>
                    <button
                        onClick={() => navigate("/home")}
                        className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                    >
                        ← Volver
                    </button>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-lg">
                    {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}
<<<<<<< HEAD
                    
=======

                    {/* Filtros */}
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
                        <input
                            type="text"
                            placeholder="Buscar alumno..."
                            className="px-3 py-2 border rounded"
                            onChange={e => setFiltros({ ...filtros, alumno: e.target.value })}
                        />
                        <input
                            type="date"
                            className="px-3 py-2 border rounded"
                            onChange={e => setFiltros({ ...filtros, fecha_desde: e.target.value })}
                        />
                        <input
                            type="date"
                            className="px-3 py-2 border rounded"
                            onChange={e => setFiltros({ ...filtros, fecha_hasta: e.target.value })}
                        />
                        <select
                            className="px-3 py-2 border rounded"
                            onChange={e => setFiltros({ ...filtros, estado: e.target.value })}
                        >
                            <option value="">Estado</option>
                            <option value="enviada">Enviada</option>
                            <option value="fallida">Fallida</option>
                            <option value="pendiente">Pendiente</option>
                        </select>
                        <select
                            className="px-3 py-2 border rounded"
                            onChange={e => setFiltros({ ...filtros, tipo_evento: e.target.value })}
                        >
                            <option value="">Tipo de evento</option>
                            <option value="Cuota Próxima a Vencer">Cuota Próxima a Vencer</option>
                            <option value="Recordatorio de Cuota Vencida">Recordatorio de Cuota Vencida</option>
                            <option value="Pago Confirmado">Pago Confirmado</option>
                        </select>
                    </div>

                    <button
                        onClick={cargarHistorial}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 mb-4"
                    >
                        Aplicar filtros
                    </button>

>>>>>>> 4da385b (Dejar de trackear node_modules)
                    {loading ? (
                        <p className="text-center py-8">Cargando historial...</p>
                    ) : historial.length === 0 ? (
                        <p className="text-center py-8 text-gray-500">
                            {esAdminOStaff ? "No hay notificaciones en el historial" : "No tenés notificaciones"}
                        </p>
                    ) : (
<<<<<<< HEAD
                        <div className="overflow-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-blue-800 text-white">
                                        <th className="p-2 text-left">Fecha</th>
                                        {esAdminOStaff && (
                                            <>
                                                <th className="p-2 text-left">Alumno</th>
                                                <th className="p-2 text-left">Email</th>
                                            </>
                                        )}
                                        <th className="p-2 text-center">Medio</th>
                                        <th className="p-2 text-left">Plantilla</th>
                                        <th className="p-2 text-center">Estado</th>
                                        <th className="p-2 text-left">Referencia</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {historial.map(h => (
                                        <tr key={h.id} className="border-b hover:bg-gray-50">
                                            <td className="p-2">
                                                {new Date(h.fecha_envio).toLocaleString('es-AR')}
                                            </td>
                                            {esAdminOStaff && (
                                                <>
                                                    <td className="p-2">{h.apellido}, {h.nombre}</td>
                                                    <td className="p-2 text-xs">{h.email}</td>
                                                </>
                                            )}
                                            <td className="p-2 text-center">
                                                <span className={`px-2 py-1 rounded text-xs ${
                                                    h.medio === 'email' ? 'bg-blue-200' :
                                                    h.medio === 'whatsapp' ? 'bg-green-200' :
                                                    'bg-purple-200'
                                                }`}>
                                                    {h.medio}
                                                </span>
                                            </td>
                                            <td className="p-2 text-xs">{h.plantilla_titulo || "-"}</td>
                                            <td className="p-2 text-center">
                                                {h.exito ? (
                                                    <span className="text-green-600 font-bold">✓ Enviado</span>
                                                ) : (
                                                    <span className="text-red-600 font-bold">✗ Error</span>
                                                )}
                                            </td>
                                            <td className="p-2 text-xs font-mono">{h.referencia_externa || "-"}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
=======
                        <>
                            {/* Resumen */}
                            <div className="mb-4 p-3 bg-gray-100 rounded">
                                <p>Total: {totalNotificaciones}</p>
                                <p>Exitosas: {notificacionesExitosas}</p>
                                {notificacionesFallidas > 0 && (
                                    <p className="text-red-600 font-bold">Fallidas: {notificacionesFallidas}</p>
                                )}
                            </div>

                            {/* Tabla */}
                            <div className="overflow-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="bg-blue-800 text-white">
                                            <th className="p-2 text-left">Fecha</th>
                                            {esAdminOStaff && (
                                                <>
                                                    <th className="p-2 text-left">Alumno</th>
                                                    <th className="p-2 text-left">Email</th>
                                                </>
                                            )}
                                            <th className="p-2 text-center">Medio</th>
                                            <th className="p-2 text-left">Plantilla</th>
                                            <th className="p-2 text-center">Estado</th>
                                            <th className="p-2 text-left">Referencia</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {historial.map(h => (
                                            <tr key={h.id} className="border-b hover:bg-gray-50">
                                                <td className="p-2">{new Date(h.fecha_envio).toLocaleString("es-AR")}</td>
                                                {esAdminOStaff && (
                                                    <>
                                                        <td className="p-2">{h.apellido}, {h.nombre}</td>
                                                        <td className="p-2 text-xs">{h.email}</td>
                                                    </>
                                                )}
                                                <td className="p-2 text-center">
                                                    <span className={`px-2 py-1 rounded text-xs ${
                                                        h.medio === "email" ? "bg-blue-200" :
                                                        h.medio === "whatsapp" ? "bg-green-200" :
                                                        "bg-purple-200"
                                                    }`}>
                                                        {h.medio}
                                                    </span>
                                                </td>
                                                <td className="p-2 text-xs">{h.plantilla_titulo || "-"}</td>
                                                <td className="p-2 text-center">
                                                    {h.exito ? (
                                                        <span className="text-green-600 font-bold">✓ Enviado</span>
                                                    ) : (
                                                        <span className="text-red-600 font-bold">✗ Error</span>
                                                    )}
                                                </td>
                                                <td className="p-2 text-xs font-mono">{h.referencia_externa || "-"}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </>
>>>>>>> 4da385b (Dejar de trackear node_modules)
                    )}
                </div>
            </div>
        </div>
    );
}