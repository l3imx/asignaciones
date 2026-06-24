const express = require('express');
const { pool, poolConnect, sql } = require('../db');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    await poolConnect;
    const result = await pool.request()
      .query('SELECT * FROM asig_clientes WHERE activo=1 ORDER BY nombre');
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    await poolConnect;
    const { nombre } = req.body;
    if (!nombre?.trim()) return res.status(400).json({ error: 'Nombre requerido' });
    const exists = await pool.request()
      .input('nombre', sql.NVarChar, nombre.trim().toUpperCase())
      .query('SELECT id FROM asig_clientes WHERE UPPER(nombre)=@nombre AND activo=1');
    if (exists.recordset.length) return res.status(409).json({ error: 'El cliente ya existe' });
    const result = await pool.request()
      .input('nombre', sql.NVarChar, nombre.trim().toUpperCase())
      .query('INSERT INTO asig_clientes (nombre) OUTPUT INSERTED.id, INSERTED.nombre VALUES (@nombre)');
    res.status(201).json(result.recordset[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
