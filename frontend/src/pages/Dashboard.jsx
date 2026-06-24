import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const DAYS_ES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const MONTHS_ES = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];

function fmtDay(iso) {
  const d = new Date(iso + 'T12:00:00');
  return `${DAYS_ES[d.getDay()]} ${d.getDate()} ${MONTHS_ES[d.getMonth()]}`;
}

function isToday(iso) {
  return iso === new Date().toISOString().split('T')[0];
}

function mondayOf(date) {
  const d = new Date(date);
  const day = d.getDay();
  d.setDate(d.getDate() - (day === 0 ? 6 : day - 1));
  return d.toISOString().split('T')[0];
}

export default function Dashboard() {
  const [week, setWeek] = useState(mondayOf(new Date()));
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const nav = useNavigate();

  useEffect(() => {
    setLoading(true);
    api.get(`/dispatch?week=${week}`)
      .then(r => setData(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [week]);

  const prevWeek = () => {
    const d = new Date(week);
    d.setDate(d.getDate() - 7);
    setWeek(d.toISOString().split('T')[0]);
  };
  const nextWeek = () => {
    const d = new Date(week);
    d.setDate(d.getDate() + 7);
    setWeek(d.toISOString().split('T')[0]);
  };
  const goToday = () => setWeek(mondayOf(new Date()));

  const weekLabel = () => {
    if (!data) return '';
    const s = new Date(data.days[0] + 'T12:00:00');
    const e = new Date(data.days[6] + 'T12:00:00');
    return `${s.getDate()} ${MONTHS_ES[s.getMonth()]} — ${e.getDate()} ${MONTHS_ES[e.getMonth()]} ${e.getFullYear()}`;
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Tablero de Despacho — Equipo Disponible</h1>
        <button className="btn btn-primary" onClick={() => nav('/asignaciones/viajes/nuevo')}>
          + Nueva Asignación
        </button>
      </div>

      <div className="dispatch-nav">
        <button className="btn btn-secondary" onClick={prevWeek}>← Anterior</button>
        <span className="dispatch-week">{weekLabel()}</span>
        <button className="btn btn-secondary" onClick={nextWeek}>Siguiente →</button>
        <button className="btn btn-secondary" onClick={goToday}>Hoy</button>
      </div>

      <div className="card">
        {loading ? (
          <div className="loading">Cargando tablero...</div>
        ) : !data ? (
          <div className="empty-state">Error al cargar datos</div>
        ) : (
          <div className="dispatch-table-wrap">
            <table className="dispatch-table">
              <thead>
                <tr>
                  <th className="col-zona">DESTINO</th>
                  <th className="col-firma">TOTAL</th>
                  {data.days.map(d => (
                    <th key={d} style={isToday(d) ? { background: '#f5a623', color: '#1a1a2e' } : {}}>
                      {fmtDay(d)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.board.map(zona => (
                  <tr key={zona.nombre}>
                    <td className="col-zona">{zona.nombre.toUpperCase()}</td>
                    <td className="col-firma">{zona.enFirma > 0 ? zona.enFirma : '—'}</td>
                    {data.days.map(d => (
                      <td key={d} style={isToday(d) ? { background: '#fffbf0' } : {}}>
                        {zona.units[d]?.map(u => (
                          <span
                            key={u.id}
                            className="unit-chip"
                            title={`Viene de: ${u.origen}`}
                            onClick={() => nav(`/asignaciones/viajes/${u.id}/editar`)}
                          >
                            {u.tracto}
                          </span>
                        ))}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div style={{ marginTop: 12, fontSize: 12, color: '#aaa' }}>
        Los tractos se muestran en la zona destino el día de su cita de descarga. Click en un tracto para ver el viaje.
      </div>
    </div>
  );
}
