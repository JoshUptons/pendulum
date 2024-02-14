import express from 'express';
import cors from 'cors';
import state from './state/index.js';
import handlers from './handlers/index.js';
import mqtt from 'mqtt';
import helpers from './helpers/index.js';
import Pendulum from './pendulum/index.js';

const NUM_NODES = 5;
const PORT = process.argv[2] || 3000;
state.port(PORT);

// MESSAGES
const client = mqtt.connect('http://localhost:1883/mqtt');
state.client = client;

// to count the restart messages
let restarts = new Array(NUM_NODES).fill(0);

client.on('connect', () => {
  client.subscribe('STOP');
  client.subscribe('RESTART');
});

client.on('message', (topic, message) => {
  switch (topic) {
    case 'STOP':
      if (state.pendulum && state.running) {
        helpers.pause(true);
      }
      break;
    case 'RESTART':
      const clientIndex = parseInt(message.toString().at(-1));
      restarts[clientIndex]++;
      if (restarts.every((counter) => counter >= 1)) {
        // restart the simulations
        state.pendulum = new Pendulum(
          state.initial.port,
          state.initial.x,
          state.initial.angle,
          state.initial.length,
          state.initial.mass,
        );
        restarts = new Array(NUM_NODES).fill(0);
        helpers.run();
      }
      break;
  }
});

const app = express();

app.use(express.json());
app.use(cors());

// ROUTES
app.get('/health', handlers.handleHealthCheck);

app.post('/init', handlers.handleInit);

app.get('/start', handlers.handleStart);
app.get('/stop', handlers.handleStop);
app.get('/pause', handlers.handlePause);
app.get('/restart', handlers.handleRestart);

app.get('/position', handlers.handlePositionCheck);

app.listen(PORT, () => {
  console.log(`app listening on port ${PORT}`);
});
