import { NavLink, useNavigate } from 'react-router-dom';

export default function NavBar() {
  const nav = useNavigate();
  const logout = () => { localStorage.removeItem('asig_token'); nav('/asignaciones/'); };

  return (
    <nav className="navbar">
      <span className="navbar-logo">GST</span>
      <NavLink to="/asignaciones/tablero" className={({ isActive }) => isActive ? 'active' : ''}>Tablero</NavLink>
      <NavLink to="/asignaciones/viajes" className={({ isActive }) => isActive ? 'active' : ''}>Viajes</NavLink>
      <div className="navbar-spacer" />
      <span style={{ color: '#888', fontSize: 12, marginRight: 8 }}>Asignaciones</span>
      <button className="navbar-logout" onClick={logout}>Salir</button>
    </nav>
  );
}
