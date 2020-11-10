import { styled } from "stitches.config";

const IntroSection = styled("section", {
  display: "flex",
  padding: "$5",
  justifyContent: "center",
});

const IntroContainer = styled("div", {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  maxWidth: 420,
});

const IntroTitle = styled("h1", {
  fontSize: "$4",
  fontFamily: "$heading",
  margin: "0",
  marginBottom: "$3",
});

const IntroDescription = styled("p", {
  fontSize: "$1",
  margin: "0",
  textAlign: 'center',
});

function Intro({ title, description }) {
  return (
    <IntroSection>
      <IntroContainer>
        <IntroTitle>{title}</IntroTitle>
        <IntroDescription>{description}</IntroDescription>
      </IntroContainer>
    </IntroSection>
  );
}

export default Intro;
