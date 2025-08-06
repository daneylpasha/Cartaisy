import { styled, Text, TextProps } from "tamagui";

export type TextMDMediumProps = TextProps & {
  children: React.ReactNode;
};

const StyledText = styled(Text, {
  fontFamily: "$figtree",
  fontWeight: "500",
  fontSize: "$5",
  lineHeight: "$2",
});

export const TextMDMedium = ({ children, ...props }: TextMDMediumProps) => {
  return <StyledText {...props}>{children}</StyledText>;
};
