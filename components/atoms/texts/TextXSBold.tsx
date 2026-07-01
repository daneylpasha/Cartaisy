import { styled, Text, TextProps } from "tamagui";

export type TextXSBoldProps = TextProps & {
  children: React.ReactNode;
};

const StyledText = styled(Text, {
  fontFamily: "$figtree",
  fontWeight: "700",
  fontSize: "$3",
  lineHeight: "$1",
});

export const TextXSBold = ({ children, ...props }: TextXSBoldProps) => {
  return <StyledText {...props}>{children}</StyledText>;
};
