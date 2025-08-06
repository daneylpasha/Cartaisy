import { styled, Text, TextProps } from "tamagui";

export type HeadingXSBoldProps = TextProps & {
  children: React.ReactNode;
};

const StyledText = styled(Text, {
  fontFamily: "$figtree",
  fontWeight: "700",
  fontSize: "$7",
  lineHeight: "$5",
});

export const HeadingXSBold = ({ children, ...props }: HeadingXSBoldProps) => {
  return <StyledText {...props}>{children}</StyledText>;
};
