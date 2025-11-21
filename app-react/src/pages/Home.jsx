import { useNavigate } from "react-router-dom";

export default function Home() {
    const navigate = useNavigate();

    const nombre = localStorage.getItem("nombre");
    const rol = Number(localStorage.getItem("rol_id"));

    const logout = () => {
        localStorage.clear();
        navigate("/");
    };

    const Card = ({ title, description, action, disabled }) => (
        <div 
            className={`p-6 rounded-xl border shadow-md transition 
                ${disabled ? "bg-gray-200 cursor-not-allowed opacity-50" : "bg-white hover:shadow-xl cursor-pointer"}`}
            onClick={() => !disabled && action()}
        >
            <h2 className="text-lg font-bold">{title}</h2>
            <p className="text-gray-600 mt-1">{description}</p>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-100 p-8">

            {/* Encabezado */}
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">
                    Bienvenido {nombre}
                </h1>

                <button
                    className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                    onClick={logout}
                >
                    Cerrar Sesión
                </button>
            </div>

            {/* Opciones según rol */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                {/* Crear Usuario */}
                {(rol === 1 || rol === 2) && (
                    <Card
                        title="Crear Usuario"
                        description="Registrar un nuevo usuario del sistema"
                        action={() => navigate("/crear-usuario")}
                    />
                )}

                {/* Crear Plantilla */}
                {(rol === 1 || rol === 2) && (
                    <Card
                        title="Crear Plantilla"
                        description="Crear y guardar plantillas de mensaje"
                        action={() => navigate("/plantillas")}
                    />
                )}

                {/* Enviar Notificación */}
                {(rol === 1 || rol === 2) && (
                    <Card
                        title="Enviar Notificación"
                        description="Enviar una notificación usando una plantilla"
                        action={() => navigate("/enviar")}
                    />
                )}

                {/* Registrar Alumno en Curso */}
                {(rol === 1 || rol === 2) && (
                    <Card
                        title="Registrar Alumno en Curso"
                        description="Asignar alumnos a cursos disponibles"
                        action={() => navigate("/registrar-alumno")}
                    />
                )}

                {/* Configuración del Alumno */}
                {rol === 3 && (
                    <Card
                        title="Mis Preferencias"
                        description="Configurar qué notificaciones recibo"
                        action={() => navigate("/preferencias")}
                    />
                )}

            </div>

        </div>
    );
}
