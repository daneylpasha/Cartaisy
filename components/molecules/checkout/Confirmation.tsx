import { TextMDSemiBold, TextSMBold, TextXSRegular } from "@/components/atoms";
import { AppImage } from "@/components/atoms/AppImage";
import { FormInput } from "@/components/atoms/FormInput";
import { OpTouch } from "@/components/atoms/OpTouch";
import { Spacer } from "@/components/atoms/Spacer";
import { ParagraphSM } from "@/components/atoms/texts/ParagraphSM";
import OrderListItems from "@/components/organisms/checkout/OrderListItems";
import { SHADOW_STYLES } from "@/constants/styles";
import { tokens } from "@/tamagui/token";
import { t } from "@/translations";
import React from "react";
import { Controller, useForm } from "react-hook-form";
import { StyleSheet } from "react-native";
import { getTokenValue, XStack, YStack } from "tamagui";
import { PrimaryButton } from "../buttons";
import { SectionHeader } from "../SectionHeader";

const Confirmation = () => {
  const form = useForm();
  return (
    <YStack>
      <Spacer size={"$xl"} />
      <SectionHeader
        title={t("checkout.sectionHeader.yourorders")}
        tintColor={"darkgrey"}
        image="list"
        onPressSeeAll={() => {}}
      />
      <OrderListItems />
      <Spacer size={"$xl"} />
      <SectionHeader
        title={t("checkout.sectionHeader.deliveryaddress")}
        tintColor={"darkgrey"}
        image="locationUnfilled"
        seeAllText="Change"
        color="primary"
        onPressSeeAll={() => {}}
      />
      <Spacer size={"$reg"} />
      <OpTouch style={[Styles.addressContainer, { ...SHADOW_STYLES }]}>
        <XStack
          backgroundColor={"$white"}
          borderRadius="$2xl"
          padding={"$reg"}
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
              <TextMDSemiBold>{"James Vermillion"}</TextMDSemiBold>
              <Spacer size={"$sm"} />
              <ParagraphSM color="$secondary">
                {"18752 January Avenue, North Manhattan, New York, NY, 10013"}
              </ParagraphSM>
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
                <TextXSRegular>{"Shipping Available"}</TextXSRegular>
              </XStack>
            </YStack>
          </XStack>
        </XStack>
      </OpTouch>
      <Spacer size={"$xl"} />
      <SectionHeader
        title={t("checkout.sectionHeader.promocode")}
        tintColor={"darkgrey"}
        image="offerIcon"
      />
      <Spacer size={"$reg"} />
      <XStack justifyContent="space-between" paddingHorizontal={"$md"}>
        <Controller
          name="promocode"
          control={form.control}
          rules={{}}
          render={({ field, fieldState }) => (
            <FormInput
              width={"70%"}
              value={field.value}
              onChangeText={field.onChange}
              placeholder={"FIRSTTIME50"}

              // secureTextEntry
              // error={fieldState.error?.message}
            />
          )}
        />
        <PrimaryButton onPress={() => {}} width={"25%"} label="Apply" />
      </XStack>
      <Spacer size={"$reg"} />
      <YStack paddingHorizontal={"$md"}>
        <XStack
          alignItems="center"
          gap="$xs"
          borderWidth={1}
          borderColor="$green"
          padding="$sm"
          borderRadius="$2xl"
          backgroundColor="#ECFDF5"
        >
          <AppImage
            name="errorIcon"
            width={16}
            height={16}
            tintColor={getTokenValue("$green")}
          />
          <TextSMBold>{"50% OFF First Time Applied."}</TextSMBold>
        </XStack>
      </YStack>
    </YStack>
  );
};

export default Confirmation;

const Styles = StyleSheet.create({
  addressContainer: {
    paddingHorizontal: tokens.space.md,
  },
});
