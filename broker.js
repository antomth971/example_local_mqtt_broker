const net = require('net');
const Aedes = require('aedes');
const startHttpApi = require('./http-api');

const PORT = process.env.MQTT_PORT || 1883;
const HOST = process.env.MQTT_HOST || '0.0.0.0';
// Port volontairement inhabituel : 3000/3001/8080 etc. sont interceptes par le
// proxy corporate (Netskope) sur ce poste et renvoient un 426/404 avant meme
// d'atteindre ce serveur.
const HTTP_PORT = process.env.HTTP_PORT || 47091;

const aedes = new Aedes();
const server = net.createServer(aedes.handle);

server.listen(PORT, HOST, () => {
  console.log(`Broker MQTT en ecoute sur tcp://${HOST}:${PORT}`);
});

startHttpApi(aedes, HTTP_PORT);

aedes.on('client', (client) => {
  console.log(`Client connecte: ${client.id}`);
});

aedes.on('clientDisconnect', (client) => {
  console.log(`Client deconnecte: ${client.id}`);
});

aedes.on('publish', (packet, client) => {
  const source = client ? client.id : 'HTTP API';
  console.log(`Message publie par ${source} sur "${packet.topic}": ${packet.payload.toString()}`);
});

aedes.on('subscribe', (subscriptions, client) => {
  if (client) {
    const topics = subscriptions.map((s) => s.topic).join(', ');
    console.log(`${client.id} souscrit a: ${topics}`);
  }
});
