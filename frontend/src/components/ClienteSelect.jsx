import { useState, useRef, useEffect } from 'react';
import api from '../api';

export default function ClienteSelect({ value, onChange, clientes, onClienteAdded }) {
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const wrapRef = useRef(null);

  const selected = clientes.find(c => c.id === value);

  const filtered = search
    ? clientes.filter(c => c.nombre.toLowerCase().includes(search.toLowerCase()))
    : clientes;

  useEffect(() => {
    const handler = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpen(false);
        setSearch('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const select = (c) => {
    onChange(c.id);
    setOpen(false);
    setSearch('');
  };

  const clear = (e) => {
    e.stopPropagation();
    onChange(null);
  };

  const saveNew = async () => {
    if (!newName.trim()) return;
    setSaving(true);
    setError('');
    try {
      const { data } = await api.post('/clientes', { nombre: newName.trim() });
      onClienteAdded(data);
      onChange(data.id);
      setAdding(false);
      setNewName('');
      setOpen(false);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="cliente-select" ref={wrapRef}>
      <div className="cs-trigger" onClick={() => { setOpen(o => !o); setSearch(''); }}>
        <span className={selected ? 'cs-value' : 'cs-placeholder'}>
          {selected ? selected.nombre : '— Seleccionar cliente —'}
        </span>
        <div className="cs-actions">
          {selected && <span className="cs-clear" onClick={clear}>✕</span>}
          <span className="cs-arrow">{open ? '▲' : '▼'}</span>
        </div>
      </div>

      {open && (
        <div className="cs-dropdown">
          <input
            className="cs-search"
            placeholder="Buscar cliente..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            autoFocus
          />
          <div className="cs-list">
            {filtered.length === 0 ? (
              <div className="cs-empty">Sin resultados</div>
            ) : (
              filtered.map(c => (
                <div
                  key={c.id}
                  className={`cs-option${c.id === value ? ' cs-selected' : ''}`}
                  onClick={() => select(c)}
                >
                  {c.nombre}
                </div>
              ))
            )}
          </div>
          <div className="cs-add-wrap">
            {adding ? (
              <div className="cs-add-form">
                <input
                  placeholder="Nombre del cliente..."
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && saveNew()}
                  autoFocus
                />
                {error && <div className="cs-error">{error}</div>}
                <div className="cs-add-btns">
                  <button onClick={saveNew} disabled={saving} className="btn btn-primary btn-sm">
                    {saving ? '...' : 'Guardar'}
                  </button>
                  <button onClick={() => { setAdding(false); setNewName(''); setError(''); }} className="btn btn-secondary btn-sm">
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <button className="cs-add-btn" onClick={() => setAdding(true)}>
                + Agregar nuevo cliente
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
