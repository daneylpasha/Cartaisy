import { styled, Text, TextProps } from "tamagui";

export type TextMDSemiBoldProps = TextProps & {
  children: React.ReactNode;
};

const StyledText = styled(Text, {
  fontFamily: "$figtree",
  fontWeight: "600",
  fontSize: "$5",
  lineHeight: "$2",
});

export const TextMDSemiBold = ({ children, ...props }: TextMDSemiBoldProps) => {
  return <StyledText {...props}>{children}</StyledText>;
};
