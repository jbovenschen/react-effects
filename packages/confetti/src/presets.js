import * as React from "react";

import { useConfetti } from "./base";

function useConfettiCanon(config) {
  const run = useConfetti({
    ...config,
    start: ({ top }) => [0, top],
  });

  return React.useCallback(() => {
    let target;

    run({
      target: ({ left }) => {
        if (!target) {
          target = [0, left];
        }

        return target;
      },
    });
  }, [run]);
}

export { useConfettiCanon };
