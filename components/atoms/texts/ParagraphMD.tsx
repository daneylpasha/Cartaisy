import { styled, Text, TextProps } from "tamagui";

export type ParagraphMDProps = TextProps & {
  children: React.ReactNode;
};

const StyledText = styled(Text, {
  fontFamily: "$figtree",
  fontWeight: "400",
  fontSize: "$5",
  lineHeight: "$3",
  letterSpacing: "$1",
});

export const ParagraphMD = ({ children, ...props }: ParagraphMDProps) => {
  return <StyledText {...props}>{children}</StyledText>;
};
