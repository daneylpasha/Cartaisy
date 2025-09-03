import { styled, Text, TextProps } from "tamagui";

export type TextSMBoldprops = TextProps & {
  children: React.ReactNode;
};

const StyledText = styled(Text, {
  fontFamily: "$figtree",
  fontWeight: "700",
  fontSize: "$4",
  lineHeight: "$2",
});

export const TextSMBold = ({ children, ...props }: TextSMBoldprops) => {
  return <StyledText {...props}>{children}</StyledText>;
};
