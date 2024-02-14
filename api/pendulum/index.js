const GRAVITY = 9.81;
const RPS = 0.3;
const COLLISION_THRESHOLD = 10;

class Pendulum {
  constructor(port, x, angle, length, mass) {
    this.port = port;
    this.origin = {
      x: x,
      y: 20,
    };
    this.length = length;
    // radian of the degrees
    this.angle = Math.PI / (180 / angle);
    this.force = -mass * GRAVITY * Math.sin(this.angle);
    this.velocity = 0.1;
    this.acceleration = 0;
    this.ball = {
      x: this.origin.x + this.length * Math.sin(this.angle),
      y: this.origin.y + this.length * Math.cos(this.angle),
      mass: mass,
      radius: mass * 20,
    };
  }

  update() {
    this.force = -this.ball.mass * GRAVITY * Math.sin(this.angle);
    this.acceleration = this.force / (this.ball.mass * this.length);
    this.velocity += this.acceleration * RPS;
    this.angle += this.velocity * RPS;
    this.angle = (this.angle + Math.PI * 2) % (Math.PI * 2);
    this.ball.x = this.origin.x + this.length * Math.sin(this.angle);
    this.ball.y = this.origin.y + this.length * Math.cos(this.angle);
  }

  checkCollision(position) {
    const x1 = this.ball.x;
    const x2 = position.ball.x;
    const y1 = this.ball.y;
    const y2 = position.ball.y;
    const r1 = this.ball.radius;
    const r2 = position.ball.radius;
    const distance = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    return distance <= r1 + r2 + COLLISION_THRESHOLD;
  }
}

export default Pendulum;
