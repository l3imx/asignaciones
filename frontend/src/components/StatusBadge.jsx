const map = {
  'TRANSITO CARGADO':      'badge-transito',
  'ESPERA DE CARGA':       'badge-espera-carga',
  'ESPERA DE DESCARGA':    'badge-espera-descarga',
  'PROGRAMADO PARA CARGA': 'badge-programado',
  'FINALIZADO':            'badge-finalizado',
  'CANCELADO':             'badge-cancelado',
};

export default function StatusBadge({ estatus }) {
  return <span className={`badge ${map[estatus] || 'badge-programado'}`}>{estatus || 'PROGRAMADO PARA CARGA'}</span>;
}
