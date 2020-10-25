import * as React from "react";

import { useFireworkRandom } from "@react-effects/fireworks";

function HomePage() {
  const ref = React.useRef();

  const run = useFireworkRandom(ref, {
    interval: 10,
    colors: ["#cc99c9", "#9ec1cf", "#9ee09e", "#fdfd97", "#feb144", "#ff6663"],
  });

  return (
    <div style={{ paddingTop: "30%" }}>
      Welcome to react-effects
      <button
        ref={ref}
        onClick={() => {
          run();
        }}
      >
        Click me!
      </button>
    </div>
  );
}

export default HomePage;
