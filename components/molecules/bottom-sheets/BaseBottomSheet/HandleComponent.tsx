import { YStack } from "tamagui";
import { tokens } from "../../../../tamagui/token";
import { SheetHandle } from "../../SheetHandle";

type HandleComponentProps = {
  hasSmallerPaddingBottom?: boolean;
};

const HandleComponent = ({ hasSmallerPaddingBottom }: HandleComponentProps) => (
  <YStack
    paddingTop={tokens.space.sm}
    backgroundColor={"$white"}
    paddingBottom={hasSmallerPaddingBottom ? tokens.space.sm : tokens.space.lg}
  >
    <SheetHandle />
  </YStack>
);

export { HandleComponent };
