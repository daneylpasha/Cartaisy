import { styled, Text, TextProps } from "tamagui";

export type LabelMDProps = TextProps & {
  children: React.ReactNode;
};

const StyledText = styled(Text, {
  fontFamily: "$figtree",
  fontWeight: "800",
  fontSize: "$4",
  lineHeight: "$2",
  letterSpacing: 1.4,
});

export const LabelMD = ({ children, ...props }: LabelMDProps) => {
  return <StyledText {...props}>{children}</StyledText>;
};
