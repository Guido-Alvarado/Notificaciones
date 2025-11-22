import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode"; // npm install jwt-decode

export default function GestionCuotas() {
    const navigate = useNavigate();
    const [cuotas, setCuotas] = useState([]);
    const [alumnosConDeuda, setAlumnosConDeuda] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [mensaje, setMensaje] = useState("");
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
            cargarDatos();
        }
    }, [usuario]);

    const cargarDatos = async () => {
        try {
            setLoading(true);

            // Si rol 1 o 2 → admin / staff: ve todo
            if (usuario.rol_id === 1 || usuario.rol_id === 2) {
                const [cuotasRes, deudasRes] = await Promise.all([
                    fetch(`${API_BASE}/cuotas`, { headers: getHeaders() }),
                    fetch(`${API_BASE}/cuotas/deudas`, { headers: getHeaders() })
                ]);

                const cuotasData = await cuotasRes.json();
                const deudasData = await deudasRes.json();

                setCuotas(cuotasData);
                setAlumnosConDeuda(deudasData);
            } else {
                // Alumno: solo sus propias cuotas
                const res = await fetch(`${API_BASE}/cuotas/alumno/${usuario.id}`, {
                    headers: getHeaders()
                });

                if (!res.ok) throw new Error("Error al cargar cuotas del alumno");

                const cuotasData = await res.json();
                setCuotas(cuotasData);
                setAlumnosConDeuda([]); // no se muestra el panel de otros alumnos
            }
        } catch (err) {
            console.error(err);
            setError("Error al cargar datos");
        } finally {
            setLoading(false);
        }
    };

    const registrarPago = async (cuotaId) => {
        try {
            const res = await fetch(`${API_BASE}/cuotas/${cuotaId}/pagar`, {
                method: "PUT",
                headers: getHeaders(),
                body: JSON.stringify({ fecha_pago: new Date().toISOString().split('T')[0] })
            });

            if (res.ok) {
                setMensaje("Pago registrado correctamente");
                cargarDatos();
            } else {
                setError("Error al registrar pago");
            }
        } catch (err) {
            console.error(err);
            setError("Error de conexión");
        }
    };

    // Cálculos de resumen (sirven tanto para admin como para alumno)
    const cuotasPendientes = cuotas.filter(c => !c.pagado);
    const totalDeuda = cuotasPendientes.reduce(
        (sum, c) => sum + parseFloat(c.monto || 0),
        0
    );

    const esAdminOStaff = usuario && (usuario.rol_id === 1 || usuario.rol_id === 2);

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold">
                        {esAdminOStaff ? "Gestión de Cuotas" : "Mis Cuotas"}
                    </h1>
                    <button
                        onClick={() => navigate("/home")}
                        className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                    >
                        ← Volver
                    </button>
                </div>

                {mensaje && <div className="bg-green-100 text-green-700 p-3 rounded mb-4">{mensaje}</div>}
                {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}

                {/* Resumen / Dashboard */}
                <div className="bg-white p-6 rounded-xl shadow-lg mb-6">
                    <h2 className="text-xl font-bold mb-4">
                        {esAdminOStaff ? "Resumen general" : "Resumen de tu cuenta"}
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="border rounded p-4">
                            <p className="text-gray-600 text-sm">Cuotas pendientes</p>
                            <p className="text-3xl font-bold text-red-600">
                                {cuotasPendientes.length}
                            </p>
                        </div>
                        <div className="border rounded p-4">
                            <p className="text-gray-600 text-sm">Total adeudado</p>
                            <p className="text-3xl font-bold text-red-600">
                                ${totalDeuda.toFixed(2)}
                            </p>
                        </div>
                        <div className="border rounded p-4">
                            <p className="text-gray-600 text-sm">Cuotas pagadas</p>
                            <p className="text-3xl font-bold text-green-600">
                                {cuotas.filter(c => c.pagado).length}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Panel "Alumnos con Deuda" solo para rol 1 o 2 */}
                {esAdminOStaff && (
                    <div className="bg-white p-6 rounded-xl shadow-lg mb-6">
                        <h2 className="text-xl font-bold mb-4">Alumnos con Deuda</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {alumnosConDeuda.slice(0, 6).map(a => (
                                <div key={a.usuario_id} className="border rounded p-4 hover:shadow-md">
                                    <p className="font-bold">{a.apellido}, {a.nombre}</p>
                                    <p className="text-sm text-gray-600">{a.dni}</p>
                                    <p className="text-sm text-gray-600">{a.curso_nombre}</p>
                                    <p className="mt-2">
                                        <span className="bg-red-100 text-red-700 px-3 py-1 rounded font-bold">
                                            {a.meses_deuda} {a.meses_deuda === 1 ? 'mes' : 'meses'} de deuda
                                        </span>
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Listado de cuotas */}
                <div className="bg-white p-6 rounded-xl shadow-lg">
                    <h2 className="text-xl font-bold mb-4">
                        {esAdminOStaff ? "Todas las Cuotas" : "Mis Cuotas"}
                    </h2>
                    
                    {loading ? (
                        <p className="text-center py-8">Cargando...</p>
                    ) : cuotas.length === 0 ? (
                        <p className="text-center py-8 text-gray-500">
                            {esAdminOStaff ? "No hay cuotas registradas" : "No tenés cuotas registradas"}
                        </p>
                    ) : (
                        <div className="overflow-auto max-h-96">
                            <table className="w-full text-sm">
                                <thead className="sticky top-0 bg-gray-200">
                                    <tr>
                                        {esAdminOStaff && (
                                            <>
                                                <th className="p-2 text-left">Alumno</th>
                                                <th className="p-2 text-left">DNI</th>
                                            </>
                                        )}
                                        <th className="p-2 text-center">Mes/Año</th>
                                        <th className="p-2 text-right">Monto</th>
                                        <th className="p-2 text-center">Vencimiento</th>
                                        <th className="p-2 text-center">Estado</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {cuotas.map(c => (
                                        <tr
                                            key={c.id}
                                            className={`border-b hover:bg-gray-50 ${
                                                !c.pagado && new Date(c.fecha_vencimiento) < new Date()
                                                    ? "bg-red-50"
                                                    : ""
                                            }`}
                                        >
                                            {esAdminOStaff && (
                                                <>
                                                    <td className="p-2">{c.apellido}, {c.nombre}</td>
                                                    <td className="p-2">{c.dni}</td>
                                                </>
                                            )}
                                            <td className="p-2 text-center">{c.mes}/{c.anio}</td>
                                            <td className="p-2 text-right font-mono">${c.monto}</td>
                                            <td className="p-2 text-center">
                                                {new Date(c.fecha_vencimiento).toLocaleDateString()}
                                            </td>
                                            <td className="p-2 text-center">
                                                {c.pagado ? (
                                                    <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold">
                                                        Pagado
                                                    </span>
                                                ) : (
                                                    <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-bold">
                                                        Pendiente
                                                    </span>
                                                )}
                                            </td>                                            
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