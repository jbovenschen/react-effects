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

    nodes[i] = [x, y, z];
  }

  return nodes;
}

function transform(nodes, { transformX, transformY }) {
  for (let i = 0; i < nodes.length; i++) {
    let [x, y, z] = nodes[i];

    nodes[i] = [x + transformX, y + transformY, z];
  }

  return nodes;
}

function Confetti(config, { onCompleted }) {
  // initial - idle - active
  let status = "initial";

  let t = undefined;

  let x = undefined;
  let y = undefined;

  let points = undefined;

  let color = undefined;

  let velocity = undefined;
  let gravity = undefined;
  let decay = undefined;
  let angle = undefined;

  let rotateX = undefined;
  let rotateY = undefined;
  let rotateZ = undefined;

  let opacity = undefined;

  const size = 8;

  const h = size / 2 + Math.random() * (size / 2);
  const w = size / 2 + Math.random() * (size / 2);

  let instance = {
    draw: function draw(ctx, origin) {
      ctx.moveTo(x, y);

      const [r, g, b] = color;

      ctx.save();
      ctx.beginPath();

      for (let i = 0; i < points.length; i++) {
        ctx[i === 0 ? "moveTo" : "lineTo"](
          origin[0] + x + points[i][0],
          origin[1] - y + points[i][1]
        );
      }

      ctx.closePath();

      ctx.fillStyle = `rgb(${r}, ${g}, ${b}, ${opacity})`;

      ctx.fill();
    },
    update: function update(bounds, _t) {
      if (status === "initial") {
        // Set time when te particle is executed
        t = _t;

        color = randomItem(config.colors);

        // Set inititial origin of particles
        [x, y] = config.start(bounds);

        // Calculate the angle on which a specific particle is executed

        // Get the desired spread where the particle can be placed within and convert it to radians
        const spread = config.spread() * (Math.PI / 180);

        // Calulcate the desired angle of a specific particle
        // Based on the direction of the explosion and the spread
        angle =
          -(config.angle * (Math.PI / 180)) +
          (0.5 * spread - Math.random() * spread);

        velocity = config.velocity();
        gravity = config.gravity();
        decay = config.decay();

        // Set initial rotation
        rotateX = Math.random() * 360;
        rotateY = Math.random() * 360;
        rotateZ = Math.random() * 360;

        const shape = randomItem(config.shapes);

        // Set initial opacity
        opacity = 1;

        points = rotate(shape(size), {
          rotateX,
          rotateY,
          rotateZ,
        });

        status = "active";
      } else if (status === "active") {
        x += Math.cos(angle) * velocity;
        y -= Math.sin(angle) * velocity + gravity;

        velocity *= decay;

        if (t + config.duration < _t) {
          // TODO make fade stable
          opacity -= Math.random() / 100;
        }

        if (opacity < 0) {
          onCompleted(instance);
        } else {
          // Get a random wobble for each tick
          const wobbleX = config.wobble();
          const wobbleY = config.wobble();

          points = rotate(
            transform(points, {
              transformX: Math.random() * wobbleX - wobbleX / 2,
              transformY: Math.random() * wobbleY - wobbleY / 2,
            }),
            {
              rotateX: config.tilt(),
              rotateY: config.tilt(),
              rotateZ: config.tilt(),
            }
          );
        }
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

function square(size) {
  const x1 = -(size / 2);
  const y1 = -(size / 2);
  const x2 = +(size / 2);
  const y2 = +(size / 2);

  return [
    [x1, y1, 0],
    [x2, y1, 0],
    [x2, y2, 0],
    [x1, y2, 0],
  ];
}

function rectangle(size) {
  const h = size / 2 + Math.random() * (size / 2);
  const w = size / 2 + Math.random() * (size / 2);

  // Set the initial sizes of a rectangular shape
  const x1 = -(w / 2);
  const y1 = -(h / 2);
  const x2 = +(w / 2);
  const y2 = +(h / 2);

  return [
    [x1, y1, 0],
    [x2, y1, 0],
    [x2, y2, 0],
    [x1, y2, 0],
  ];
}

function triangle(size) {
  return [
    [0, -(size / 2), 0],
    [-(size / 2), +(size / 2), 0],
    [+(size / 2), +(size / 2), 0],
  ];
}

function polygon(size, sides) {
  const points = [];

  const N = sides || random(5, 12);

  for (let i = 0; i < N; i++) {
    const theta = (i * (Math.PI * 2)) / N;

    points.push([
      -(size / 2) + (size / 2) * Math.cos(theta),
      -(size / 2) + (size / 2) * Math.sin(theta),
      0,
    ]);
  }

  return points;
}

function star(size, sides) {
  const points = [];

  const N = sides || random(10, 14);

  for (let i = 0; i < N; i++) {
    const theta = (i * (Math.PI * 2)) / N;
    const r = size / (i % 2 === 0 ? 4 : 2);

    points.push([
      -(size / 2) + (size / 2 + r * Math.cos(theta)),
      -(size / 2) + size / 2 + r * Math.sin(theta),
      0,
    ]);
  }

  return points;
}

const defaultConfig = {
  colors: ["#000"],
  particles: () => Math.round(random(200, 300)),
  shapes: [square, rectangle, triangle, polygon, star],
  angle: 90,
  decay: () => random(0.85, 0.9),
  velocity: () => random(6, 30),
  gravity: () => random(1.8, 2),
  spread: () => random(20, 60),
  tilt: () => random(0, 4),
  wobble: () => random(0, 1),
  duration: 2000,
};

function mergeConfigs(a, b) {
  return {
    start: b.start || a.start,
    colors: b.colors || a.colors,
    shapes: b.shapes || a.shapes,
    particles: b.particles || a.particles,
    angle: b.angle || a.angle,
    spread: b.spread || a.spread,
    velocity: b.velocity || a.velocity,
    gravity: b.gravity || a.gravity,
    decay: b.decay || a.decay,
    tilt: b.tilt || a.tilt,
    wobble: b.wobble || a.wobble,
    duration: b.duration || a.duration,
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
