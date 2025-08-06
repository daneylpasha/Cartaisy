import { styled, Text, TextProps } from "tamagui";

export type ParagraphXSProps = TextProps & {
  children: React.ReactNode;
};

const StyledText = styled(Text, {
  fontFamily: "$figtree",
  fontWeight: "400",
  fontSize: "$4",
  lineHeight: "$2",
});

export const ParagraphXS = ({ children, ...props }: ParagraphXSProps) => {
  return <StyledText {...props}>{children}</StyledText>;
};
