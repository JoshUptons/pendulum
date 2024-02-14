# Pendulum Application

## Requirements

### Frontend
- Web browser with a canvas to display the pendulums
- Basic start, pause and stop controls
- Refresh rate of a few fps is all that is required
- The draw rate does not need to be coupled to the backend simulation
- Listen to a message broker for a STOP or RESTART message to pause or restart
the animation.
- STOP will pause a specific pendulum based on the socket connection
- Upon receiving RESTART on all 5 channels, snap all pendulums back to their
original location, and, after 5 seconds, start to swing once more.

### Backend
- REST api to intitialize the position, mass, offset of the pendulum.
- Process over a tcp socket connection.
- Spin up 5 different instances of the backend, with a reference to their neighbours.
- Use MQTT transport layer for the message delivery/subscription channel.
