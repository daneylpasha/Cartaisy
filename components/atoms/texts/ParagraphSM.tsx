import { styled, Text, TextProps } from "tamagui";

export type ParagraphSMProps = TextProps & {
  children: React.ReactNode;
};

const StyledText = styled(Text, {
  fontFamily: "$figtree",
  fontWeight: "400",
  fontSize: "$4",
  lineHeight: "$3",
});

export const ParagraphSM = ({ children, ...props }: ParagraphSMProps) => {
  return <StyledText {...props}>{children}</StyledText>;
};
