import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import StatusBadge from '../components/StatusBadge';

const ESTATUS = ['', 'PENDIENTE', 'CUBIERTO', 'FINALIZADO', 'CANCELADO'];

function fmtDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' });
}
function fmtDateTime(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleString('es-MX', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
}

export default function Viajes() {
  const [filters, setFilters] = useState({ estatus: '', zona: '', desde: '', hasta: '', q: '' });
  const [page, setPage] = useState(1);
  const [data, setData] = useState({ data: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [zonas, setZonas] = useState([]);
  const nav = useNavigate();

  useEffect(() => {
    api.get('/zonas').then(r => setZonas(r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ page, limit: 50 });
    if (filters.estatus) params.set('estatus', filters.estatus);
    if (filters.zona) params.set('zona', filters.zona);
    if (filters.desde) params.set('desde', filters.desde);
    if (filters.hasta) params.set('hasta', filters.hasta);
    if (filters.q) params.set('q', filters.q);
    api.get(`/viajes?${params}`)
      .then(r => setData(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [filters, page]);

  const setFilter = (k, v) => { setFilters(f => ({ ...f, [k]: v })); setPage(1); };

  const remove = async (id) => {
    if (!confirm('¿Eliminar este viaje?')) return;
    await api.delete(`/viajes/${id}`);
    setFilters(f => ({ ...f }));
  };

  const totalPages = Math.ceil(data.total / 50);

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Viajes — {data.total} registros</h1>
        <button className="btn btn-primary" onClick={() => nav('/asignaciones/viajes/nuevo')}>
          + Nuevo Viaje
        </button>
      </div>

      <div className="card">
        <div className="filters-bar">
          <div className="filter-group">
            <label>Buscar</label>
            <input className="filter-search" placeholder="Cliente, ciudad, tracto..." value={filters.q}
              onChange={e => setFilter('q', e.target.value)} />
          </div>
          <div className="filter-group">
            <label>Estatus</label>
            <select value={filters.estatus} onChange={e => setFilter('estatus', e.target.value)}>
              {ESTATUS.map(s => <option key={s} value={s}>{s || 'Todos'}</option>)}
            </select>
          </div>
          <div className="filter-group">
            <label>Zona</label>
            <select value={filters.zona} onChange={e => setFilter('zona', e.target.value)}>
              <option value="">Todas</option>
              {zonas.map(z => <option key={z.id} value={z.nombre}>{z.nombre}</option>)}
            </select>
          </div>
          <div className="filter-group">
            <label>Cita carga desde</label>
            <input type="date" value={filters.desde} onChange={e => setFilter('desde', e.target.value)} />
          </div>
          <div className="filter-group">
            <label>Cita carga hasta</label>
            <input type="date" value={filters.hasta} onChange={e => setFilter('hasta', e.target.value)} />
          </div>
          {(filters.estatus || filters.zona || filters.desde || filters.hasta || filters.q) && (
            <button className="btn btn-secondary btn-sm" style={{ alignSelf: 'flex-end' }}
              onClick={() => { setFilters({ estatus: '', zona: '', desde: '', hasta: '', q: '' }); setPage(1); }}>
              Limpiar
            </button>
          )}
        </div>

        {loading ? (
          <div className="loading">Cargando...</div>
        ) : data.data.length === 0 ? (
          <div className="empty-state">No hay viajes con estos filtros</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Cliente</th>
                  <th>Ruta</th>
                  <th>Cita Carga</th>
                  <th>Cita Descarga</th>
                  <th>Tracto</th>
                  <th>Remolque</th>
                  <th>Operador</th>
                  <th>Estatus</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {data.data.map(v => (
                  <tr key={v.id}>
                    <td className="td-mono">{v.no_solicitud || v.id}</td>
                    <td style={{ maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {v.cliente_nombre || <span className="td-muted">—</span>}
                    </td>
                    <td>
                      <div className="td-route">
                        <span className="city">{v.ciudad_origen || '—'}</span>
                        <span className="arrow">→</span>
                        <span className="city">{v.ciudad_destino || '—'}</span>
                      </div>
                      <div style={{ fontSize: 11, color: '#aaa' }}>
                        {v.zona_origen || ''}{v.zona_origen && v.zona_destino ? ' → ' : ''}{v.zona_destino || ''}
                      </div>
                    </td>
                    <td style={{ whiteSpace: 'nowrap' }}>{fmtDateTime(v.cita_carga)}</td>
                    <td style={{ whiteSpace: 'nowrap' }}>{fmtDateTime(v.cita_descarga)}</td>
                    <td className="td-mono">{v.tracto || <span className="td-muted">—</span>}</td>
                    <td className="td-mono">{v.remolque || <span className="td-muted">—</span>}</td>
                    <td style={{ maxWidth: 130, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {v.operador || <span className="td-muted">—</span>}
                    </td>
                    <td><StatusBadge estatus={v.estatus} /></td>
                    <td>
                      <div className="actions-cell">
                        <button className="btn btn-secondary btn-sm"
                          onClick={() => nav(`/asignaciones/viajes/${v.id}/editar`)}>Editar</button>
                        <button className="btn btn-danger btn-sm" onClick={() => remove(v.id)}>✕</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="pagination">
            <button className="btn btn-secondary btn-sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>←</button>
            <span>Página {page} de {totalPages}</span>
            <button className="btn btn-secondary btn-sm" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>→</button>
          </div>
        )}
      </div>
    </div>
  );
}
