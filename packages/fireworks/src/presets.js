import * as React from "react";

import { random } from "./utils";
import { useFireworks } from "./base";

function deCasteljau(points, t) {
  if (t === 1) {
    return points[points.length - 1];
  }

  if (t === 0) {
    return points[0];
  }

  if (points.length == 1) {
    return points[0];
  }

  const p = [];

  for (let i = 0; i < points.length - 1; i++) {
    // X & Y coordinate of first point;
    const x1 = points[i][0];
    const y1 = points[i][1];
    // X & Y coordinate of second point;
    const x2 = points[i + 1][0];
    const y2 = points[i + 1][1];

    p.push([x1 + (x2 - x1) * t, y1 + (y2 - y1) * t]);
  }

  return deCasteljau(p, t);
}

function useFireworkArc(ref, { interval = 0, ...config } = {}) {
  const dots = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9];

  const points = [
    // start
    [-150, 0],
    // control points
    [-150, 150],
    [150, 150],
    // end
    [150, 0],
  ];

  /*
  {
    start: ({ ...bounds }) => ([x, y]),
    target: () => ([x, y]),
    delay: Number,
    particles: {
      
    },
    trail: {

    }
  }
  */

  const run = useFireworks(ref, {
    ...config,
    sx: () => 0,
    sy: ({ top }) => top,
  });

  return React.useCallback(() => {
    for (let i = 0; i < dots.length; i++) {
      const [_x, _y] = deCasteljau(points, dots[i]);

      run({
        delay: interval * i,
        tx: () => 0 + _x,
        ty: ({ top }) => top + _y,
      });
    }
  }, []);
}

function useFireworkRandom(ref, { interval = 0, ...config } = {}) {
  const run = useFireworks(ref, {
    ...config,
    sx: () => 0,
    sy: ({ top }) => top,
  });

  const count = 8;

  return React.useCallback(() => {
    for (let i = 0; i <= count; i++) {
      const x = random(-150, 150);
      const y = random(50, 150);

      run({
        delay: interval * i,
        tx: () => 0 + x,
        ty: ({ top }) => top + y,
      });
    }
  }, []);
}

export { useFireworkRandom, useFireworkArc };
