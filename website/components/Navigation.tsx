import Link from "next/link";

import { styled } from "stitches.config";

const NavigationListItem = styled("li", {
  display: "flex",
  padding: "$2",
});

const NavigationItemLabel = styled("span", {
  display: "flex",
});

const NavigationItemLink = styled("a", {
  display: "flex",
  position: "relative",
  padding: "$3",
  borderWidth: "$1",
  borderStyle: "solid",
  borderColor: "$gray8",
  borderRadius: "$1",
  color: "$white",
  textDecoration: "none",
  fontWeight: "bold",
  transition: "all 0.3s",

  [`${NavigationItemLabel}`]: {
    transition: "transform 0.3s",
  },

  ":hover": {
    borderColor: "$gray9",
    outline: "none",
    background: "$teal9",
    color: "$white",
    boxShadow: "inset 2px 2px 0px 0px rgba(33, 37, 41, 0.5)",

    [`${NavigationItemLabel}`]: {
      transform: "translate(1px, 1px)",
    },
  },
});

function NavigationItem({ label, href }) {
  return (
    <NavigationListItem>
      <Link href={href}>
        <NavigationItemLink href={href}>
          <NavigationItemLabel>{label}</NavigationItemLabel>
        </NavigationItemLink>
      </Link>
    </NavigationListItem>
  );
}

const NavigationContainer = styled("nav", {
  display: "flex",
});

const NavigationList = styled("ul", {
  display: "flex",
  flexDirection: "row",
  listStyleType: "none",
  margin: "0",
  padding: "0",
});

function Navigation({ children }) {
  return (
    <NavigationContainer>
      <NavigationList>{children}</NavigationList>
    </NavigationContainer>
  );
}

Navigation.Item = NavigationItem;

export default Navigation;
