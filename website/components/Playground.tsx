import { styled } from "stitches.config";

const PlaygroundSection = styled("section", {
  display: "flex",
  padding: "$5",
  justifyContent: "center",
});

const PlaygroundContainer = styled("div", {
  display: "flex",
  flexDirection: "row",
  borderWidth: "$1",
  borderColor: "$gray9",
  borderStyle: "solid",
  width: '100%',
});

const PlaygroundExample = styled("div", {
  minHeight: '100px',
});

const PlaygroundConfig = styled("div", {});

function Playground() {
  return (
    <PlaygroundSection>
      <PlaygroundContainer>
        <PlaygroundExample />
        <PlaygroundConfig />
      </PlaygroundContainer>
    </PlaygroundSection>
  );
}

export default Playground;
