import { styled, Text, TextProps } from "tamagui";

export type TextSMSemiBoldProps = TextProps & {
  children: React.ReactNode;
};

const StyledText = styled(Text, {
  fontFamily: "$figtree",
  fontWeight: "500",
  fontSize: "$4",
  lineHeight: "$2",
});

export const TextSMSemiBold = ({ children, ...props }: TextSMSemiBoldProps) => {
  return <StyledText {...props}>{children}</StyledText>;
};
