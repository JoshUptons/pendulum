import state from '../state/index.js';
import Pendulum from '../pendulum/index.js';
import helpers from '../helpers/index.js';

const handleHealthCheck = (req, res) => {
  res.send(JSON.stringify(state.health));
};

const handlePositionCheck = (req, res) => {
  res.send(JSON.stringify(state.pendulum));
};

const handleInit = (req, res) => {
  console.debug('initializing');
  const { x, angle, length, mass } = req.body;
  // create a new Pendulum with the given parameters
  if (!state.health.init) {
    state.initial = {
      port: parseInt(state.health.port),
      x: parseInt(x),
      angle: parseFloat(angle),
      length: parseInt(length),
      mass: parseFloat(mass),
    };
    state.pendulum = new Pendulum(
      parseInt(state.health.port),
      parseInt(x),
      parseFloat(angle),
      parseInt(length),
      parseFloat(mass),
    );
    console.log('initializing the pendulum', state.pendulum);
    state.health.init = true;
  } else {
    console.debug('pendulum is already initialized');
  }

  res.send(
    JSON.stringify({
      port: state.pendulum.port,
      x: state.pendulum.origin.x,
      angle: state.pendulum.angle,
      length: state.pendulum.length,
      mass: state.pendulum.ball.mass,
    }),
  );
};

const handleStart = (req, res) => {
  if (state.pendulum) {
    console.debug('starting pendulum simuluation');
    state.running = true;
    helpers.run();
  }

  res.send(
    JSON.stringify({
      message: 'starting',
    }),
  );
};

const handleStop = (req, res) => {
  console.debug('stopping pendulum simulation, clearing state');
  state.running = false;
  state.health.init = false;
  state.pendulum = null;
  state.initial = null;
  clearInterval(state?.stopHealthCheck);
  clearInterval(state?.stopId);
  res.send(
    JSON.stringify({
      message: 'stopped',
    }),
  );
};

const handlePause = (req, res) => {
  console.debug('pausing pendulum simulation');
  if (state.running) {
    helpers.pause(false);
  }
  res.send(
    JSON.stringify({
      message: 'pausing',
    }),
  );
};

const handleRestart = (req, res) => {
  console.debug('restarting');
  state.pendulum = state.initial;
  state.running = true;
  res.send(
    JSON.stringify({
      message: 'restarting',
    }),
  );
};

export default {
  handleHealthCheck,
  handleInit,
  handlePause,
  handlePositionCheck,
  handleStop,
  handleStart,
  handleRestart,
};
