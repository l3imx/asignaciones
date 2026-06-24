const express = require('express');
const { pool, poolConnect, sql } = require('../db');
const router = express.Router();

// GET /api/dispatch?week=2026-06-23  (any date in the target week)
router.get('/', async (req, res) => {
  try {
    await poolConnect;

    // Monday of requested week
    const base = req.query.week ? new Date(req.query.week) : new Date();
    const day = base.getDay();
    const monday = new Date(base);
    monday.setDate(base.getDate() - (day === 0 ? 6 : day - 1));
    monday.setHours(0, 0, 0, 0);

    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      days.push(d.toISOString().split('T')[0]);
    }

    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 7);

    // Trips CUBIERTO arriving somewhere this week → those units become available at destination
    const cubiertos = await pool.request()
      .input('start', sql.DateTime, monday)
      .input('end', sql.DateTime, sunday)
      .query(`
        SELECT id, tracto, zona_destino, ciudad_destino,
               CONVERT(varchar, cita_descarga, 23) as fecha_disponible,
               cliente_paga, ciudad_origen
        FROM asig_viajes
        WHERE estatus IN ('CUBIERTO')
          AND cita_descarga >= @start
          AND cita_descarga < @end
          AND tracto IS NOT NULL AND tracto != ''
      `);

    // All zones
    const zonas = await pool.request().query('SELECT * FROM asig_zonas WHERE activo=1 ORDER BY nombre');

    // EN FIRMA = total units (chips) on the board for that zone this week
    const enFirmaMap = {};
    cubiertos.recordset.forEach((r) => {
      if (r.zona_destino) {
        enFirmaMap[r.zona_destino] = (enFirmaMap[r.zona_destino] || 0) + 1;
      }
    });

    const board = zonas.recordset.map((z) => {
      const units = {};
      days.forEach((d) => { units[d] = []; });
      cubiertos.recordset
        .filter((r) => r.zona_destino === z.nombre)
        .forEach((r) => {
          if (units[r.fecha_disponible]) {
            units[r.fecha_disponible].push({ id: r.id, tracto: r.tracto, origen: r.ciudad_origen });
          }
        });
      return { id: z.id, nombre: z.nombre, enFirma: enFirmaMap[z.nombre] || 0, units };
    });

    res.json({ days, board });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
