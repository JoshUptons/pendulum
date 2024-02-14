import state from '../state/index.js';

const fps = 10;

/**
 * run will run the tick process of this node, it will  each neighbour for its current pendulum position
 * it will check for collisions, and track whether it is in a STOPPED or RUNNING state
 * @returns {void}
 */
const run = async () => {
  state.running = true;
  // one call to initiate the check or we get a full second with no health
  for (let i = 0; i < state.neighbours.length; i++) {
    state.neighbours[i] = await checkHealth(state.neighbours[i]);
  }
  state.stopHealthCheck = setInterval(async () => {
    for (let i = 0; i < state.neighbours.length; i++) {
      state.neighbours[i] = await checkHealth(state.neighbours[i]);
    }
  }, 1000);

  // create the stop id to puase the updating later
  // the tick will conduct the simulation of the pendulum
  state.stopId = setInterval(() => {
    tick();
  }, 1000 / fps);
};

/**
 * a pause method to clear the tick and collision loop
 * @returns {void}
 */
const pause = (send) => {
  state.running = false;
  clearInterval(state.stopId);
  if (send) {
    if (state.client) {
      state.client.publish('STOP', '');
      setTimeout(() => {
        state.client.publish('RESTART', state.health.port + '');
      }, 5000);
    } else {
      console.error('invalid mqtt client');
    }
  }
};

/**
 * tick is the update process that will track the movement of the pendulum
 */
const tick = async () => {
  if (state.pendulum && state.running) {
    state.pendulum.update();
    // console.debug(state.pendulum.ball);
    // check the collision of each immediate neighbour
    let check = await checkCollision();
    if (check) {
      pause(true);
    }
  }
};

/**
 * check the collision of each neighbour's ball
 * @returns {bool} - whether a collision has happened
 */
const checkCollision = async () => {
  console.debug('checking for collision');
  let collision = false;
  if (state.pendulum) {
    for (const n of state.neighbours) {
      if (n.init) {
        try {
          const currentPosition = await checkPosition(n);
          console.log(currentPosition);
          if (currentPosition !== null) {
            // check the position against this balls position
            collision = state.pendulum.checkCollision(currentPosition);
          }
        } catch (err) {
          console.error(err);
        }
      }
    }
  }
  return collision;
};

/**
 * checkHealth takes in a neighbour, and checks its current status, it will help ensure that we only check posisions
 * of active nodes
 * @param {Object} n - the neighbour
 * @returns {Object} - returns the state of the neighbour's health
 */
const checkHealth = async (n) => {
  const response = await fetch('http://localhost:' + n.port + '/health', {
    headers: {
      'Content-Type': 'application/json',
    },
  })
    .then((res) => res.json())
    .then((res) => res)
    .catch((err) => {
      return { port: n.port, running: false, init: false };
    });
  return response;
};

/**
 * checkPosition will take a neighbour, and call its /position endpoint
 * @param {Object} n - the neighbour
 * @returns {x: number, y: number} position - returns the positional coordinates of the neighbours ball
 */
const checkPosition = async (n) => {
  if (n.init) {
    const response = await fetch('http://localhost:' + n.port + '/position', {
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then((res) => res.json())
      .then((res) => res)
      .catch((err) => {
        console.error(err);
        process.exit(0);
      });

    return response;
  } else {
    return null;
  }
};

export default {
  checkCollision,
  checkHealth,
  checkPosition,
  pause,
  tick,
  run,
};
