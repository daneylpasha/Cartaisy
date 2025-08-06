import { styled, Text, TextProps } from "tamagui";

export type HeadingSMBoldProps = TextProps & {
  children: React.ReactNode;
};

const StyledText = styled(Text, {
  fontFamily: "$figtree",
  fontWeight: "700",
  fontSize: "$8",
  lineHeight: "$6",
  letterSpacing: "$3",
});

export const HeadingSMBold = ({ children, ...props }: HeadingSMBoldProps) => {
  return <StyledText {...props}>{children}</StyledText>;
};
