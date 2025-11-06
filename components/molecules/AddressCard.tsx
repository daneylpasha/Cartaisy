import { AppImage } from "@/components/atoms/AppImage";
import { OpTouch } from "@/components/atoms/OpTouch";
import { getTokenValue, XStack, YStack } from "tamagui";
import { TextMDSemiBold, TextXSRegular } from "../atoms";
import { Spacer } from "../atoms/Spacer";
import { ParagraphSM } from "../atoms/texts/ParagraphSM";

type AddressCardProps = {
  item: {
    id: number;
    name: string;
    address: string;
    shipping: string;
    isDefault?: boolean;
  };
  selectedAddress: number | null;
  defaultBg?: string;
  setSelectedAddress: (id: number) => void;
  onEdit?: () => void;
};

export const AddressCard = ({
  item,
  selectedAddress,
  defaultBg = "$background",
  setSelectedAddress,
  onEdit,
}: AddressCardProps) => {
  const isEditMode = !!onEdit;

  return (
    <OpTouch
      onPress={() => {
        if (isEditMode && onEdit) {
          onEdit();
        } else {
          setSelectedAddress(item.id);
        }
      }}
    >
      <XStack
        borderWidth={"$xxxs"}
        borderColor={
          selectedAddress === item.id && !isEditMode ? "$primary" : "$lightgrey"
        }
        borderRadius="$2xl"
        padding={"$reg"}
        backgroundColor={
          selectedAddress === item.id && !isEditMode
            ? "$primarylight"
            : defaultBg
        }
        justifyContent="space-between"
      >
        <XStack>
          <AppImage
            name="locationUnfilled"
            tintColor={getTokenValue("$primary")}
            width={16}
            height={20}
          />
          <Spacer size={"$reg"} />
          <YStack width={"80%"}>
            <TextMDSemiBold>{item.name}</TextMDSemiBold>
            <Spacer size={"$sm"} />
            <ParagraphSM color="$secondary">{item.address}</ParagraphSM>
            <Spacer size={"$sm"} />
            <XStack alignItems="center">
              <YStack
                justifyContent="center"
                alignItems="center"
                width={14}
                height={14}
                borderRadius="$full"
                backgroundColor="$green"
              >
                <AppImage
                  name="check"
                  tintColor={getTokenValue("$white")}
                  width={7}
                  height={7}
                />
              </YStack>
              <Spacer size={"$xs"} />
              <TextXSRegular>{item.shipping}</TextXSRegular>
            </XStack>
          </YStack>
        </XStack>

        {onEdit ? (
          <YStack marginTop={"$xl"}>
            <AppImage
              name="editIcon"
              tintColor={getTokenValue("$primary")}
              width={16}
              height={16}
            />
          </YStack>
        ) : (
          <YStack
            width={"$lg"}
            height={"$lg"}
            borderRadius="$full"
            borderWidth={"$xxxs"}
            position="relative"
            marginTop={"$xl"}
            borderColor={selectedAddress === item.id ? "$primary" : "$icon"}
          >
            <YStack
              width={"$sm-reg"}
              height={"$sm-reg"}
              borderRadius="$full"
              backgroundColor={
                selectedAddress === item.id ? "$primary" : defaultBg
              }
              position="absolute"
              justifyContent="center"
              alignItems="center"
              top={6}
              left={6}
              right={0}
              bottom={0}
            ></YStack>
          </YStack>
        )}
      </XStack>
    </OpTouch>
  );
};
