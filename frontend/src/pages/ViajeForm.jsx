import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api';

const ESTATUS_OPTIONS = ['PENDIENTE', 'CUBIERTO', 'FINALIZADO', 'CANCELADO'];

const EMPTY = {
  no_solicitud: '', cliente_paga: '',
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

export default function ViajeForm() {
  const { id } = useParams();
  const nav = useNavigate();
  const [form, setForm] = useState(EMPTY);
  const [zonas, setZonas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const isEdit = Boolean(id);

  useEffect(() => {
    api.get('/zonas').then(r => setZonas(r.data)).catch(() => {});
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

  const Field = ({ label, name, type = 'text', as }) => (
    <div className="field">
      <label>{label}</label>
      {as === 'select' ? (
        <select value={form[name] || ''} onChange={e => set(name, e.target.value)}>
          <option value="">— Seleccionar —</option>
          {zonas.map(z => <option key={z.id} value={z.nombre}>{z.nombre}</option>)}
        </select>
      ) : as === 'estatus' ? (
        <select value={form[name] || ''} onChange={e => set(name, e.target.value)}>
          {ESTATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      ) : as === 'textarea' ? (
        <textarea value={form[name] || ''} onChange={e => set(name, e.target.value)} />
      ) : (
        <input type={type} value={form[name] || ''} onChange={e => set(name, e.target.value)} />
      )}
    </div>
  );

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
                <Field label="No. Solicitud" name="no_solicitud" />
                <Field label="Cliente que paga" name="cliente_paga" />
                <Field label="Coordinador" name="coordinador" />
              </div>
            </div>

            {/* ── ORIGEN ── */}
            <div className="form-section">
              <div className="form-section-title orange">Origen</div>
              <Field label="Zona origen" name="zona_origen" as="select" />
              <Field label="Ciudad origen" name="ciudad_origen" />
              <Field label="Cliente carga" name="cliente_carga" />
              <Field label="Ubicación carga" name="ubicacion_carga" as="textarea" />
              <Field label="Cita de carga" name="cita_carga" type="datetime-local" />
            </div>

            {/* ── DESTINO ── */}
            <div className="form-section">
              <div className="form-section-title blue">Destino</div>
              <Field label="Zona destino" name="zona_destino" as="select" />
              <Field label="Ciudad destino" name="ciudad_destino" />
              <Field label="Cliente descarga" name="cliente_descarga" />
              <Field label="Ubicación descarga" name="ubicacion_descarga" as="textarea" />
              <Field label="Cita de descarga" name="cita_descarga" type="datetime-local" />
            </div>

            {/* ── UNIDAD ── */}
            <div className="form-section">
              <div className="form-section-title green">Unidad</div>
              <Field label="Operador" name="operador" />
              <Field label="Tracto (ej. TT3248)" name="tracto" />
              <Field label="Remolque (ej. RS1089)" name="remolque" />
              <Field label="Folio / Remisión" name="folio_remision" />
              <Field label="Carta Porte" name="carta_porte" />
            </div>

            {/* ── STATUS ── */}
            <div className="form-section">
              <div className="form-section-title">Estatus</div>
              <Field label="Estatus" name="estatus" as="estatus" />
              <Field label="Notas" name="notas" as="textarea" />
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
