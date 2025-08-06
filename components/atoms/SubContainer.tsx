import type { YStackProps } from "tamagui";
import { YStack } from "tamagui";

type SubContainerProps = Omit<
  YStackProps,
  "paddingHorizontal" | "paddingLeft" | "paddingRight"
>;

const SubContainer = ({ children, ...props }: SubContainerProps) => (
  <YStack {...props} paddingHorizontal={"$md"}>
    {children}
  </YStack>
);

export { SubContainer };
