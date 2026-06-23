import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

export default function Login() {
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  if (localStorage.getItem('asig_token')) {
    nav('/asignaciones/tablero', { replace: true });
    return null;
  }

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', form);
      localStorage.setItem('asig_token', data.token);
      nav('/asignaciones/tablero');
    } catch {
      setError('Usuario o contraseña incorrectos');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrap">
      <div className="login-card">
        <div className="login-logo">
          <h1>Asignaciones</h1>
          <p>GST Transportes</p>
        </div>
        <form onSubmit={submit}>
          <label>Usuario</label>
          <input
            type="text"
            placeholder="usuario"
            value={form.username}
            onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
            autoFocus
          />
          <label>Contraseña</label>
          <input
            type="password"
            placeholder="••••••••"
            value={form.password}
            onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
          />
          {error && <div className="login-error">{error}</div>}
          <button className="login-btn" style={{ marginTop: 8 }} disabled={loading}>
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  );
}
