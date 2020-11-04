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

  ctx.globalCompositeOperation = "destination-out";

  ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
  ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);

  ctx.globalCompositeOperation = "lighter";

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

function Particle(config, { onCompleted }) {
  // initial - active
  let status = "initial";

  let x = 0;
  let y = 0;

  let coordinates = undefined;

  let color = undefined;

  let angle = undefined;
  let speed = undefined;

  let friction = undefined;
  let gravity = undefined;
  let decay = undefined;

  let alpha = 1;

  const instance = {
    update: function update(bounds) {
      if (status === "initial") {
        [x, y] = config.target(bounds);

        angle = config.particle.angle();
        speed = config.particle.speed();
        decay = config.particle.decay();

        friction = config.particle.friction;
        gravity = config.particle.gravity;

        color = randomItem(config.colors);

        coordinates = Array.from({ length: config.particle.stretch }, () => [
          x,
          y,
        ]);

        status = "active";
      } else if (status === "active") {
        coordinates.pop();
        coordinates.unshift([x, y]);

        speed *= friction;

        x += Math.cos(angle) * speed;
        y -= Math.sin(angle) * speed + gravity;

        alpha -= decay;

        if (alpha <= decay) {
          onCompleted(instance);
        }
      }
    },
    draw: function draw(ctx, origin) {
      ctx.beginPath();

      ctx.moveTo(
        origin[0] + coordinates[coordinates.length - 1][0],
        origin[1] - coordinates[coordinates.length - 1][1]
      );
      ctx.lineTo(origin[0] + x, origin[1] - y);
      ctx.strokeStyle = `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${alpha})`;
      ctx.stroke();
    },
  };

  return instance;
}

function Trail(config, { onCompleted }) {
  // Store time when tick has started
  let t = undefined;

  // initial - idle - active
  let status = "initial";

  let sx = undefined;
  let sy = undefined;
  let tx = undefined;
  let ty = undefined;

  // Actual coordinates;
  let x = undefined;
  let y = undefined;

  // distance from starting point to target
  let distance = undefined;
  let traveled = 0;

  // Track past coordinates of the firework, so we can create a trial
  // effect by using old coordinates
  let coordinates = [];

  let angle = undefined;

  // Store the speed and accelaration of the trail
  let speed = undefined;
  let acceleration = undefined;

  // Store the delay before the trail should start
  let delay = undefined;

  const instance = {
    draw: function draw(ctx, origin) {
      ctx.beginPath();

      ctx.moveTo(
        origin[0] + coordinates[coordinates.length - 1][0],
        origin[1] - coordinates[coordinates.length - 1][1]
      );
      ctx.lineTo(origin[0] + x, origin[1] - y);

      const [r, g, b] = randomItem(config.colors);
      ctx.strokeStyle = `rgb(${r}, ${g}, ${b})`;
      ctx.stroke();
    },
    update: function update(bounds, _t) {
      // From positions
      [sx, sy] = config.start(bounds);

      // Target positions
      [tx, ty] = config.target(bounds);

      // Calculate the angle of the trail effect
      angle = Math.atan2(ty - sy, tx - sx);

      if (status === "initial") {
        // Register when the animation has started
        t = performance.now();

        // Set configurable variables
        speed = config.trail.speed;
        acceleration = config.trail.acceleration;

        // Store the delay when the firework should execute;
        delay = config.delay;

        // Set start position based on start x and y
        x = sx;
        y = sy;

        distance = calculateDistance(sx, sy, tx, ty);

        coordinates = Array.from({ length: config.trail.stretch }, () => [
          x,
          y,
        ]);

        if (_t - t > delay) {
          status = "active";
        } else {
          status = "idle";
        }
      } else if (status === "idle") {
        if (_t - t > delay) {
          status = "active";
        }
      } else if (status === "active") {
        // Update the trail of the firework

        // Remove last coordinate in the array
        coordinates.pop();
        // Add a new entry at the start of the array
        coordinates.unshift([x, y]);

        // Increase firework speed
        speed *= acceleration;

        // Calculate the velocity based on the angle and speed
        const vx = Math.cos(angle) * speed;
        const vy = Math.sin(angle) * speed;

        // How far has the firework traveled when the velocities are applied
        traveled = calculateDistance(sx, sy, x + vx, y + vy);

        if (traveled >= distance) {
          // We reached our destination
          onCompleted(instance);
        } else {
          x += vx;
          y += vy;
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

  const trail = Trail(config, {
    onCompleted: (instance) => {
      effects.delete(instance);

      let particleCount = config.particles();

      while (particleCount--) {
        const particle = Particle(config, {
          onCompleted: (instance) => {
            effects.delete(instance);

            if (effects.size === 0) {
              document.body.removeChild(canvas);

              canvas = undefined;
            }
          },
        });

        effects.set(particle, identifier);
      }
    },
  });

  effects.set(trail, identifier);

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
  particles: () => Math.round(random(10, 16)),
  delay: 0,
  particle: {
    stretch: 5,
    angle: () => random(0, Math.PI * 2),
    speed: () => random(1, 10),
    decay: () => random(0.015, 0.03),
    friction: 0.95,
    gravity: 1,
  },
  trail: {
    stretch: 3,
    speed: 2,
    acceleration: 1.05,
  },
};

function mergeConfigs(a, b) {
  return {
    start: b.start || a.start,
    target: b.target || a.target,
    colors: b.colors || a.colors,
    particles: b.particles || a.particles,
    delay: b.delay || a.delay,
    particle: {
      stretch: b.particle?.stretch || a.particle.stretch,
      angle: b.particle?.angle || a.particle.angle,
      speed: b.particle?.speed || a.particle.speed,
      decay: b.particle?.decay || a.particle.decay,
      friction: b.particle?.stretch || a.particle.friction,
      gravity: b.particle?.angle || a.particle.gravity,
    },
    trail: {
      stretch: b.trail?.stretch || a.trail.stretch,
      speed: b.trail?.stretch || a.trail.stretch,
      acceleration: b.trail?.acceleration || a.trail.acceleration,
    },
  };
}

function Fireworks({ target, ...config }) {
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

export default Fireworks;
