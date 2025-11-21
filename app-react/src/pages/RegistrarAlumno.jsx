import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function RegistrarAlumno() {
  const navigate = useNavigate();

  const [alumnos, setAlumnos] = useState([]);
  const [cursos, setCursos] = useState([]);
  const [alumnoSeleccionado, setAlumnoSeleccionado] = useState("");
  const [cursoSeleccionado, setCursoSeleccionado] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");

        const alumnosRes = await fetch("http://localhost:4000/alumnos/no-asignados", {
          headers: { Authorization: `Bearer ${token}` }
        });
        const alumnosData = await alumnosRes.json();
        setAlumnos(alumnosData);

        const cursosRes = await fetch("http://localhost:4000/alumnos/cursos-disponibles", {
          headers: { Authorization: `Bearer ${token}` }
        });
        const cursosData = await cursosRes.json();
        setCursos(cursosData);

      } catch (err) {
        console.error(err);
        setError("Error cargando datos");
      }
    };

    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje("");
    setError("");

    if (!alumnoSeleccionado || !cursoSeleccionado) {
      setError("Seleccioná un alumno y un curso");
      return;
    }

    try {
      const token = localStorage.getItem("token");

      const res = await fetch("http://localhost:4000/alumnos/registrar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          alumno_id: alumnoSeleccionado,
          curso_id: cursoSeleccionado
        })
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Error al registrar alumno");
        return;
      }

      setMensaje("Alumno registrado correctamente ✔");
      setAlumnos(alumnos.filter(a => a.id !== alumnoSeleccionado));
      setAlumnoSeleccionado("");
      setCursoSeleccionado("");

    } catch (err) {
      console.error(err);
      setError("Error de conexión con el servidor");
    }
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-100 p-4">
      <div className="self-start mb-4">
        <button
          onClick={() => navigate("/home")}
          className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
        >
          ← Volver
        </button>
      </div>

      <form 
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md"
      >
        <h1 className="text-2xl font-bold mb-6 text-center">
          Registrar Alumno en Curso
        </h1>

        {mensaje && <div className="bg-green-100 text-green-700 p-2 rounded mb-3">{mensaje}</div>}
        {error && <div className="bg-red-100 text-red-700 p-2 rounded mb-3">{error}</div>}

        <select
          className="w-full p-2 border rounded mb-3"
          value={alumnoSeleccionado}
          onChange={e => setAlumnoSeleccionado(e.target.value)}
        >
          <option value="">Seleccioná un alumno</option>
          {alumnos.map(a => (
            <option key={a.id} value={a.id}>
              {a.nombre} {a.apellido} ({a.dni})
            </option>
          ))}
        </select>

        <select
          className="w-full p-2 border rounded mb-3"
          value={cursoSeleccionado}
          onChange={e => setCursoSeleccionado(e.target.value)}
        >
          <option value="">Seleccioná un curso</option>
          {cursos.map(c => (
            <option key={c.id} value={c.id}>
              {c.nombre}
            </option>
          ))}
        </select>

        <button
          className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
        >
          Registrar Alumno
        </button>
      </form>
    </div>
  );
}
