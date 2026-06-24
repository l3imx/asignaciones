const express = require('express');
const { pool, poolConnect, sql } = require('../db');
const router = express.Router();

// GET /api/viajes?estatus=PENDIENTE&zona=MONTERREY&desde=2026-01-01&hasta=2026-12-31&q=cliente
router.get('/', async (req, res) => {
  try {
    await poolConnect;
    const { estatus, zona, desde, hasta, q, page = 1, limit = 50 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let where = 'WHERE 1=1';
    const req2 = pool.request();

    if (estatus) { where += ' AND v.estatus = @estatus'; req2.input('estatus', sql.NVarChar, estatus); }
    if (zona) { where += ' AND (v.zona_origen = @zona OR v.zona_destino = @zona)'; req2.input('zona', sql.NVarChar, zona); }
    if (desde) { where += ' AND v.cita_carga >= @desde'; req2.input('desde', sql.DateTime, new Date(desde)); }
    if (hasta) { where += ' AND v.cita_carga <= @hasta'; req2.input('hasta', sql.DateTime, new Date(hasta)); }
    if (q) {
      where += ' AND (c.nombre LIKE @q OR v.cliente_paga LIKE @q OR v.ciudad_origen LIKE @q OR v.ciudad_destino LIKE @q OR v.tracto LIKE @q OR v.operador LIKE @q)';
      req2.input('q', sql.NVarChar, `%${q}%`);
    }

    req2.input('limit', sql.Int, parseInt(limit));
    req2.input('offset', sql.Int, offset);

    const result = await req2.query(`
      SELECT v.*, c.nombre AS cliente_nombre
      FROM asig_viajes v
      LEFT JOIN asig_clientes c ON c.id = v.cliente_id
      ${where}
      ORDER BY v.fecha_creacion DESC
      OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
    `);

    const countReq = pool.request();
    if (estatus) countReq.input('estatus', sql.NVarChar, estatus);
    if (zona) countReq.input('zona', sql.NVarChar, zona);
    if (desde) countReq.input('desde', sql.DateTime, new Date(desde));
    if (hasta) countReq.input('hasta', sql.DateTime, new Date(hasta));
    if (q) countReq.input('q', sql.NVarChar, `%${q}%`);
    const countResult = await countReq.query(`SELECT COUNT(*) as total FROM asig_viajes v LEFT JOIN asig_clientes c ON c.id = v.cliente_id ${where}`);

    res.json({ data: result.recordset, total: countResult.recordset[0].total, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/viajes/:id
router.get('/:id', async (req, res) => {
  try {
    await poolConnect;
    const result = await pool.request()
      .input('id', sql.Int, req.params.id)
      .query('SELECT * FROM asig_viajes WHERE id = @id');
    if (!result.recordset.length) return res.status(404).json({ error: 'No encontrado' });
    res.json(result.recordset[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/viajes
router.post('/', async (req, res) => {
  try {
    await poolConnect;
    const d = req.body;
    const result = await pool.request()
      .input('cliente_id', sql.Int, d.cliente_id || null)
      .input('no_solicitud', sql.NVarChar, d.no_solicitud || null)
      .input('cliente_paga', sql.NVarChar, d.cliente_paga || null)
      .input('zona_origen', sql.NVarChar, d.zona_origen || null)
      .input('ciudad_origen', sql.NVarChar, d.ciudad_origen || null)
      .input('cliente_carga', sql.NVarChar, d.cliente_carga || null)
      .input('ubicacion_carga', sql.NVarChar, d.ubicacion_carga || null)
      .input('cita_carga', sql.DateTime2, d.cita_carga ? new Date(d.cita_carga) : null)
      .input('zona_destino', sql.NVarChar, d.zona_destino || null)
      .input('ciudad_destino', sql.NVarChar, d.ciudad_destino || null)
      .input('cliente_descarga', sql.NVarChar, d.cliente_descarga || null)
      .input('ubicacion_descarga', sql.NVarChar, d.ubicacion_descarga || null)
      .input('cita_descarga', sql.DateTime2, d.cita_descarga ? new Date(d.cita_descarga) : null)
      .input('operador', sql.NVarChar, d.operador || null)
      .input('tracto', sql.NVarChar, d.tracto || null)
      .input('remolque', sql.NVarChar, d.remolque || null)
      .input('folio_remision', sql.NVarChar, d.folio_remision || null)
      .input('carta_porte', sql.NVarChar, d.carta_porte || null)
      .input('estatus', sql.NVarChar, d.estatus || 'PROGRAMADO PARA CARGA')
      .input('coordinador', sql.NVarChar, d.coordinador || null)
      .input('notas', sql.NVarChar, d.notas || null)
      .query(`
        INSERT INTO asig_viajes
          (cliente_id,no_solicitud,cliente_paga,zona_origen,ciudad_origen,cliente_carga,ubicacion_carga,cita_carga,
           zona_destino,ciudad_destino,cliente_descarga,ubicacion_descarga,cita_descarga,
           operador,tracto,remolque,folio_remision,carta_porte,estatus,coordinador,notas)
        OUTPUT INSERTED.id
        VALUES
          (@cliente_id,@no_solicitud,@cliente_paga,@zona_origen,@ciudad_origen,@cliente_carga,@ubicacion_carga,@cita_carga,
           @zona_destino,@ciudad_destino,@cliente_descarga,@ubicacion_descarga,@cita_descarga,
           @operador,@tracto,@remolque,@folio_remision,@carta_porte,@estatus,@coordinador,@notas)
      `);
    res.status(201).json({ id: result.recordset[0].id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/viajes/:id
router.put('/:id', async (req, res) => {
  try {
    await poolConnect;
    const d = req.body;
    await pool.request()
      .input('id', sql.Int, req.params.id)
      .input('cliente_id', sql.Int, d.cliente_id || null)
      .input('no_solicitud', sql.NVarChar, d.no_solicitud || null)
      .input('cliente_paga', sql.NVarChar, d.cliente_paga || null)
      .input('zona_origen', sql.NVarChar, d.zona_origen || null)
      .input('ciudad_origen', sql.NVarChar, d.ciudad_origen || null)
      .input('cliente_carga', sql.NVarChar, d.cliente_carga || null)
      .input('ubicacion_carga', sql.NVarChar, d.ubicacion_carga || null)
      .input('cita_carga', sql.DateTime2, d.cita_carga ? new Date(d.cita_carga) : null)
      .input('zona_destino', sql.NVarChar, d.zona_destino || null)
      .input('ciudad_destino', sql.NVarChar, d.ciudad_destino || null)
      .input('cliente_descarga', sql.NVarChar, d.cliente_descarga || null)
      .input('ubicacion_descarga', sql.NVarChar, d.ubicacion_descarga || null)
      .input('cita_descarga', sql.DateTime2, d.cita_descarga ? new Date(d.cita_descarga) : null)
      .input('operador', sql.NVarChar, d.operador || null)
      .input('tracto', sql.NVarChar, d.tracto || null)
      .input('remolque', sql.NVarChar, d.remolque || null)
      .input('folio_remision', sql.NVarChar, d.folio_remision || null)
      .input('carta_porte', sql.NVarChar, d.carta_porte || null)
      .input('estatus', sql.NVarChar, d.estatus || 'PROGRAMADO PARA CARGA')
      .input('coordinador', sql.NVarChar, d.coordinador || null)
      .input('notas', sql.NVarChar, d.notas || null)
      .query(`
        UPDATE asig_viajes SET
          cliente_id=@cliente_id, no_solicitud=@no_solicitud, cliente_paga=@cliente_paga,
          zona_origen=@zona_origen, ciudad_origen=@ciudad_origen,
          cliente_carga=@cliente_carga, ubicacion_carga=@ubicacion_carga, cita_carga=@cita_carga,
          zona_destino=@zona_destino, ciudad_destino=@ciudad_destino,
          cliente_descarga=@cliente_descarga, ubicacion_descarga=@ubicacion_descarga, cita_descarga=@cita_descarga,
          operador=@operador, tracto=@tracto, remolque=@remolque,
          folio_remision=@folio_remision, carta_porte=@carta_porte,
          estatus=@estatus, coordinador=@coordinador, notas=@notas,
          fecha_modificacion=GETDATE()
        WHERE id=@id
      `);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/viajes/:id
router.delete('/:id', async (req, res) => {
  try {
    await poolConnect;
    await pool.request()
      .input('id', sql.Int, req.params.id)
      .query('DELETE FROM asig_viajes WHERE id=@id');
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
