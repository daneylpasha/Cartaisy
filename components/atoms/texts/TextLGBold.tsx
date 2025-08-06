import { styled, Text, TextProps } from "tamagui";

export type TextLGBoldProps = TextProps & {
  children: React.ReactNode;
};

const StyledText = styled(Text, {
  fontFamily: "$figtree",
  fontWeight: "700",
  fontSize: "$5.5",
  lineHeight: "$3",
});

export const TextLGBold = ({ children, ...props }: TextLGBoldProps) => {
  return <StyledText {...props}>{children}</StyledText>;
};
