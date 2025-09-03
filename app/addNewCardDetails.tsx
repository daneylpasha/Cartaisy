import {
  HeadingSMBold,
  LabelMD,
  ParagraphMD,
  TextLGBold,
  TextMDBold,
  TextMDSemiBold,
  TextSMMedium,
  TextSMSemiBold,
} from "@/components/atoms";
import { AppImage } from "@/components/atoms/AppImage";
import { FormInput } from "@/components/atoms/FormInput";
import { OpTouch } from "@/components/atoms/OpTouch";
import { Spacer } from "@/components/atoms/Spacer";
import {
  BaseBottomSheetRef,
  BottomSheetModalWithView,
} from "@/components/molecules/bottom-sheets";
import { PrimaryButton } from "@/components/molecules/buttons";
import { LoaderScreen } from "@/components/organisms/LoaderScreen";
import CardLinkModal from "@/components/organisms/paymentmethod/CardLinkModal";
import { tokens } from "@/tamagui/token";
import { t } from "@/translations";
import React, { useMemo, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Modal, ScrollView } from "react-native";
import { Calendar } from "react-native-calendars";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { getTokenValue, XStack, YStack } from "tamagui";
const toISO = (d: Date) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};
const fromISO = (s: string) => {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
};
const formatDMY = (d: Date) => {
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd} / ${mm} / ${yyyy}`;
};
const AddNewCardDetails = () => {
  const form = useForm();
  const calendarBottomSheetRef = useRef<BaseBottomSheetRef>(null);
  
  const onSubmit = (data: any) => {
    console.log('Form submitted:', data);
    handleLinkCard();
  };
  const [tempDateSelection, setTempDateSelection] = useState<string | null>(
    null
  );
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [showYearPicker, setShowYearPicker] = useState(false);
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [showLoader, setShowLoader] = useState(false);
  const [showCardLinkModal, setShowCardLinkModal] = useState(false);
  const todayISO = useMemo(() => toISO(new Date()), []);

  const handleLinkCard = () => {
    setShowLoader(true);
  };

  const handleLoaderComplete = () => {
    setShowLoader(false);
    setShowCardLinkModal(true);
  };

  const handleCardLinkConfirm = () => {
    setShowCardLinkModal(false);
  };

  const handleCardLinkCancel = () => {
    setShowCardLinkModal(false);
  };
  return (
    <YStack
      backgroundColor="$background"
      // paddingBottom={bottomSafeAreaInset}
      flex={1}
    >
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

        <YStack>
          {/* Header */}
          <YStack padding={"$md"}>
            <HeadingSMBold>{t("addnewcarddetails.title")}</HeadingSMBold>
            <Spacer size="$reg" />
            <ParagraphMD color="$secondary">
              {t("addnewcarddetails.subtitle")}
            </ParagraphMD>
          </YStack>

          <Spacer size="$xl" />
          <YStack paddingHorizontal={"$md"}>
            <Spacer size="$reg" />

            <YStack>
              <YStack position="relative" borderRadius="$xl" height={200}>
                <AppImage name="creditCard" height={200} resizeMode="contain" />

                {/* Contactless Payment Icon */}
                <XStack
                  position="absolute"
                  justifyContent="space-between"
                  width={"80%"}
                  left={40}
                  top={30}
                  right={40}
                >
                  <AppImage name="bag" width={24} height={24} />
                  <AppImage name="waveIcon" width={24} height={24} />
                </XStack>
                <YStack position="absolute" width={"80%"} bottom={20} left={40}>
                  <XStack
                    justifyContent="space-between"
                    width={"70%"}
                    alignItems="center"
                  >
                    <LabelMD color={"$secondary"} marginBottom={2}>
                      JANE DOE
                    </LabelMD>
                    <LabelMD color={"$secondary"} marginBottom={2}>
                      08/11
                    </LabelMD>
                  </XStack>
                  <XStack justifyContent="space-between" alignItems="center">
                    <TextLGBold>0087 1157 0587 6187</TextLGBold>
                    <YStack
                      width={48}
                      height={33}
                      borderWidth={0.7}
                      backgroundColor={"$white"}
                      borderColor={"$icon"}
                      borderRadius={"$md"}
                      justifyContent="center"
                      alignItems="center"
                    >
                      <AppImage name="paymentIcon" width={31} height={18} />
                    </YStack>
                  </XStack>
                </YStack>
              </YStack>
              <Spacer size={"$lg"} />
            </YStack>
            <XStack marginBottom="$md">
              <TextMDBold>{t("addnewcarddetails.cardinfo")}</TextMDBold>
            </XStack>
            <YStack>
              <TextSMSemiBold>
                {t("addnewcarddetails.fieldfirst")}
              </TextSMSemiBold>
              <Spacer size={"$sm"} />
              <Controller
                name="cardholderName"
                control={form.control}
                rules={{
                  required: "Card Holder Name is required",
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
                          name="userIcon"
                          width={14}
                          height={18}
                        />
                      }
                      // error={fieldState.error?.message}
                      onSubmitEditing={() => form.setFocus("cardnumber")}
                    />
                    <AppImage name="warningIcon" width={16} height={16} />
                  </XStack>
                )}
              />
              <Spacer size={"$reg"} />
              <TextSMSemiBold>
                {t("addnewcarddetails.fieldsecond")}
              </TextSMSemiBold>
              <Spacer size={"$sm"} />
              <Controller
                name="cardnumber"
                control={form.control}
                rules={{
                  required: "Card Number is required",
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
                      placeholder={"0000 0000 0000 0000"}
                      width={"90%"}
                      borderWidth={0}
                      keyboardType="numeric"
                      icon={
                        <AppImage
                          tintColor={getTokenValue("$secondary")}
                          name="userIcon"
                          width={14}
                          height={18}
                        />
                      }
                      // error={fieldState.error?.message}
                      onSubmitEditing={() => form.setFocus("dob")}
                    />
                    <AppImage name="warningIcon" width={16} height={16} />
                  </XStack>
                )}
              />
              <Spacer size={"$reg"} />
              <XStack width={"100%"}>
                <YStack flex={1}>
                  <TextSMSemiBold>
                    {t("addnewcarddetails.fieldthird")}
                  </TextSMSemiBold>
                  <Spacer size={"$sm"} />
                  <Controller
                    name="dob" // e.g. "dateOfBirth"
                    control={form.control}
                    rules={{ required: "Date of Birth is required" }}
                    render={({ field, fieldState }) => {
                      const iso = field.value as string | undefined;
                      const display = iso ? formatDMY(fromISO(iso)) : "";

                      return (
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
                            placeholder={"00 / 00 / 0000"}
                            width={"85%"}
                            borderWidth={0}
                            keyboardType="numeric"
                            // error={fieldState.error?.message}
                            onSubmitEditing={() => form.setFocus("cvv")}
                          />
                          <OpTouch
                            onPress={() => {
                              setTempDateSelection(iso || null);
                              if (iso) {
                                setCalendarDate(fromISO(iso));
                              }
                              calendarBottomSheetRef.current?.handleOpenPress();
                            }}
                            hitSlop={{
                              top: 12,
                              bottom: 12,
                              left: 12,
                              right: 12,
                            }}
                          >
                            <AppImage
                              name="calendar"
                              width={16}
                              height={16}
                              tintColor={getTokenValue("$secondary")}
                            />
                          </OpTouch>
                        </XStack>
                      );
                    }}
                  />
                </YStack>
                <Spacer size={"$sm"} />
                <YStack flex={0.5}>
                  <TextSMSemiBold>
                    {t("addnewcarddetails.fieldfourth")}
                  </TextSMSemiBold>
                  <Spacer size={"$sm"} />
                  <Controller
                    name="cvv"
                    control={form.control}
                    rules={{
                      required: "Postcode is required",
                    }}
                    render={({ field, fieldState }) => (
                      <FormInput
                        value={field.value}
                        onChangeText={field.onChange}
                        placeholder={"000"}
                        //   width={"100%"}
                        borderWidth={1}
                        keyboardType="numeric"
                        icon={
                          <AppImage
                            tintColor={getTokenValue("$secondary")}
                            name="userIcon"
                            width={19}
                            height={16}
                          />
                        }
                        // error={fieldState.error?.message}
                        onSubmitEditing={() => form.setFocus("streetAddress")}
                      />
                    )}
                  />
                </YStack>
              </XStack>
              <Spacer size={"$lg"} />
              <TextMDBold>{t("addnewcarddetails.bilingaddress")}</TextMDBold>

              <Spacer size={"$reg"} />
              <TextSMSemiBold>
                {t("addnewcarddetails.fieldfifth")}
              </TextSMSemiBold>
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
                      placeholder={"Canon Street 879b"}
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
                      onSubmitEditing={() => form.setFocus("apartmentnumber")}
                    />
                    <OpTouch>
                      <AppImage name="editIcon" width={16} height={16} />
                    </OpTouch>
                  </XStack>
                )}
              />
              <Spacer size={"$reg"} />
              <TextSMSemiBold>{t("addnewcarddetails.fieldsix")}</TextSMSemiBold>
              <Spacer size={"$sm"} />
              <Controller
                name="apartmentnumber"
                control={form.control}
                rules={{
                  required: "Apartment number is required",
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
                      placeholder={"Bronx Cube No. 8"}
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
                      onSubmitEditing={() => form.setFocus("province")}
                    />
                    <OpTouch>
                      <AppImage name="editIcon" width={16} height={16} />
                    </OpTouch>
                  </XStack>
                )}
              />
              <Spacer size={"$reg"} />
              <TextSMSemiBold>
                {t("addnewcarddetails.fieldseven")}
              </TextSMSemiBold>
              <Spacer size={"$sm"} />
              <Controller
                name="province"
                control={form.control}
                rules={{
                  required: "Province is required",
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
                      placeholder={"New York"}
                      paddingHorizontal={16}
                      width={"90%"}
                      borderWidth={0}
                      icon={
                        <AppImage
                          tintColor={getTokenValue("$secondary")}
                          name="compassIcon"
                          width={19}
                          height={16}
                        />
                      }
                      // error={fieldState.error?.message}
                      onSubmitEditing={() => form.setFocus("postalcode")}
                    />
                    <OpTouch>
                      <AppImage name="editIcon" width={16} height={16} />
                    </OpTouch>
                  </XStack>
                )}
              />
              <Spacer size={"$reg"} />
              <TextSMSemiBold>
                {t("addnewcarddetails.fieldeight")}
              </TextSMSemiBold>
              <Spacer size={"$sm"} />
              <Controller
                name="postalcode"
                control={form.control}
                rules={{
                  required: "Postal Code is required",
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
                      placeholder={"1122"}
                      paddingHorizontal={16}
                      width={"90%"}
                      borderWidth={0}
                      keyboardType="numeric"
                      icon={
                        <AppImage
                          tintColor={getTokenValue("$secondary")}
                          name="postCodeIcon"
                          width={19}
                          height={16}
                        />
                      }
                      // error={fieldState.error?.message}
                      onSubmitEditing={form.handleSubmit(onSubmit)}
                    />
                    <OpTouch>
                      <AppImage name="editIcon" width={16} height={16} />
                    </OpTouch>
                  </XStack>
                )}
              />
            </YStack>
          </YStack>
        </YStack>
        <Spacer size={"$lg"} />
            </KeyboardAwareScrollView>
      {/* <ScrollView showsVerticalScrollIndicator={false}>
      </ScrollView> */}
      <YStack paddingHorizontal={"$md"}>
        <PrimaryButton
          label={t("addnewcarddetails.btn")}
          isLoading={false}
          onPress={form.handleSubmit(onSubmit)}
          icon={
            <AppImage
              size={15}
              tintColor={getTokenValue("$white")}
              name="arrowRight"
            />
          }
        />
        <Spacer size={"$lg"} />
      </YStack>
      {/* Calender Bottom Sheet  */}
      <BottomSheetModalWithView
        ref={calendarBottomSheetRef}
        enablePanDownToClose
        enableDynamicSizing={false}
        snapPoints={["83%"]}
        backgroundStyle={{
          backgroundColor: tokens.color.white,
        }}
      >
        <YStack flex={1}>
          {/* Scrollable Content */}
          <ScrollView showsVerticalScrollIndicator={false}>
            <YStack paddingHorizontal={"$md"}>
              {/* Header */}
              <YStack alignItems="center" marginBottom="$lg">
                <TextMDBold color="$darkgrey">Date of Birth</TextMDBold>
                <TextSMMedium color="$textgrey" opacity={0.7} marginTop="$xs">
                  Select your date of birth
                </TextSMMedium>
              </YStack>

              {/* iOS-style Month/Year Header */}
              <XStack
                justifyContent="center"
                alignItems="center"
                gap="$sm"
                marginBottom="$md"
              >
                <OpTouch onPress={() => setShowMonthPicker(!showMonthPicker)}>
                  <XStack
                    backgroundColor={
                      showMonthPicker
                        ? "rgba(124, 58, 237, 0.1)"
                        : "$background"
                    }
                    borderRadius="$md"
                    paddingHorizontal="$md"
                    paddingVertical="$sm"
                    alignItems="center"
                    gap="$xs"
                    borderWidth={1}
                    borderColor={
                      showMonthPicker ? tokens.color.primary : "$lightgrey"
                    }
                  >
                    <TextMDSemiBold
                      color={
                        showMonthPicker ? tokens.color.primary : "$darkgrey"
                      }
                    >
                      {calendarDate.toLocaleString("default", {
                        month: "long",
                      })}
                    </TextMDSemiBold>
                    <AppImage
                      name="arrowDown"
                      width={10}
                      height={10}
                      tintColor={
                        showMonthPicker
                          ? tokens.color.primary
                          : tokens.color.secondary
                      }
                      style={{
                        transform: [
                          { rotate: showMonthPicker ? "180deg" : "0deg" },
                        ],
                      }}
                    />
                  </XStack>
                </OpTouch>

                <OpTouch onPress={() => setShowYearPicker(!showYearPicker)}>
                  <XStack
                    backgroundColor={
                      showYearPicker ? "rgba(124, 58, 237, 0.1)" : "$background"
                    }
                    borderRadius="$md"
                    paddingHorizontal="$md"
                    paddingVertical="$sm"
                    alignItems="center"
                    gap="$xs"
                    borderWidth={1}
                    borderColor={
                      showYearPicker ? tokens.color.primary : "$lightgrey"
                    }
                  >
                    <TextMDSemiBold
                      color={
                        showYearPicker ? tokens.color.primary : "$darkgrey"
                      }
                    >
                      {calendarDate.getFullYear()}
                    </TextMDSemiBold>
                    <AppImage
                      name="arrowDown"
                      width={10}
                      height={10}
                      tintColor={
                        showYearPicker
                          ? tokens.color.primary
                          : tokens.color.secondary
                      }
                      style={{
                        transform: [
                          { rotate: showYearPicker ? "180deg" : "0deg" },
                        ],
                      }}
                    />
                  </XStack>
                </OpTouch>
              </XStack>

              {/* Month Picker - iOS Style Grid */}
              {showMonthPicker && (
                <YStack
                  backgroundColor="$background"
                  borderRadius="$xl"
                  padding="$md"
                  marginBottom="$md"
                  borderWidth={1}
                  borderColor="rgba(203, 213, 225, 0.3)"
                >
                  <YStack gap="$sm">
                    {[0, 3, 6, 9].map((startIdx) => (
                      <XStack
                        key={startIdx}
                        gap="$sm"
                        justifyContent="space-around"
                      >
                        {[0, 1, 2].map((offset) => {
                          const monthIdx = startIdx + offset;
                          const monthDate = new Date(
                            calendarDate.getFullYear(),
                            monthIdx,
                            1
                          );
                          const isCurrentMonth =
                            monthIdx === calendarDate.getMonth();
                          const monthName = monthDate.toLocaleString(
                            "default",
                            { month: "short" }
                          );

                          return (
                            <OpTouch
                              key={monthIdx}
                              flex={1}
                              onPress={() => {
                                const newDate = new Date(calendarDate);
                                newDate.setMonth(monthIdx);
                                setCalendarDate(newDate);
                                setShowMonthPicker(false);
                              }}
                            >
                              <YStack
                                backgroundColor={
                                  isCurrentMonth
                                    ? tokens.color.primary
                                    : "$white"
                                }
                                borderRadius="$lg"
                                paddingVertical="$sm"
                                alignItems="center"
                                borderWidth={isCurrentMonth ? 0 : 1}
                                borderColor="$lightgrey"
                              >
                                <TextSMSemiBold
                                  color={
                                    isCurrentMonth
                                      ? tokens.color.white
                                      : tokens.color.textgrey
                                  }
                                >
                                  {monthName}
                                </TextSMSemiBold>
                              </YStack>
                            </OpTouch>
                          );
                        })}
                      </XStack>
                    ))}
                  </YStack>
                </YStack>
              )}

              {/* Year Picker - iOS Style Scrollable List */}
              {showYearPicker && (
                <YStack
                  backgroundColor="$background"
                  borderRadius="$xl"
                  padding="$md"
                  marginBottom="$md"
                  borderWidth={1}
                  borderColor="rgba(203, 213, 225, 0.3)"
                  height={150}
                >
                  <ScrollView showsVerticalScrollIndicator={false}>
                    <YStack gap="$xs">
                      {Array.from({ length: 125 }, (_, i) => {
                        const year = new Date().getFullYear() - i;
                        const isSelected = year === calendarDate.getFullYear();

                        return (
                          <OpTouch
                            key={year}
                            onPress={() => {
                              const newDate = new Date(calendarDate);
                              newDate.setFullYear(year);
                              setCalendarDate(newDate);
                              setShowYearPicker(false);
                            }}
                          >
                            <YStack
                              backgroundColor={
                                isSelected
                                  ? tokens.color.primary
                                  : "transparent"
                              }
                              borderRadius="$md"
                              paddingVertical="$sm"
                              paddingHorizontal="$md"
                            >
                              <TextMDSemiBold
                                textAlign="center"
                                color={
                                  isSelected
                                    ? tokens.color.white
                                    : tokens.color.textgrey
                                }
                              >
                                {year}
                              </TextMDSemiBold>
                            </YStack>
                          </OpTouch>
                        );
                      })}
                    </YStack>
                  </ScrollView>
                </YStack>
              )}

              {/* Calendar Component */}
              {!showMonthPicker && !showYearPicker && (
                <YStack
                  backgroundColor="$background"
                  borderRadius="$xl"
                  padding="$md"
                  borderWidth={1}
                  borderColor="rgba(203, 213, 225, 0.3)"
                >
                  <Calendar
                    current={toISO(calendarDate)}
                    minDate={toISO(new Date(1900, 0, 1))}
                    maxDate={todayISO}
                    hideExtraDays={true}
                    markedDates={
                      tempDateSelection
                        ? {
                            [tempDateSelection]: {
                              selected: true,
                              selectedColor: tokens.color.primary,
                              selectedTextColor: tokens.color.white,
                            },
                          }
                        : {}
                    }
                    onDayPress={(day) => {
                      setTempDateSelection(day.dateString);
                    }}
                    onMonthChange={(month) => {
                      setCalendarDate(fromISO(month.dateString));
                    }}
                    theme={{
                      backgroundColor: "transparent",
                      calendarBackground: "transparent",
                      todayTextColor: tokens.color.primary,
                      todayBackgroundColor: "rgba(124, 58, 237, 0.1)",
                      arrowColor: tokens.color.primary,
                      monthTextColor: tokens.color.darkgrey,
                      textSectionTitleColor: tokens.color.textgrey,
                      dayTextColor: tokens.color.darkgrey,
                      textDisabledColor: tokens.color.lightgrey,
                      selectedDayBackgroundColor: tokens.color.primary,
                      selectedDayTextColor: tokens.color.white,
                      textDayFontFamily: "Figtree-Regular",
                      textMonthFontFamily: "Figtree-SemiBold",
                      textDayHeaderFontFamily: "Figtree-Medium",
                      textDayFontSize: 14,
                      textMonthFontSize: 16,
                      textDayHeaderFontSize: 12,
                    }}
                    renderArrow={(direction) => (
                      <AppImage
                        name="arrowBack"
                        width={16}
                        height={16}
                        tintColor={tokens.color.primary}
                        style={{
                          transform: [
                            {
                              rotate: direction === "right" ? "180deg" : "0deg",
                            },
                          ],
                        }}
                      />
                    )}
                    renderHeader={() => null}
                    style={{
                      borderRadius: 12,
                    }}
                  />
                </YStack>
              )}
              <Spacer size={"$sm"} />
              {/* Quick Actions */}
              <XStack gap="$sm" justifyContent="center">
                <OpTouch
                  onPress={() => {
                    const today = new Date();
                    setCalendarDate(today);
                    setTempDateSelection(toISO(today));
                  }}
                >
                  <YStack
                    backgroundColor="$background"
                    borderRadius="$md"
                    paddingHorizontal="$md"
                    paddingVertical="$sm"
                    borderWidth={1}
                    borderColor="$lightgrey"
                  >
                    <TextSMMedium color="$primary">Today</TextSMMedium>
                  </YStack>
                </OpTouch>

                <OpTouch
                  onPress={() => {
                    setTempDateSelection(null);
                  }}
                >
                  <YStack
                    backgroundColor="$background"
                    borderRadius="$md"
                    paddingHorizontal="$md"
                    paddingVertical="$sm"
                    borderWidth={1}
                    borderColor="$lightgrey"
                  >
                    <TextSMMedium color="$textgrey">Clear</TextSMMedium>
                  </YStack>
                </OpTouch>
              </XStack>
            </YStack>
            <Spacer size={"$lg"} />
          </ScrollView>
          {/* Sticky Save Button Footer */}
          <YStack
            paddingHorizontal="$lg"
            backgroundColor={tokens.color.white}
            borderTopWidth={1}
            borderTopColor="rgba(203, 213, 225, 0.3)"
          >
            <PrimaryButton
              label={
                tempDateSelection
                  ? `Select ${formatDMY(fromISO(tempDateSelection))}`
                  : "Select Date"
              }
              onPress={() => {
                if (tempDateSelection) {
                  form.setValue("dob", tempDateSelection);
                  calendarBottomSheetRef.current?.handleClosePress();
                  setShowMonthPicker(false);
                  setShowYearPicker(false);
                }
              }}
              width="100%"
              isLoading={false}
            />
          </YStack>
        </YStack>
      </BottomSheetModalWithView>

      {/* Loader Screen Modal */}
      <Modal visible={showLoader} animationType="fade" transparent={false}>
        <LoaderScreen onComplete={handleLoaderComplete} duration={3000} />
      </Modal>

     
      <CardLinkModal
        visible={showCardLinkModal}
        expectedName="John Doe"
        onConfirm={handleCardLinkConfirm}
        onCancel={handleCardLinkCancel}
      />
    </YStack>
  );
};

export default AddNewCardDetails;
