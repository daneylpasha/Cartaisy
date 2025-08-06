import { styled, Text, TextProps } from "tamagui";

export type ParagraphLGProps = TextProps & {
  children: React.ReactNode;
};

const StyledText = styled(Text, {
  fontFamily: "$figtree",
  fontWeight: "400",
  fontSize: "$5.5",
  lineHeight: "$4",
  letterSpacing: "$1",
});

export const ParagraphLG = ({ children, ...props }: ParagraphLGProps) => {
  return <StyledText {...props}>{children}</StyledText>;
};
