import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Login from './pages/Login'
import Home from './pages/Home'
import CrearUsuario from './pages/CrearUsuario'
import RegistrarAlumno from './pages/RegistrarAlumno';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/home" element={<Home />} />
        <Route path="/crear-usuario" element={<CrearUsuario />} />
        <Route path="/registrar-alumno" element={<RegistrarAlumno />} />
      </Routes>
    </BrowserRouter>
  );
}
