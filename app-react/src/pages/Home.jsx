import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import logoIsdem from "../assets/logo_isdem.jpg";

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
                <div className="flex items-center gap-4">  
                    <img  
                        src={logoIsdem}  
                        alt="Logo ISDeM"  
                        className="w-16 h-16 object-contain"  
                    />  
                    <div>  
                        <h1 className="text-3xl font-bold">Bienvenido {nombre}</h1>  
                        <p className="text-sm text-gray-600">Instituto Superior del Milagro - Salta</p>  
                    </div>  
                </div>
            
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
                            titulo="👤 Crear Usuario"
                            descripcion="Registrar un nuevo usuario del sistema"
                            accion={() => navigate("/crear-usuario")}
                        />
                        <Tarjeta
                            titulo="📝 Gestionar Plantillas"
                            descripcion="Crear y editar plantillas de mensajes"
                            accion={() => navigate("/plantillas")}
                        />
                        <Tarjeta
                            titulo="📤 Enviar Notificación"
                            descripcion="Enviar notificaciones individuales o masivas"
                            accion={() => navigate("/enviar")}
                        />
                        <Tarjeta
                            titulo="📊 Historial"
                            descripcion="Ver historial de notificaciones enviadas"
                            accion={() => navigate("/historial")}
                        />
                        <Tarjeta
                            titulo="💰 Gestión de Cuotas"
                            descripcion="Ver y administrar cuotas de alumnos"
                            accion={() => navigate("/cuotas")}
                        />
                    </>
                )}

                {rol === 3 && (
                    <>
                        <Tarjeta
                            titulo="📊 Mis Cuotas"
                            descripcion="Ver el estado de mis cuotas"
                            accion={() => navigate("/cuotas")}
                        />
                        <Tarjeta
                            titulo="🔔 Mis Notificaciones"
                            descripcion="Ver mis notificaciones recibidas"
                            accion={() => navigate("/historial")}
                        />
                        <Tarjeta
                            titulo="⚙️ Mis Preferencias"
                            descripcion="Configurar qué notificaciones recibo"
                            accion={() => {}}
                            deshabilitado={true}
                        />
                    </>
                )}
            </div>              

        </div>
    );
}
