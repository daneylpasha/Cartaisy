import { styled, Text, TextProps } from "tamagui";

export type TextXLMediumProps = TextProps & {
  children: React.ReactNode;
};

const StyledText = styled(Text, {
  fontFamily: "$figtree",
  fontWeight: "500",
  fontSize: "$6",
  lineHeight: "$4",
});

export const TextXLMedium = ({ children, ...props }: TextXLMediumProps) => {
  return <StyledText {...props}>{children}</StyledText>;
};
