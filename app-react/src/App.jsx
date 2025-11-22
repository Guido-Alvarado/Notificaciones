import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Login from './pages/Login'
import Home from './pages/Home'
import CrearUsuario from './pages/CrearUsuario'
import CrearPlantilla from './pages/CrearPlantilla'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/home" element={<Home />} />
        <Route path="/crear-usuario" element={<CrearUsuario />} />
        <Route path="/plantillas" element={<CrearPlantilla />} />
      </Routes>
    </BrowserRouter>
  );
}
