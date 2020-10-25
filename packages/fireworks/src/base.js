import * as React from "react";

import Firework from "./renderer";

function useFireworks(config) {
  const instance = React.useRef(Firework(config));

  React.useEffect(() => {
    return instance.current.remove;
  }, []);

  return React.useCallback((config) => {
    instance.current.fire(config);
  }, []);
}

export { useFireworks };
