import { styled, Text, TextProps } from "tamagui";

export type TextMDRegularProps = TextProps & {
  children: React.ReactNode;
};

const StyledText = styled(Text, {
  fontFamily: "$figtree",
  fontWeight: "400",
  fontSize: "$5",
  lineHeight: "$2",
});

export const TextMDRegular = ({ children, ...props }: TextMDRegularProps) => {
  return <StyledText {...props}>{children}</StyledText>;
};
