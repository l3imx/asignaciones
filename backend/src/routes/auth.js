const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();

router.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (username === process.env.ADMIN_USER && password === process.env.ADMIN_PASSWORD) {
    const token = jwt.sign({ username }, process.env.JWT_SECRET, { expiresIn: '12h' });
    return res.json({ token });
  }
  res.status(401).json({ error: 'Credenciales incorrectas' });
});

module.exports = router;
