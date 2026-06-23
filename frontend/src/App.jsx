import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Viajes from './pages/Viajes';
import ViajeForm from './pages/ViajeForm';
import NavBar from './components/NavBar';

function PrivateRoute({ children }) {
  return localStorage.getItem('asig_token') ? children : <Navigate to="/asignaciones/" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/asignaciones/" element={<Login />} />
        <Route path="/asignaciones/tablero" element={<PrivateRoute><NavBar /><Dashboard /></PrivateRoute>} />
        <Route path="/asignaciones/viajes" element={<PrivateRoute><NavBar /><Viajes /></PrivateRoute>} />
        <Route path="/asignaciones/viajes/nuevo" element={<PrivateRoute><NavBar /><ViajeForm /></PrivateRoute>} />
        <Route path="/asignaciones/viajes/:id/editar" element={<PrivateRoute><NavBar /><ViajeForm /></PrivateRoute>} />
      </Routes>
    </BrowserRouter>
  );
}
