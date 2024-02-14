# API for the vention pendulum exam

## Overview
The basic Architectural model of the backend is as follows:  
- An mqtt/emqx broker running in a docker container.  This is the broker to relay
messages to/from our processes.
- 5 Node processes, which will provide the API layer for our frontend to talk to
our servers, as well as do all the calculations on the position and collision status
of our pendulums.

The folder structure:
```
./
    /cmd - shell scripts to initiate an stop our processes
        /init.sh
        /stop.sh
    /handlers - the api handlers
    /helpers - functions that aid in the calculations, looping, or calling of each node
    /index.js - the application entrypoint
    /pendulum - the class for our pendulum simulation
    /state - our state object for the processs

```

## Requirements
To get started I assume a few things, that you have bash installed or are on a unix system.  
This is to ensure the `npm` scripts run properly, as they reference shell scripts in the `cmd` directory.

- [Node.js](https://nodejs.org/en/download) && npm installed 
- [Docker](https://docs.docker.com/engine/install/) installed
- emqx docker image - `docker pull emqx/emqx` then `make emqx` to run the emqx broker

To initialize the backend processes run the following commands:
`npm install`  
`npm run start`  

If the scripts do not run, you will need to either manually set the node instances in a background process,
or run them in 5 different terminal windows.

`node index 3000`  
`node index 3001`  
`node index 3002`  
`node index 3003`  
`node index 3004`  

I would have changed to dynamic port selection, but just ran out of time.
These ports are hardcoded on the frontend, so please use these to ensure it runs.
