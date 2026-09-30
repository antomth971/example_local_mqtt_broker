const path = require('path');
const express = require('express');

function startHttpApi(aedes, port) {
  const app = express();
  app.use(express.json());
  app.use(express.static(path.join(__dirname, 'public')));

  app.post('/api/publish', (req, res) => {
    const { topic, payload, qos = 0, retain = false } = req.body || {};

    if (typeof topic !== 'string' || topic.length === 0) {
      return res.status(400).json({ error: 'Le champ "topic" est requis (string).' });
    }
    if (payload === undefined || payload === null) {
      return res.status(400).json({ error: 'Le champ "payload" est requis.' });
    }
    if (![0, 1, 2].includes(qos)) {
      return res.status(400).json({ error: 'Le champ "qos" doit valoir 0, 1 ou 2.' });
    }

    const payloadString = typeof payload === 'string' ? payload : JSON.stringify(payload);

    aedes.publish(
      {
        cmd: 'publish',
        topic,
        payload: Buffer.from(payloadString),
        qos,
        retain: Boolean(retain),
      },
      (err) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        res.json({ ok: true, topic, payload: payloadString, qos, retain: Boolean(retain) });
      }
    );
  });

  app.get('/api/clients', (req, res) => {
    const clients = Object.keys(aedes.clients);
    res.json({ count: clients.length, clients });
  });

  app.listen(port, () => {
    console.log(`API HTTP + interface web sur http://localhost:${port}`);
  });

  return app;
}

module.exports = startHttpApi;
