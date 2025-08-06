import { styled, Text, TextProps } from "tamagui";

export type TextXLBoldProps = TextProps & {
  children: React.ReactNode;
};

const StyledText = styled(Text, {
  fontFamily: "$figtree",
  fontWeight: "700",
  fontSize: "$6",
  lineHeight: "$4",
});

export const TextXLBold = ({ children, ...props }: TextXLBoldProps) => {
  return <StyledText {...props}>{children}</StyledText>;
};
