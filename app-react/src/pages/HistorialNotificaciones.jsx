import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode"; // npm install jwt-decode

export default function HistorialNotificaciones() {
    const navigate = useNavigate();
    const [historial, setHistorial] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [usuario, setUsuario] = useState(null); // { id, rol_id, ... }

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
                    
                    {loading ? (
                        <p className="text-center py-8">Cargando historial...</p>
                    ) : historial.length === 0 ? (
                        <p className="text-center py-8 text-gray-500">
                            {esAdminOStaff ? "No hay notificaciones en el historial" : "No tenés notificaciones"}
                        </p>
                    ) : (
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
                    )}
                </div>
            </div>
        </div>
    );
}