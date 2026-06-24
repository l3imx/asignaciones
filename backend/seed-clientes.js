require('dotenv').config();
const { pool, poolConnect, sql } = require('./src/db');

const clientes = [
  '2GO','3 REYES','53 CARGO','ABA CARGO','ALANTRA','ALEN DEL NORTE','ALIANZA',
  'AMARAS','AMCO','AVANCE','BEST','BMP','BRASKEM','CANAL MODERNO','CARDPACK',
  'CETTO','COLOAD','CONTROL T','DEACERO','DMA','ELIZONDO','ESTRELLA ROJA',
  'FORZA','FSN','FUTURA','FWD','GEON','HEINEKEN','HOME DEPOT','ILIMEX',
  'INNOVADOR','JUMEX','KWUANG','LADESA','LALA','LANDSTAR','MADERO',
  'MATCH CONTROL','MIRAGE','MV','OPEX','PATO','PDT','PISA','POLYMAT',
  'QUALA','RFL','ROCKET','SALES DEL VALLE','SAMWCO MEXICO','SAUZA',
  'SETRAMEX','SOLBE','STALANTIS','TGB','TELCH','THC','VAX','WATCOM',
];

(async () => {
  await poolConnect;
  let inserted = 0, skipped = 0;
  for (const nombre of clientes) {
    const exists = await pool.request()
      .input('nombre', sql.NVarChar, nombre)
      .query('SELECT id FROM asig_clientes WHERE nombre = @nombre AND activo = 1');
    if (exists.recordset.length) { skipped++; continue; }
    await pool.request()
      .input('nombre', sql.NVarChar, nombre)
      .query('INSERT INTO asig_clientes (nombre) VALUES (@nombre)');
    inserted++;
  }
  console.log(`Done: ${inserted} inserted, ${skipped} skipped (already existed)`);
  process.exit(0);
})().catch(e => { console.error(e.message); process.exit(1); });
