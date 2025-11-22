import { useState } from "react";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      console.log("[FRONT] Enviando login", { username });
      const res = await fetch("http://localhost:4000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });

      // Si status no es 2xx, intentamos leer el body y lanzamos error
      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        const msg = errBody?.error || errBody?.message || `HTTP ${res.status}`;
        setError(msg);
        console.error("[FRONT] login failed:", res.status, msg);
        setLoading(false);
        return;
      }

      const data = await res.json();
      console.log("[FRONT] respuesta login:", data);

      if (!data.ok) {
        setError(data.error || "Error de autenticación");
        setLoading(false);
        return;
      }

      // guardar token y usuario
      localStorage.setItem("token", data.token);
      localStorage.setItem("rol_id", data.usuario.rol_id);
      localStorage.setItem("nombre", data.usuario.nombre || data.usuario.username);

      // navegar
      window.location.href = "/home";

    } catch (err) {
      console.error("[FRONT] fetch error:", err);
      setError("No se pudo conectar al servidor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <form className="p-6 bg-white shadow-lg rounded-xl w-80" onSubmit={handleLogin}>
        <h1 className="text-xl font-bold mb-4 text-center">Iniciar Sesión</h1>

        {error && <div className="bg-red-100 text-red-700 p-2 rounded mb-3">{error}</div>}

        <input type="text" placeholder="Usuario o email" className="w-full p-2 border rounded mb-3"
               value={username} onChange={(e) => setUsername(e.target.value)} />

        <input type="password" placeholder="Contraseña" className="w-full p-2 border rounded mb-3"
               value={password} onChange={(e) => setPassword(e.target.value)} />

        <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700" disabled={loading}>
          {loading ? "Cargando..." : "Entrar"}
        </button>
      </form>
    </div>
  );
}
