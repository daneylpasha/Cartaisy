import { styled, Text, TextProps } from "tamagui";

export type TextXSRegularProps = TextProps & {
  children: React.ReactNode;
};

const StyledText = styled(Text, {
  fontFamily: "$figtree",
  fontWeight: "400",
  fontSize: "$3",
  lineHeight: "$1",
});

export const TextXSRegular = ({ children, ...props }: TextXSRegularProps) => {
  return <StyledText {...props}>{children}</StyledText>;
};
