import { calculateDistance, randomItem, random, convertColors } from "./utils";

let canvas = undefined;
let ctx = undefined;
let rafId = undefined;

const targets = new Map();
const effects = new Map();

function getPosition(node) {
  return node.getBoundingClientRect();
}

function loop(time = performance.now()) {
  // Store current nodes already measured in current tick
  let nodeSizes = new Map();

  if (effects.size === 0) {
    rafId = undefined;
    return;
  }

  rafId = requestAnimationFrame(loop);

  // Canvas stuff
  const dpr = window.devicePixelRatio | 1;

  ctx.scale(dpr, dpr);

  canvas.width = window.innerWidth * dpr;
  canvas.height = window.innerHeight * dpr;
  canvas.style.width = `${canvas.width}px`;
  canvas.style.height = `${canvas.height}px`;

  // Update particles and fireworks
  for (let [effect, identifier] of effects.entries()) {
    const node = targets.get(identifier).current;

    // Check if the node is not already measured in current tick
    if (!nodeSizes.has(node)) {
      if (document.body.contains(node)) {
        const { top, right, bottom, left, width, height } = getPosition(node);

        const x = left + width / 2;
        const y = top + height / 2;

        const bounds = {
          top: y - top,
          right: right - x,
          bottom: y - bottom,
          left: left - x,
        };

        nodeSizes.set(node, [bounds, [x, y]]);
      }
    }

    effect.update(nodeSizes.get(node)[0], time);
    effect.draw(ctx, nodeSizes.get(node)[1]);
  }
}

function degreesToRadians(degrees) {
  return degrees * (Math.PI / 180);
}

function rotate(nodes, { rotateX, rotateY, rotateZ }) {
  const rX = rotateX * (Math.PI / 180);
  const rY = rotateY * (Math.PI / 180);
  const rZ = rotateZ * (Math.PI / 180);

  for (let i = 0; i < nodes.length; i++) {
    let [x, y, z] = nodes[i];

    // RotateX
    y = y * Math.cos(rX) - z * Math.sin(rX);
    z = y * Math.sin(rX) + z * Math.cos(rX);

    // RotateY
    x = x * Math.cos(rY) - z * Math.sin(rY);
    z = x * Math.sin(rY) + z * Math.cos(rY);

    // RotateY
    x = x * Math.cos(rZ) - y * Math.sin(rZ);
    y = x * Math.sin(rZ) + y * Math.cos(rZ);

    nodes[i] = [
      x,
      y,
      z,
    ];
  }

  return nodes;
}

function Confetti(config) {
  // initial - idle - active
  let status = "initial";

  let x = undefined;
  let y = undefined;

  let sx = undefined;
  let sy = undefined;
  let tx = undefined;
  let ty = undefined;

  let size = undefined;

  let x1 = undefined;
  let x2 = undefined;
  let y1 = undefined;
  let y2 = undefined;

  let color = undefined;

  let wobble = undefined;
  let velocity = undefined;
  let gravity = undefined;
  let decay = undefined;
  let tilt = undefined;
  let angle = undefined;
  // let spread = undefined;

  let rotateX = undefined;
  let rotateY = undefined;
  let rotateZ = undefined;

  let ticks = undefined;

  const l = Math.random() * 3
  const w = Math.random() * 3

  let instance = {
    draw: function draw(ctx, origin) {
      ctx.moveTo(x, y);

      const [r, g, b] = color;

      ctx.save();
      ctx.beginPath();
      // ctx.fillRect(origin[0] + x, origin[1] - y, 3, 3);

      const random = Math.random();

      // https://gist.github.com/bzdgn/d722c961f45d97ea8efc6cef3aa39e76

      // const x1 = origin[0] + x - 5; // + random * Math.cos(tilt);
      // const y1 = origin[1] - y - 5; // + random * Math.sin(tilt);
      // const x2 = origin[0] + x + 5; // + random * Math.cos(tilt);
      // const y2 = origin[1] - y + 5; // + random * Math.sin(tilt);

      const x1 = -w;
      const y1 = -l;
      const x2 = +w;
      const y2 = +l;

      let points = rotate(
        [
          [x1, y1, 0],
          [x2, y1, 0],
          [x2, y2, 0],
          [x1, y2, 0],
        ],
        {
          rotateX: 0,
          rotateY,
          rotateZ,
        }
      );

      ctx.moveTo(origin[0] + x + points[0][0], origin[1] - y + points[0][1]);
      ctx.lineTo(origin[0] + x + points[1][0], origin[1] - y + points[1][1]);
      ctx.lineTo(origin[0] + x + points[2][0], origin[1] - y + points[2][1]);
      ctx.lineTo(origin[0] + x + points[3][0], origin[1] - y + points[3][1]);

      ctx.closePath();

      ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;

      ctx.fill();

      // TODO draw with wobble
    },
    update: function update(bounds, _t) {
      if (status === "initial") {
        color = randomItem(config.colors);

        [sx, sy] = config.start(bounds);
        [tx, ty] = config.start(bounds);

        // wobble = config.wobble();

        // Calculate the angle on which a specific particle is executed
        const a = config.angle() * (Math.PI / 180);
        const s = config.spread() * (Math.PI / 180);

        angle = -a + (0.5 * s - Math.random() * s);

        velocity = config.velocity * 0.5 + Math.random() * config.velocity;
        gravity = config.gravity;
        decay = config.decay;
        tilt = config.tilt();

        rotateX = config.wobble();
        rotateY = config.wobble();
        rotateZ = config.wobble();

        x = sx;
        y = sy;

        status = "active";
      } else if (status === "active") {
        x += Math.cos(angle) * velocity;
        y -= Math.sin(angle) * velocity + gravity;

        velocity *= decay;

        tilt += 0.1;

        rotateX += config.wobble() / 50;
        rotateY += config.wobble() / 50;
        rotateZ += config.wobble() / 50;

        // console.log(velocity);

        // x1 = x + (size * Math.cos(tilt));
        // y1 = y + (size * Math.sin(tilt));
        // x2 = (x + (size * Math.cos(wobble))) * Math.cos(tilt);
        // y2 = (x + (size * Math.sin(wobble))) * Math.sin(tilt);

        // wobble += 1;
        // velocity *= decay;

        // tilt += 0.1;
      }
    },
  };

  return instance;
}

function fire(identifier, config) {
  if (config.colors) {
    config.colors = convertColors(config.colors);
  }

  let particleCount = config.particles();

  while (particleCount--) {
    const confetti = Confetti(config, {
      onCompleted: (instance) => {
        effects.delete(instance);

        if (effects.size === 0) {
          console.log("Remove canvas");
        }
      },
    });

    effects.set(confetti, identifier);
  }

  if (rafId == null) {
    // If it was empty we should set a new canvas
    if (!canvas) {
      canvas = document.createElement("canvas");

      canvas.style.position = "fixed";

      canvas.style.top = 0;
      canvas.style.right = 0;
      canvas.style.bottom = 0;
      canvas.style.left = 0;
      canvas.style.pointerEvents = "none";

      document.body.appendChild(canvas);

      ctx = canvas.getContext("2d");
    }

    // Start the render loop
    loop();
  }
}

const defaultConfig = {
  colors: ["#000"],
  particles: () => Math.round(random(100, 180)),
  angle: () => 90,
  spread: () => random(40, 70),
  velocity: 20,
  gravity: 0.8,
  decay: 0.9,
  tilt: () => Math.random() * Math.PI,
  wobble: () => random(0, 180),

  // delay: 0,
  // particle: {
  //   stretch: 5,
  //   angle: () => random(0, Math.PI * 2),
  //   speed: () => random(1, 10),
  //   decay: () => random(0.015, 0.03),
  //   friction: 0.95,
  //   gravity: 1,
  // },
  // trail: {
  //   stretch: 3,
  //   speed: 2,
  //   acceleration: 1.05,
  // },
};

function mergeConfigs(a, b) {
  return {
    start: b.start || a.start,
    target: b.target || a.target,
    colors: b.colors || a.colors,
    particles: b.particles || a.particles,
    angle: b.angle || a.angle,
    spread: b.spread || a.spread,
    velocity: b.velocity || a.velocity,
    gravity: b.gravity || a.gravity,
    decay: b.decay || a.decay,
    tilt: b.tilt || a.tilt,
    wobble: b.wobble || a.wobble,
    // delay: b.delay || a.delay,
    // particle: {
    //   stretch: b.particle?.stretch || a.particle.stretch,
    //   angle: b.particle?.angle || a.particle.angle,
    //   speed: b.particle?.speed || a.particle.speed,
    //   decay: b.particle?.decay || a.particle.decay,
    //   friction: b.particle?.stretch || a.particle.friction,
    //   gravity: b.particle?.angle || a.particle.gravity,
    // },
    // trail: {
    //   stretch: b.trail?.stretch || a.trail.stretch,
    //   speed: b.trail?.stretch || a.trail.stretch,
    //   acceleration: b.trail?.acceleration || a.trail.acceleration,
    // },
  };
}

function Confettis({ target, ...config }) {
  const id = Symbol();

  const conf = mergeConfigs(defaultConfig, config);

  targets.set(id, target);

  return {
    remove: function remove() {
      targets.delete(id);
    },
    fire: (config) => fire(id, mergeConfigs(conf, config)),
  };
}

export default Confettis;
