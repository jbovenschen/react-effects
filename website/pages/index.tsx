import { css } from "stitches.config";

import Navigation from "components/Navigation";
import Header from "components/Header";
import Intro from "components/Intro";
import Playground from "components/Playground";

css.global({
  body: {
    backgroundColor: "$gray8",
    fontFamily: "$body",
    color: "$white",
    fontSize: "$1",
  },
  "*": {
    position: "relative",
    boxSizing: "border-box",
  },
});

function Home() {
  return (
    <>
      <Header
        Logo={<div>React-effects</div>}
        Navigation={
          <Navigation>
            <Navigation.Item label="Documentation" href="/" />
            <Navigation.Item label="Github" href="/" />
          </Navigation>
        }
      />
      <Intro
        title="Micro animations made easy"
        description="Bring delight to your users by adding micro animations in a react app"
      />
      <Playground />
    </>
  );
}

export default Home;
