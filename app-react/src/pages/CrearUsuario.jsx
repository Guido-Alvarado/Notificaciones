import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function CrearUsuario() {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        nombre: "",
        apellido: "",
        dni: "",
        email: "",
        username: "",
        password: "",
        telefono: "",
        rol_id: 3, // default alumno
    });

    const [mensaje, setMensaje] = useState("");
    const [error, setError] = useState("");

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMensaje("");
        setError("");

        try {
            const res = await fetch("http://localhost:4000/usuarios/crear", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + localStorage.getItem("token")
                },
                body: JSON.stringify(form)
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || "Error al crear usuario");
                return;
            }

            setMensaje("Usuario creado correctamente ✔");

            setForm({
                nombre: "",
                apellido: "",
                dni: "",
                email: "",
                username: "",
                password: "",
                telefono: "",
                rol_id: 3
            });

        } catch (err) {
            setError("Error de conexión con el servidor");
        }
    };

    return (
        <div className="flex flex-col items-center min-h-screen bg-gray-100 p-4">
            {/* Botón volver */}
            <div className="self-start mb-4">
                <button
                    onClick={() => navigate("/home")}
                    className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                >
                    ← Volver
                </button>
            </div>

            {/* Formulario */}
            <form 
                onSubmit={handleSubmit}
                className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md"
            >
                <h1 className="text-2xl font-bold mb-6 text-center">
                    Crear Usuario
                </h1>

                {mensaje && (
                    <div className="bg-green-100 text-green-700 p-2 rounded mb-3">
                        {mensaje}
                    </div>
                )}
                {error && (
                    <div className="bg-red-100 text-red-700 p-2 rounded mb-3">
                        {error}
                    </div>
                )}

                {/* Inputs */}
                <input
                    type="text"
                    name="nombre"
                    placeholder="Nombre"
                    className="w-full p-2 border rounded mb-3"
                    value={form.nombre}
                    onChange={handleChange}
                    required
                />

                <input
                    type="text"
                    name="apellido"
                    placeholder="Apellido"
                    className="w-full p-2 border rounded mb-3"
                    value={form.apellido}
                    onChange={handleChange}
                    required
                />

                <input
                    type="text"
                    name="dni"
                    placeholder="DNI"
                    className="w-full p-2 border rounded mb-3"
                    value={form.dni}
                    onChange={handleChange}
                    required
                />

                <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    className="w-full p-2 border rounded mb-3"
                    value={form.email}
                    onChange={handleChange}
                    required
                />

                <input
                    type="text"
                    name="username"
                    placeholder="Nombre de usuario"
                    className="w-full p-2 border rounded mb-3"
                    value={form.username}
                    onChange={handleChange}
                    required
                />

                <input
                    type="password"
                    name="password"
                    placeholder="Contraseña"
                    className="w-full p-2 border rounded mb-3"
                    value={form.password}
                    onChange={handleChange}
                    required
                />

                <input
                    type="text"
                    name="telefono"
                    placeholder="Teléfono (opcional)"
                    className="w-full p-2 border rounded mb-3"
                    value={form.telefono}
                    onChange={handleChange}
                />

                <select
                    name="rol_id"
                    className="w-full p-2 border rounded mb-3"
                    value={form.rol_id}
                    onChange={handleChange}
                >
                    <option value={2}>Moderador</option>
                    <option value={3}>Alumno</option>
                </select>

                <button
                    className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
                >
                    Crear Usuario
                </button>
            </form>
        </div>
    );
}
