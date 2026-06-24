import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api';
import ClienteSelect from '../components/ClienteSelect';
import { ESTADOS, ESTADOS_CIUDADES } from '../data/mexico';

const ESTATUS_OPTIONS = ['PENDIENTE', 'CUBIERTO', 'FINALIZADO', 'CANCELADO'];

const EMPTY = {
  cliente_id: null, no_solicitud: '', cliente_paga: '',
  zona_origen: '', ciudad_origen: '', cliente_carga: '', ubicacion_carga: '', cita_carga: '',
  zona_destino: '', ciudad_destino: '', cliente_descarga: '', ubicacion_descarga: '', cita_descarga: '',
  operador: '', tracto: '', remolque: '', folio_remision: '', carta_porte: '',
  estatus: 'PENDIENTE', coordinador: '', notas: '',
};

function toInputDT(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  const pad = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

// Defined OUTSIDE the component so React doesn't remount on every keystroke
function Field({ label, name, type = 'text', as, value, onChange, uppercase }) {
  const handle = (val) => onChange(name, uppercase ? val.toUpperCase() : val);
  return (
    <div className="field">
      <label>{label}</label>
      {as === 'estatus' ? (
        <select value={value} onChange={e => handle(e.target.value)}>
          {ESTATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      ) : as === 'textarea' ? (
        <textarea value={value} onChange={e => handle(e.target.value)} />
      ) : (
        <input type={type} value={value} onChange={e => handle(e.target.value)} />
      )}
    </div>
  );
}

function ZonaCiudad({ zonaLabel, ciudadLabel, zonaName, ciudadName, zonaValue, ciudadValue, onChange }) {
  const ciudades = zonaValue ? (ESTADOS_CIUDADES[zonaValue] || []) : [];
  return (
    <>
      <div className="field">
        <label>{zonaLabel}</label>
        <select value={zonaValue} onChange={e => { onChange(zonaName, e.target.value); onChange(ciudadName, ''); }}>
          <option value="">— Seleccionar estado —</option>
          {ESTADOS.map(e => <option key={e} value={e}>{e}</option>)}
        </select>
      </div>
      <div className="field">
        <label>{ciudadLabel}</label>
        {zonaValue ? (
          <select value={ciudadValue} onChange={e => onChange(ciudadName, e.target.value)}>
            <option value="">— Seleccionar ciudad —</option>
            {ciudades.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        ) : (
          <input type="text" value={ciudadValue} disabled placeholder="Selecciona un estado primero" style={{ color: '#aaa' }} />
        )}
      </div>
    </>
  );
}

export default function ViajeForm() {
  const { id } = useParams();
  const nav = useNavigate();
  const [form, setForm] = useState(EMPTY);
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const isEdit = Boolean(id);

  useEffect(() => {
    api.get('/clientes').then(r => setClientes(r.data)).catch(() => {});
    if (isEdit) {
      api.get(`/viajes/${id}`).then(r => {
        const v = r.data;
        setForm({
          ...v,
          cita_carga: toInputDT(v.cita_carga),
          cita_descarga: toInputDT(v.cita_descarga),
        });
      }).catch(() => setError('No se pudo cargar el viaje'));
    }
  }, [id]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isEdit) {
        await api.put(`/viajes/${id}`, form);
      } else {
        await api.post('/viajes', form);
      }
      nav('/asignaciones/viajes');
    } catch (err) {
      setError(err.response?.data?.error || 'Error al guardar');
    } finally {
      setLoading(false);
    }
  };

  const f = (name, extra = {}) => ({
    name,
    value: form[name] || '',
    onChange: set,
    ...extra,
  });

  return (
    <div className="page form-page">
      <div className="page-header">
        <h1 className="page-title">{isEdit ? 'Editar Viaje' : 'Nueva Asignación'}</h1>
        <button className="btn btn-secondary" onClick={() => nav('/asignaciones/viajes')}>← Regresar</button>
      </div>

      {error && <div className="error-msg">{error}</div>}

      <div className="card">
        <form onSubmit={submit}>
          <div className="form-grid">

            {/* ── GENERAL ── */}
            <div className="form-section form-full">
              <div className="form-section-title">General</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
                <Field label="No. Solicitud" {...f('no_solicitud')} />
                <Field label="Coordinador" {...f('coordinador')} />
                <div className="field">
                  <label>Cliente</label>
                  <ClienteSelect
                    value={form.cliente_id}
                    onChange={id => set('cliente_id', id)}
                    clientes={clientes}
                    onClienteAdded={c => setClientes(prev => [...prev, c].sort((a,b) => a.nombre.localeCompare(b.nombre)))}
                  />
                </div>
              </div>
            </div>

            {/* ── ORIGEN ── */}
            <div className="form-section">
              <div className="form-section-title orange">Origen</div>
              <ZonaCiudad
                zonaLabel="Estado origen" ciudadLabel="Ciudad origen"
                zonaName="zona_origen" ciudadName="ciudad_origen"
                zonaValue={form.zona_origen} ciudadValue={form.ciudad_origen}
                onChange={set}
              />
              <Field label="Cliente carga" {...f('cliente_carga')} uppercase />
              <Field label="Ubicación carga" {...f('ubicacion_carga', { as: 'textarea' })} />
              <Field label="Cita de carga" {...f('cita_carga', { type: 'datetime-local' })} />
            </div>

            {/* ── DESTINO ── */}
            <div className="form-section">
              <div className="form-section-title blue">Destino</div>
              <ZonaCiudad
                zonaLabel="Estado destino" ciudadLabel="Ciudad destino"
                zonaName="zona_destino" ciudadName="ciudad_destino"
                zonaValue={form.zona_destino} ciudadValue={form.ciudad_destino}
                onChange={set}
              />
              <Field label="Cliente descarga" {...f('cliente_descarga')} uppercase />
              <Field label="Ubicación descarga" {...f('ubicacion_descarga', { as: 'textarea' })} />
              <Field label="Cita de descarga" {...f('cita_descarga', { type: 'datetime-local' })} />
            </div>

            {/* ── UNIDAD ── */}
            <div className="form-section">
              <div className="form-section-title green">Unidad</div>
              <Field label="Operador" {...f('operador')} />
              <Field label="Tracto (ej. TT3248)" {...f('tracto')} />
              <Field label="Remolque (ej. RS1089)" {...f('remolque')} />
              <Field label="Folio / Remisión" {...f('folio_remision')} />
              <Field label="Carta Porte" {...f('carta_porte')} />
            </div>

            {/* ── STATUS ── */}
            <div className="form-section">
              <div className="form-section-title">Estatus</div>
              <Field label="Estatus" {...f('estatus', { as: 'estatus' })} />
              <Field label="Notas" {...f('notas', { as: 'textarea' })} />
            </div>

          </div>

          <div className="form-footer">
            <button type="button" className="btn btn-secondary" onClick={() => nav('/asignaciones/viajes')}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Crear viaje'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
