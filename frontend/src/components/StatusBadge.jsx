const map = {
  PENDIENTE: 'badge-pendiente',
  CUBIERTO: 'badge-cubierto',
  FINALIZADO: 'badge-finalizado',
  CANCELADO: 'badge-cancelado',
};

export default function StatusBadge({ estatus }) {
  return <span className={`badge ${map[estatus] || 'badge-pendiente'}`}>{estatus || 'PENDIENTE'}</span>;
}
