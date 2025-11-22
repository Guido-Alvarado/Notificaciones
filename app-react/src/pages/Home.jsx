import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

export default function Home() {
    const navigate = useNavigate();

    const nombre = localStorage.getItem("nombre");
    const rol = Number(localStorage.getItem("rol_id"));

    const logout = () => {
        localStorage.clear();
        navigate("/");
    };

    const [preferencias, setPreferencias] = useState(null);

    // -----------EJEMPLOS NO FUNCIONAL----------
    useEffect(() => {
        if (rol === 3) { // Solo para Alumno
            const mockPrefs = {
                canales: { app: true, email: true, sms: false, whatsapp: true },
                eventos: { proximo_vencimiento: true, vencido: false, pago_confirmado: true },
                dnd: { desde: 22, hasta: 7 },
            };
            setPreferencias(mockPrefs);
        }
    }, [rol]);
    // -----------EJEMPLOS NO FUNCIONAL----------

    const Tarjeta = ({ titulo, descripcion, accion, deshabilitado }) => (
        <div 
            className={`p-6 rounded-xl border shadow-md transition 
                ${deshabilitado ? "bg-gray-200 cursor-not-allowed opacity-50" : "bg-white hover:shadow-xl cursor-pointer"}`}
            onClick={() => !deshabilitado && accion()}
        >
            <h2 className="text-lg font-bold">{titulo}</h2>
            <p className="text-gray-600 mt-1">{descripcion}</p>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-100 p-8">

            {/* Encabezado */}
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Bienvenido {nombre}</h1>
                <button
                    className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                    onClick={logout}
                >
                    Cerrar Sesión
                </button>
            </div>

            {/* Opciones según rol */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {(rol === 1 || rol === 2) && (
                    <>
                        <Tarjeta
                            titulo="Crear Usuario"
                            descripcion="Registrar un nuevo usuario del sistema"
                            accion={() => navigate("/crear-usuario")}
                        />
                        <Tarjeta
                            titulo="Crear Plantilla"
                            descripcion="Crear y guardar plantillas de mensaje"
                            accion={() => navigate("/plantillas")}
                        />
                        <Tarjeta
                            titulo="Enviar Notificación"
                            descripcion="Enviar una notificación usando una plantilla"
                            accion={() => navigate("/enviar")}
                        />
                    </>
                )}

                {rol === 3 && (
                    <Tarjeta
                        titulo="Mis Preferencias"
                        descripcion="Configurar qué notificaciones recibo"
                        accion={() => {}}
                        deshabilitado={true}
                    />
                )}
            </div>

            <div className="flex flex-col md:flex-row gap-6">

                {/* Panel de Preferencias */}
                {rol === 3 && preferencias ? (
                    <div className="bg-white p-6 rounded-xl shadow-md space-y-6 w-full md:w-5/12 max-w-md">
                        <h2 className="text-xl font-bold mb-4">Mis Preferencias de Notificación</h2>

                        {/* Canales */}
                        <div>
                            <h3 className="font-semibold mb-2">Canales</h3>
                            {Object.keys(preferencias.canales).map(key => (
                                <label key={key} className="flex items-center p-2 border rounded-md mt-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={preferencias.canales[key]}
                                        onChange={() =>
                                            setPreferencias(prev => ({
                                                ...prev,
                                                canales: { ...prev.canales, [key]: !prev.canales[key] }
                                            }))
                                        }
                                        className="w-5 h-5 mr-2" // tilde un poco más grande y margen reducido
                                    />
                                    {key.charAt(0).toUpperCase() + key.slice(1)}
                                </label>
                            ))}
                        </div>

                        {/* Eventos */}
                        <div>
                            <h3 className="font-semibold mb-2">Eventos</h3>
                            {Object.keys(preferencias.eventos).map(key => (
                                <label key={key} className="flex items-center p-2 border rounded-md mt-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={preferencias.eventos[key]}
                                        onChange={() =>
                                            setPreferencias(prev => ({
                                                ...prev,
                                                eventos: { ...prev.eventos, [key]: !prev.eventos[key] }
                                            }))
                                        }
                                        className="w-5 h-5 mr-2"
                                    />
                                    {key.replace("_"," ")}
                                </label>
                            ))}
                        </div>

                        {/* Horario No Molestar */}
                        <div>
                            <h3 className="font-semibold mb-2">Horario "No Molestar"</h3>
                            <div className="flex gap-2 items-center mt-2">
                                <span>Desde:</span>
                                <select
                                    value={preferencias.dnd.desde}
                                    onChange={e =>
                                        setPreferencias(prev => ({
                                            ...prev,
                                            dnd: { ...prev.dnd, desde: Number(e.target.value) }
                                        }))
                                    }
                                    className="border rounded px-2 py-1"
                                >
                                    {Array.from({ length: 24 }, (_, i) => (
                                        <option key={i} value={i}>{i}:00</option>
                                    ))}
                                </select>

                                <span>Hasta:</span>
                                <select
                                    value={preferencias.dnd.hasta}
                                    onChange={e =>
                                        setPreferencias(prev => ({
                                            ...prev,
                                            dnd: { ...prev.dnd, hasta: Number(e.target.value) }
                                        }))
                                    }
                                    className="border rounded px-2 py-1"
                                >
                                    {Array.from({ length: 24 }, (_, i) => (
                                        <option key={i} value={i}>{i}:00</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                ) : rol === 3 ? (
                    <p>Cargando preferencias...</p>
                ) : null}

                {/* Panel de Notificaciones */}
                <div className="bg-white p-6 rounded-xl shadow-md space-y-4 w-full md:w-5/12 max-w-md">
                    <h2 className="text-xl font-bold mb-4">Notificaciones</h2>

                    {/* Ejemplo hardcodeado */}
                    <div className="p-3 border rounded-md bg-gray-50 text-gray-800">
                        Notificación de ejemplo {/* Ejemplo hardcodeado */}
                    </div>

                </div>

            </div>

        </div>
    );
}
