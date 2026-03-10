const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors());
app.use(express.json());

let rounds = [];
let resistance = 5;

app.get('/api/rounds', (req, res) => { res.json(rounds); });
app.post('/api/rounds', (req, res) => {
  const r = req.body;
  if (!r || !r.id) return res.status(400).json({ error: 'invalid round' });
  rounds.unshift(r);
  res.status(201).json(r);
});
app.delete('/api/rounds', (req, res) => { rounds = []; res.status(204).end(); });
app.get('/api/resistance', (req, res) => { res.json({ value: resistance }); });
app.put('/api/resistance', (req, res) => {
  const v = Number(req.body?.value);
  if (Number.isFinite(v)) { resistance = v; return res.json({ value: resistance }); }
  res.status(400).json({ error: 'invalid value' });
});

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`Mock API server listening on http://localhost:${port}`));
