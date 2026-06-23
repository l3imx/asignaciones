const express = require('express');
const { pool, poolConnect, sql } = require('../db');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    await poolConnect;
    const result = await pool.request().query('SELECT * FROM asig_zonas WHERE activo=1 ORDER BY nombre');
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
