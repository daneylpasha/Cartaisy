import {
  HeadingSMBold,
  HeadingXSRegular,
  ParagraphMD,
  TextSMSemiBold,
  TextXSRegular,
} from "@/components/atoms";
import { AppImage } from "@/components/atoms/AppImage";
import { FormInput } from "@/components/atoms/FormInput";
import { OpTouch } from "@/components/atoms/OpTouch";
import { Spacer } from "@/components/atoms/Spacer";
import { TextMDRegular } from "@/components/atoms/texts/TextMDRegular";
import { TextMDSemiBold } from "@/components/atoms/texts/TextMDSemiBold";
import { PrimaryButton } from "@/components/molecules/buttons/PrimaryButton";
import { fonts } from "@/tamagui/fonts";

import {
  BaseBottomSheetRef,
  BottomSheetModalWithView,
} from "@/components/molecules/bottom-sheets";
import { SHADOW_STYLES } from "@/constants/styles";
import { t } from "@/translations";
import { router } from "expo-router";
import { useRef, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { ScrollView, StyleSheet, TextInput } from "react-native";
import CountryPicker, {
  Country,
  CountryCode,
} from "react-native-country-picker-modal";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { getTokenValue, XStack, YStack } from "tamagui";
const AddAddress = () => {
  const form = useForm();
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const desc = useWatch({ control: form.control, name: "description" });
  const descLen = (desc ?? "").length;
  const onSubmit = (data: any) => {
    router.back();
    console.log("Form submitted:", data);
    // Handle form submission
  };
  const [selectedCountry, setSelectedCountry] = useState<Country>({
    callingCode: ["44"],
    cca2: "GB",
    currency: ["GBP"],
    flag: "flag-gb",
    name: "United Kingdom",
    region: "Europe",
    subregion: "Northern Europe",
  });
  const helpBottomSheetRef = useRef<BaseBottomSheetRef>(null);
  const { bottom: bottomSafeAreaInset } = useSafeAreaInsets();

  const onSelectCountry = (country: Country) => {
    setSelectedCountry(country);
    setShowCountryPicker(false);
  };

  return (
    <YStack backgroundColor="$background" flex={1}>
      <KeyboardAwareScrollView
        bounces={false}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        enableOnAndroid={true}
        enableAutomaticScroll={true}
        extraScrollHeight={20}
        keyboardOpeningTime={0}
        keyboardDismissMode="interactive"
      >
        <YStack padding={"$md"}>
          <HeadingSMBold>{t("addAddress.title")}</HeadingSMBold>
          <Spacer size={"$sm"} />
          <ParagraphMD>{t("addAddress.subtitle")}</ParagraphMD>
        </YStack>
        <Spacer size={"$lg"} />
        <YStack paddingHorizontal={"$md"}>
          <TextSMSemiBold>{t("addAddress.fieldfirst")}</TextSMSemiBold>
          <Spacer size={"$sm"} />
          <Controller
            name="addressName"
            control={form.control}
            rules={{
              required: "Address Name is required",
            }}
            render={({ field, fieldState }) => (
              <XStack
                borderWidth={1}
                borderColor="$lightgrey"
                borderRadius="$full"
                alignItems="center"
                backgroundColor="$white"
              >
                <FormInput
                  value={field.value}
                  paddingHorizontal={16}
                  onChangeText={field.onChange}
                  placeholder={"Lily 2, London"}
                  width={"90%"}
                  borderWidth={0}
                  icon={
                    <AppImage
                      tintColor={getTokenValue("$secondary")}
                      name="locationUnfilled"
                      width={14}
                      height={18}
                    />
                  }
                  // error={fieldState.error?.message}
                  onSubmitEditing={() => form.setFocus("streetAddress")}
                />
                <OpTouch
                  hitSlop={{ bottom: 10, top: 10, left: 10, right: 10 }}
                  onPress={() => helpBottomSheetRef.current?.handleOpenPress()}
                >
                  <AppImage name="warningIcon" width={16} height={16} />
                </OpTouch>
              </XStack>
            )}
          />
          <Spacer size={"$reg"} />
          <TextSMSemiBold>{t("addAddress.fieldsecond")}</TextSMSemiBold>
          <Spacer size={"$sm"} />
          <OpTouch onPress={() => setShowCountryPicker(true)}>
            <XStack
              alignItems="center"
              borderWidth={1}
              borderColor="$lightgrey"
              borderRadius="$full"
              paddingHorizontal="$reg"
              backgroundColor="$white"
              paddingVertical="$reg"
            >
              <CountryPicker
                withFilter
                withFlag
                withEmoji
                countryCode={selectedCountry.cca2 as CountryCode}
                onSelect={onSelectCountry}
                onClose={() => setShowCountryPicker(false)}
                visible={showCountryPicker}
                theme={{
                  flagSizeButton: 20,
                }}
              />
              <TextMDRegular color="$textgrey">
                {String(selectedCountry?.name || "Select Country")}
              </TextMDRegular>
              <XStack
                alignItems="center"
                gap="$sm"
                paddingHorizontal="$sm"
                marginLeft={"auto"}
              >
                <TextMDSemiBold color="$secondary">
                  {selectedCountry?.cca2 || ""}
                </TextMDSemiBold>
                <AppImage
                  name="arrowDown"
                  width={14}
                  height={8}
                  tintColor={getTokenValue("$secondary")}
                />
              </XStack>
            </XStack>
          </OpTouch>
          <Spacer size={"$reg"} />
          <TextSMSemiBold>{t("addAddress.fieldthird")}</TextSMSemiBold>
          <Spacer size={"$sm"} />
          <Controller
            name="streetAddress"
            control={form.control}
            rules={{
              required: "Street Address is required",
            }}
            render={({ field, fieldState }) => (
              <XStack
                borderWidth={1}
                borderColor="$lightgrey"
                borderRadius="$full"
                alignItems="center"
                backgroundColor="$white"
              >
                <FormInput
                  value={field.value}
                  onChangeText={field.onChange}
                  paddingHorizontal={16}
                  placeholder={"E7158 Whitechapel High St"}
                  width={"90%"}
                  borderWidth={0}
                  icon={
                    <AppImage
                      tintColor={getTokenValue("$secondary")}
                      name="locationIconUnfilled"
                      width={14}
                      height={18}
                    />
                  }
                  // error={fieldState.error?.message}
                  onSubmitEditing={() => form.setFocus("apartmentSuite")}
                />
                {/* <OpTouch>
                  <AppImage name="editIcon" width={16} height={16} />
                </OpTouch> */}
              </XStack>
            )}
          />
          <Spacer size={"$reg"} />
          <TextSMSemiBold>{t("addAddress.fieldfourth")}</TextSMSemiBold>
          <Spacer size={"$sm"} />
          <Controller
            name="apartmentSuite"
            control={form.control}
            rules={{
              required: "Apartment Suite is required",
            }}
            render={({ field, fieldState }) => (
              <XStack
                borderWidth={1}
                borderColor="$lightgrey"
                borderRadius="$full"
                alignItems="center"
                backgroundColor="$white"
              >
                <FormInput
                  value={field.value}
                  onChangeText={field.onChange}
                  placeholder={"Suite B225 Intermediate"}
                  paddingHorizontal={16}
                  width={"90%"}
                  borderWidth={0}
                  icon={
                    <AppImage
                      tintColor={getTokenValue("$secondary")}
                      name="suitIcon"
                      width={19}
                      height={16}
                    />
                  }
                  // error={fieldState.error?.message}
                  onSubmitEditing={() => form.setFocus("stateProvince")}
                />
              </XStack>
            )}
          />
          {}
          <Spacer size={"$reg"} />
          <XStack width={"100%"}>
            <YStack flex={1}>
              <TextSMSemiBold>{t("addAddress.fieldfifth")}</TextSMSemiBold>
              <Spacer size={"$sm"} />
              <Controller
                name="stateProvince"
                control={form.control}
                rules={{
                  required: "State / Province is required",
                }}
                render={({ field, fieldState }) => (
                  <FormInput
                    value={field.value}
                    onChangeText={field.onChange}
                    placeholder={"London"}
                    //   width={"100%"}
                    borderWidth={1}
                    icon={
                      <AppImage
                        tintColor={getTokenValue("$secondary")}
                        name="flagIcon"
                        width={19}
                        height={16}
                      />
                    }
                    // error={fieldState.error?.message}
                    onSubmitEditing={() => form.setFocus("postCode")}
                  />
                )}
              />
            </YStack>
            <Spacer size={"$sm"} />
            <YStack flex={1}>
              <TextSMSemiBold>{t("addAddress.fieldsix")}</TextSMSemiBold>
              <Spacer size={"$sm"} />
              <Controller
                name="postCode"
                control={form.control}
                rules={{
                  required: "Postcode is required",
                }}
                render={({ field, fieldState }) => (
                  <FormInput
                    value={field.value}
                    onChangeText={field.onChange}
                    placeholder={"E1 6LT"}
                    //   width={"100%"}
                    borderWidth={1}
                    icon={
                      <AppImage
                        tintColor={getTokenValue("$secondary")}
                        name="postCodeIcon"
                        width={19}
                        height={16}
                      />
                    }
                    // error={fieldState.error?.message}
                    onSubmitEditing={() => form.setFocus("description")}
                  />
                )}
              />
            </YStack>
          </XStack>
          <Spacer size={"$reg"} />
          <TextSMSemiBold>{t("addAddress.fieldseven")}</TextSMSemiBold>
          <Spacer size={"$sm"} />
          <YStack
            style={{
              ...SHADOW_STYLES,
            }}
            backgroundColor="$white"
            borderRadius="$2xl"
            padding="$reg"
          >
            <Controller
              name="description"
              control={form.control}
              rules={{
                required: "Description is required",
              }}
              render={({ field, fieldState }) => (
                <>
                  <TextInput
                    selectionColor={"black"}
                    value={field.value}
                    onChangeText={field.onChange}
                    placeholder={
                      "Please just put the package on the front door. Thanks a lot! 😊"
                    }
                    maxLength={300}
                    multiline={true}
                    numberOfLines={8}
                    textAlignVertical="top"
                    placeholderTextColor={getTokenValue("$textgrey")}
                    style={Styles.input}
                    //   error={fieldState.error?.message}
                  />
                </>
              )}
            />
            <Spacer size={"$sm"} />
            <XStack alignItems="center" justifyContent="space-between">
              <TextXSRegular color="$secondary">{`${descLen}/300`}</TextXSRegular>
              <AppImage name="noteIcon" width={12} height={12} />
            </XStack>
          </YStack>
          <Spacer size={"$lg"} />
        </YStack>
      </KeyboardAwareScrollView>
      <ScrollView showsVerticalScrollIndicator={false}></ScrollView>
      <YStack paddingHorizontal={"$md"}>
        <PrimaryButton
          label="Save Address"
          onPress={form.handleSubmit(onSubmit)}
          width={"100%"}
          iconPosition="left"
          isLoading={false}
        />
      </YStack>
      {/* paddingBottom={} */}
      <Spacer size={bottomSafeAreaInset} />
      <BottomSheetModalWithView snapPoints={["40%"]} ref={helpBottomSheetRef}>
        <YStack
          backgroundColor="$white"
          borderTopLeftRadius="$xl"
          borderTopRightRadius="$xl"
          paddingHorizontal="$md"
          // paddingVertical="$lg"
        >
          {/* Header */}
          <XStack
            alignItems="center"
            justifyContent="space-between"
            marginBottom="$md"
          >
            <HeadingXSRegular>Address Name Help</HeadingXSRegular>
            <OpTouch
              onPress={() => helpBottomSheetRef.current?.handleClosePress()}
            >
              <AppImage name="closeIcon" width={15} height={15} />
            </OpTouch>
          </XStack>

          {/* Content */}
          <YStack gap="$md">
            <ParagraphMD>
              Give your address a memorable name to easily identify it later.
            </ParagraphMD>

            <YStack gap="$sm">
              <TextSMSemiBold>Examples:</TextSMSemiBold>
              <YStack gap="$xs" paddingLeft="$md">
                <TextMDRegular color="$secondary">• Home</TextMDRegular>
                <TextMDRegular color="$secondary">• Office</TextMDRegular>
                <TextMDRegular color="$secondary">• Mom's House</TextMDRegular>
                <TextMDRegular color="$secondary">
                  • Downtown Apartment
                </TextMDRegular>
                <TextMDRegular color="$secondary">• Summer House</TextMDRegular>
              </YStack>
            </YStack>

            <ParagraphMD color="$textgrey">
              This name will help you quickly select the right address during
              checkout.
            </ParagraphMD>
          </YStack>
        </YStack>
      </BottomSheetModalWithView>
    </YStack>
  );
};

export default AddAddress;

const Styles = StyleSheet.create({
  input: {
    fontSize: fonts.figtree.size[5],
    lineHeight: fonts.figtree.lineHeight[2],
    fontFamily: "Figtree-Regular",
    height: 172,
    width: "100%",
  },
});
