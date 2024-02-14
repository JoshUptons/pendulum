// base state to hold this instance's data
// would build a state management context layer
// but this will suffice to get something up and running.
let state = {
  health: {
    port: 3000, // default value
    init: false,
  },
  running: false, // simulation run state
  initial: null,
  pendulum: null,
  neighbours: [
    {
      port: 2999, // default value
      init: false,
    },
    {
      port: 3001, // default value
      init: false,
    },
  ],
  port: function (port) {
    let portInt = parseInt(port);
    this.health.port = portInt;
    this.neighbours[0].port = portInt - 1;
    this.neighbours[1].port = portInt + 1;
  },
};

export default state;
