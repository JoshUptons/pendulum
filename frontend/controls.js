const controls = document.getElementsByClassName('control');
const placeButton = document.querySelector('#new');

for (let i = 0; i < controls.length; i++) {
  const control = controls[i];
  const id = control.id.split('-')[1];
  if (id) {
    const output = document.querySelector(`#output-${id}`);
    output.innerHTML = control.value;
    control.addEventListener('input', (e) => {
      const val = e.target.value;
      output.innerHTML = val;
    });
  }
}

placeButton.onclick = (e) => {
  canvas.addEventListener('mousemove', hoverHandler);
  canvas.addEventListener('click', placeHandler);
  tick();
};

const hoverHandler = (e) => {
  const x = e.clientX - canvas.getBoundingClientRect().left;
  window.localStorage.dropPoint = x;
};

const setPendulum = async (port, angle, length, mass) => {
  console.log('setting pendulum to port: ', port);
  const response = await getNewPendulum(
    port,
    window.localStorage.dropPoint,
    angle,
    length,
    mass,
  );
  if (response) {
    const p = new Pendulum(
      response.port,
      response.x,
      response.angle,
      response.length,
      response.mass,
    );
    colourCounter++;
    p.update();
    window.pendulums.push(p);
    curNode.value[1].open = false;
    return true;
  } else {
    console.log('no response from port', port);
    return false;
  }
};

const placeHandler = async (e) => {
  const angle = document.querySelector('#control-angle').value;
  const length = document.querySelector('#control-length').value;
  const mass = document.querySelector('#control-mass').value;

  // find the next open node

  while (!curNode.value[1].open && !curNode.done) {
    curNode = nodes.next();
  }
  if (!curNode.value[1].open) {
    // start from the beginning and check if there is an open node
    nodes = nodeMap.entries();
    curNode = nodes.next();
  }

  // check for the first good return
  while (!setPendulum(curNode.value[0], angle, length, mass)) {
    curNode = nodes.next();
  }

  console.log(curNode);

  window.localStorage.removeItem('dropPoint');
  canvas.removeEventListener('mousemove', hoverHandler);
  canvas.removeEventListener('click', placeHandler);
};

const getNewPendulum = async (port, x, angle, length, mass) => {
  const health = await fetch(`http://localhost:${port}/health`)
    .then((res) => res.json())
    .then((res) => res)
    .catch((err) => {
      return null;
    });
  if (health?.init) {
    // this has a simulation already running
    return null;
  }
  const response = await fetch(`http://localhost:${port}/init`, {
    headers: {
      'content-type': 'application/json',
    },
    method: 'POST',
    body: JSON.stringify({
      x,
      angle,
      length,
      mass,
    }),
  })
    .then((res) => res.json())
    .then((res) => res)
    .catch((err) => {
      console.error(err);
      return null;
    });
  return response;
};

const start = () => {
  let startNodes = nodeMap.entries();
  let cur = startNodes.next();
  while (!cur.done) {
    if (!cur.value[1].open) {
      fetch(`http://localhost:${cur.value[0]}/start`);
    }
    cur = startNodes.next();
  }
  running = true;
};

const stop = () => {
  window.pendulums = [];
  if (stopId) {
    window.clearInterval(stopId);
  }
  running = false;
  let stopNodes = nodeMap.entries();
  let cur = stopNodes.next();
  while (!cur.done) {
    // only send the stop command to nodes that are running pendulums
    if (!cur.value[1].open) {
      fetch(`http://localhost:${cur.value[0]}/stop`);
    }
    cur = stopNodes.next();
  }
};

const pause = () => {
  running = false;
  if (stopId) {
    window.clearInterval(stopId);
  }
  let pauseNodes = nodeMap.entries();
  let cur = pauseNodes.next();
  while (!cur.done) {
    if (!cur.value[1].open) {
      fetch(`http://localhost:${cur.value[0]}/pause`);
    }
    cur = pauseNodes.next();
  }
};

document.querySelector('#control-length').addEventListener('input', (e) => {
  window.preview.length = e.target.value / 5;
  refreshCanvas(preview, pctx);
  drawPreview();
});

document.querySelector('#control-mass').addEventListener('input', (e) => {
  window.preview.ball.radius = e.target.value * 20;
  refreshCanvas(preview, pctx);
  drawPreview();
});

document.querySelector('#control-angle').addEventListener('input', (e) => {
  window.preview.angle = Math.PI / (180 / e.target.value);
  refreshCanvas(preview, pctx);
  drawPreview();
});

document.querySelector('#startBtn').addEventListener('click', () => {
  start();
  tick();
});

document.querySelector('#pauseBtn').addEventListener('click', () => {
  pause();
});

document.querySelector('#stopBtn').addEventListener('click', () => {
  stop();
  resetNodes();
  colourCounter = 0;
});
