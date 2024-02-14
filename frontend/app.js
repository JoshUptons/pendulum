const canvas = document.querySelector('#main');
const ctx = canvas.getContext('2d');
const preview = document.querySelector('#preview');
const pctx = preview.getContext('2d');
let running = false;
const NUM_NODES = 5;
const FPS = 5;

const nodeMap = new Map();
for (let i = 0; i < NUM_NODES; i++) {
  nodeMap.set(`300${i}`, { open: true });
}
const resetNodes = () => {
  for (const [k, v] of nodeMap) {
    v.open = true;
  }
  nodes = nodeMap.entries();
  curNode = nodes.next();
};
let nodes = nodeMap.entries();
let curNode = nodes.next();

// I know it's not the real gravity, but in this world this will be
// the gravity constant
const gravity = 9.81;
const rps = 0.3; // radians per second
let stopId;

const colours = ['blue', 'red', 'yellow', 'green', 'orange'];
let colourCounter = 0;

class Pendulum {
  constructor(port, x, angle, length, mass) {
    this.port = port;
    this.origin = {
      x,
      y: 20,
    };
    this.length = length;
    // radian of the degrees
    this.angle = Math.PI / (180 / angle);
    this.force = -mass * gravity * Math.sin(this.angle);
    this.velocity = 0.1;
    this.acceleration = 0;
    this.ball = {
      mass: mass,
      radius: mass * 20,
      x: this.origin.x + this.length * Math.sin(this.angle),
      y: this.origin.y + this.length * Math.cos(this.angle),
    };
    this.style = {
      fillStyle: colours[colourCounter],
      lineWidth: 2,
      strokeStyle: colours[colourCounter],
    };
  }

  drawLine(ctx) {
    Object.assign(ctx, this.style);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(this.ball.x, this.ball.y);
    ctx.stroke();
  }

  drawBall(ctx) {
    ctx.beginPath();
    ctx.arc(this.ball.x, this.ball.y, this.ball.radius, 0, Math.PI * 2);
    ctx.fill();
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.origin.x, this.origin.y);
    this.ball.x = this.length * Math.sin(this.angle);
    this.ball.y = this.length * Math.cos(this.angle);
    this.drawLine(ctx);
    this.drawBall(ctx);
    ctx.restore();
  }

  async update() {
    const response = await fetch(`http://localhost:${this.port}/position`)
      .then((res) => res.json())
      .then((res) => res);
    Object.assign(this, response);
  }
}

const refreshCanvas = (canvas, ctx) => {
  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = 'black';
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.moveTo(20, 20);
  ctx.lineTo(canvas.width - 20, 20);
  ctx.stroke();
  ctx.closePath();
};

const init = () => {
  window.pendulums = [];
};

const drawPendulumDropper = () => {
  if (window.localStorage?.dropPoint) {
    ctx.beginPath();
    ctx.arc(window.localStorage.dropPoint, 20, 20, 0, Math.PI * 2);
    ctx.fillStyle = 'lightblue';
    ctx.fill();
    ctx.closePath();
  }
};

const tick = (timestamp) => {
  stopId = setTimeout(() => {
    refreshCanvas(canvas, ctx);
    drawPendulumDropper();
    for (const p of window.pendulums) {
      if (running) {
        p.update();
      }
      p.draw(ctx);
    }
    window.requestAnimationFrame(tick);
  }, 1000 / FPS);
};

const drawPreview = () => {
  window.preview.draw(pctx);
};

refreshCanvas(canvas, ctx);
init();

window.preview = new Pendulum(1, preview.width / 2, 0, 20, 0.6);
refreshCanvas(preview, pctx);
drawPreview();
