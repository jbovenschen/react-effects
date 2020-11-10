import { styled } from "stitches.config";

const HeaderContainer = styled("header", {
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  width: '100%',
  padding: "$3",
});

const Wrapper = styled("div", {
  display: 'flex',
})

function Header({ Logo, Navigation }) {
  return (
    <HeaderContainer>
      <Wrapper>
        {Logo}
      </Wrapper>

      <Wrapper>
        {Navigation}
      </Wrapper>
    </HeaderContainer>
  );
}

export default Header;
