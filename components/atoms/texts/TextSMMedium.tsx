import { styled, Text, TextProps } from "tamagui";

export type TextSMMediumProps = TextProps & {
  children: React.ReactNode;
};

const StyledText = styled(Text, {
  fontFamily: "$figtree",
  fontWeight: "500",
  fontSize: "$4",
  lineHeight: "$2",
});

export const TextSMMedium = ({ children, ...props }: TextSMMediumProps) => {
  return <StyledText {...props}>{children}</StyledText>;
};
