import { styled, Text, TextProps } from "tamagui";

export type HeadingXSRegularProps = TextProps & {
  children: React.ReactNode;
};

const StyledText = styled(Text, {
  fontFamily: "$figtree",
  fontWeight: "400",
  fontSize: "$7",
  lineHeight: "$9",
  // letterSpacing: "$1",
});

export const HeadingXSRegular = ({
  children,
  ...props
}: HeadingXSRegularProps) => {
  return <StyledText {...props}>{children}</StyledText>;
};
