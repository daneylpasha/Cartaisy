import { styled, Text, TextProps } from "tamagui";

export type TextSMRegularProps = TextProps & {
  children: React.ReactNode;
};

const StyledText = styled(Text, {
  fontFamily: "$figtree",
  fontWeight: "400",
  fontSize: "$4",
  lineHeight: "$2",
});

export const TextSMRegular = ({ children, ...props }: TextSMRegularProps) => {
  return <StyledText {...props}>{children}</StyledText>;
};
