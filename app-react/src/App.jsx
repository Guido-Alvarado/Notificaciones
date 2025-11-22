import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Login from './pages/Login'
import Home from './pages/Home'
import CrearUsuario from './pages/CrearUsuario'
import CrearPlantilla from './pages/CrearPlantilla'
import EnviarNotificacion from './pages/EnviarNotificacion'
import HistorialNotificaciones from './pages/HistorialNotificaciones'
import GestionCuotas from './pages/GestionCuotas'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/home" element={<Home />} />
        <Route path="/crear-usuario" element={<CrearUsuario />} />
        <Route path="/plantillas" element={<CrearPlantilla />} />
        <Route path="/enviar" element={<EnviarNotificacion />} />
        <Route path="/historial" element={<HistorialNotificaciones />} />
        <Route path="/cuotas" element={<GestionCuotas />} />
      </Routes>
    </BrowserRouter>
  );
}
