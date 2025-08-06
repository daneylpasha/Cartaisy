import { styled, Text, TextProps } from "tamagui";

export type TextMDBoldProps = TextProps & {
  children: React.ReactNode;
};

const StyledText = styled(Text, {
  fontFamily: "$figtree",
  fontWeight: "700",
  fontSize: "$5",
  lineHeight: "$2",
});

export const TextMDBold = ({ children, ...props }: TextMDBoldProps) => {
  return <StyledText {...props}>{children}</StyledText>;
};
