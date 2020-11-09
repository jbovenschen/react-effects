import * as React from "react";

import { random } from "@react-effects/utils";

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

function useFireworkArc({ interval = 0, ...config } = {}) {
  const dots = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9];

  const run = useFireworks({
    ...config,
    start: ({ top }) => [0, top],
  });

  return React.useCallback(() => {
    for (let i = 0; i < dots.length; i++) {
      let target;
      run({
        delay: interval * i,
        target: ({ top, left }) => {
          if (!target) {
            const points = [
              // start
              [left * 3, 0],
              // control points
              [left * 3, Math.abs(left * 3)],
              [Math.abs(left * 3), Math.abs(left * 3)],
              // end
              [Math.abs(left * 3), 0],
            ];

            target = deCasteljau(points, dots[i]);
          }

          return [target[0], target[1] + top];
        },
      });
    }
  }, []);
}

function useFireworkRandom({ interval = 0, ...config } = {}) {
  const run = useFireworks({
    ...config,
    start: ({ top }) => [0, top],
  });

  const count = 8;

  return React.useCallback(() => {
    for (let i = 0; i <= count; i++) {
      let target;

      run({
        delay: interval * i,
        target: ({ left, top }) => {
          if (!target) {
            target = [
              random(left * 2, Math.abs(left * 2)),
              random(Math.abs(left * 2), Math.abs(left)),
            ];
          }

          return [target[0], target[1] + top];
        },
      });
    }
  }, []);
}

export { useFireworkRandom, useFireworkArc };
