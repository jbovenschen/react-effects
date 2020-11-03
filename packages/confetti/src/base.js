import * as React from "react";

import Confettis from "./renderer";

function useConfetti(config) {
  const instance = React.useRef();

  React.useEffect(() => {
    instance.current = Confettis(config);

    return instance.current.remove;
  }, []);

  return React.useCallback((config) => {
    instance.current.fire(config);
  }, []);
}

export { useConfetti };
