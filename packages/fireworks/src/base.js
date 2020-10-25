import * as React from "react";

import { run, register } from "./renderer";

function useFireworks(ref, config) {
  React.useEffect(() => {
    return register(ref.current, config);
  }, []);

  return React.useCallback((config) => {
    run(ref.current, config);
  }, []);
}

export { useFireworks };
