import {
  HeadingSMBold,
  ParagraphMD,
  TextMDBold,
  TextSMMedium,
  TextSMRegular,
  TextSMSemiBold,
} from "@/components/atoms";
import { AppImage } from "@/components/atoms/AppImage";
import { FormInput } from "@/components/atoms/FormInput";
import { OpTouch } from "@/components/atoms/OpTouch";
import { Spacer } from "@/components/atoms/Spacer";
import { TextMDRegular } from "@/components/atoms/texts/TextMDRegular";
import { TextMDSemiBold } from "@/components/atoms/texts/TextMDSemiBold";
import { BottomSheetModalWithView } from "@/components/molecules/bottom-sheets";
import type { BaseBottomSheetRef } from "@/components/molecules/bottom-sheets/types";
import { PrimaryButton } from "@/components/molecules/buttons/PrimaryButton";
import { SHADOW_STYLES } from "@/constants/styles";
import { tokens } from "@/tamagui/token";
import { t } from "@/translations";
import { useMemo, useRef, useState, useEffect, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { Controller, useForm } from "react-hook-form";
import { ScrollView } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCustomAlert } from "@/components/molecules/CustomAlert";
import { Calendar } from "react-native-calendars";
import CountryPicker, {
  Country,
  CountryCode,
} from "react-native-country-picker-modal";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { getTokenValue, XStack, YStack } from "tamagui";
import { useGetProfile, useUpdateProfile, getGetProfileQueryKey } from "@/api/generated/authentication/authentication";
import { useGetAddresses, getGetAddressesQueryKey } from "@/api/generated/addresses/addresses";
import { useQueryClient } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";

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

const PersonalInfo = () => {
  const queryClient = useQueryClient();
  const params = useLocalSearchParams();
  const form = useForm();
  const { showAlert, AlertComponent } = useCustomAlert();
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [pendingAddressId, setPendingAddressId] = useState<string | null>(null);
  const [pendingAddressText, setPendingAddressText] = useState<string | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<Country>({
    callingCode: ["44"],
    cca2: "GB",
    currency: ["GBP"],
    flag: "flag-gb",
    name: "United Kingdom",
    region: "Europe",
    subregion: "Northern Europe",
  });
  const genderBottomSheetRef = useRef<BaseBottomSheetRef>(null);
  const calendarBottomSheetRef = useRef<BaseBottomSheetRef>(null);
  const [selectedGender, setSelectedGender] = useState<
    "male" | "female" | null
  >(null);
  const [tempGenderSelection, setTempGenderSelection] = useState<
    "male" | "female" | null
  >(null);
  const [tempDateSelection, setTempDateSelection] = useState<string | null>(
    null
  );
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [showYearPicker, setShowYearPicker] = useState(false);
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const { bottom: bottomSafeAreaInset } = useSafeAreaInsets();
  const todayISO = useMemo(() => toISO(new Date()), []);

  // Get user profile data
  const { data: profileApiData, isLoading: isLoadingProfile, refetch: refetchProfile } = useGetProfile();
  const user = profileApiData?.data?.user;

  // Get addresses to display selected address
  const { data: addressesData } = useGetAddresses();

  // Refetch profile when screen comes back into focus (after address selection)
  useFocusEffect(
    useCallback(() => {
      console.log("PersonalInfo screen focused - refetching profile");
      refetchProfile();

      // Check AsyncStorage for pending selected address
      AsyncStorage.getItem("pendingSelectedAddress")
        .then((data) => {
          if (data) {
            console.log("[PersonalInfo] Found pending address in storage:", data);
            const addressData = JSON.parse(data);
            setPendingAddressId(addressData.id);
            setPendingAddressText(addressData.text);

            // Clear the storage after reading
            AsyncStorage.removeItem("pendingSelectedAddress");
          }
        })
        .catch((error) => {
          console.error("[PersonalInfo] Failed to read pending address:", error);
        });
    }, [refetchProfile])
  );

  // Check if address was selected from address list
  useEffect(() => {
    console.log("Params changed:", params);
    if (params.selectedAddressId) {
      console.log("Address selected from list:", params.selectedAddressId);
      console.log("Address text:", params.selectedAddressText);
      setPendingAddressId(params.selectedAddressId as string);
      setPendingAddressText(params.selectedAddressText as string);
    }
  }, [params.selectedAddressId, params.selectedAddressText]);

  // Debug: log pending address and addresses data
  useEffect(() => {
    if (pendingAddressId) {
      console.log("Pending address ID:", pendingAddressId);
      const addresses = Array.isArray(addressesData?.data)
        ? addressesData.data
        : (addressesData?.data?.addresses || []);
      console.log("Available addresses:", addresses);
      if (addresses.length > 0) {
        const found = addresses.find((addr: any) => addr.id === pendingAddressId);
        console.log("Found selected address:", found);
      }
    }
  }, [pendingAddressId, addressesData]);

  // Update profile mutation
  const { mutate: updateProfileMutation, isPending: isUpdating } = useUpdateProfile({
    mutation: {
      onSuccess: () => {
        // Invalidate all related queries
        queryClient.invalidateQueries({ queryKey: getGetProfileQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetAddressesQueryKey() }); // Invalidate addresses list
        console.log("[PersonalInfo] Invalidated all address-related caches");
        // Don't show alert here - will show on profile screen after navigation
      },
      onError: (error: any) => {
        showAlert({
          type: "error",
          title: "Error",
          message: error?.response?.data?.message || "Failed to update profile",
        });
      },
    },
  });

  // Prefill form with user data
  useEffect(() => {
    if (user) {
      console.log("Prefilling form with user data:", JSON.stringify(user, null, 2));

      // Full Name - now guaranteed to be present (empty string if not set)
      form.setValue("fullname", (user as any).fullName || "");

      // Email (read-only)
      form.setValue("email", user.email || "");

      // Phone Number - correct field name
      form.setValue("phone", (user as any).phoneNumber || "");

      // Gender - now guaranteed to be present (empty string if not set)
      const userGender = (user as any).gender;
      if (userGender) {
        form.setValue("gender", userGender);
        setSelectedGender(userGender as "male" | "female");
      }

      // Date of Birth - now guaranteed to be present (empty string if not set)
      const userDOB = (user as any).dateOfBirth;
      if (userDOB) {
        try {
          // Parse the ISO date and convert to YYYY-MM-DD format for form
          const dateObj = new Date(userDOB);
          const isoDate = toISO(dateObj); // Convert to YYYY-MM-DD
          form.setValue("dob", isoDate);
          setCalendarDate(dateObj);
          console.log("Parsed DOB:", userDOB, "->", isoDate);
        } catch (e) {
          console.log("Invalid date format:", userDOB);
        }
      }

      // Country - set the country picker based on country code from API
      const userCountry = (user as any).country;
      if (userCountry && userCountry !== selectedCountry.cca2) {
        console.log("Setting user country to:", userCountry);
        // Manually create country object for common countries
        const countryData: Record<string, Country> = {
          US: { cca2: "US", name: "United States", callingCode: ["1"], currency: ["USD"], flag: "flag-us", region: "Americas", subregion: "North America" },
          GB: { cca2: "GB", name: "United Kingdom", callingCode: ["44"], currency: ["GBP"], flag: "flag-gb", region: "Europe", subregion: "Northern Europe" },
          CA: { cca2: "CA", name: "Canada", callingCode: ["1"], currency: ["CAD"], flag: "flag-ca", region: "Americas", subregion: "North America" },
          PK: { cca2: "PK", name: "Pakistan", callingCode: ["92"], currency: ["PKR"], flag: "flag-pk", region: "Asia", subregion: "Southern Asia" },
          IN: { cca2: "IN", name: "India", callingCode: ["91"], currency: ["INR"], flag: "flag-in", region: "Asia", subregion: "Southern Asia" },
        };

        if (countryData[userCountry]) {
          setSelectedCountry(countryData[userCountry]);
        }
      }

      // Default Address - new field
      const defaultAddr = (user as any).defaultAddress;
      if (defaultAddr) {
        console.log("Default address:", defaultAddr);
      }
    }
  }, [user]);

  const onSelectCountry = (country: Country) => {
    setSelectedCountry(country);
    setShowCountryPicker(false);
  };

  const handleSaveChanges = () => {
    const formData = form.getValues();

    console.log("[PersonalInfo] Saving profile with data:", formData);
    console.log("[PersonalInfo] Pending address ID:", pendingAddressId);

    // Prepare the update data - only include fields with values
    const updateData: any = {
      name: formData.fullname,
      phone: formData.phone,
      country: selectedCountry.cca2 || "",
    };

    // Only include gender if set (backend rejects empty string)
    if (formData.gender) {
      updateData.gender = formData.gender;
    }

    // Only include dateOfBirth if set (backend rejects empty string)
    if (formData.dob) {
      updateData.dateOfBirth = formData.dob;
    }

    // If there's a pending address, include it in the profile update
    // The backend expects addressIndex (the index of address in the addresses array)
    if (pendingAddressId && pendingAddressId !== "undefined") {
      console.log("[PersonalInfo] Including address index in profile update:", pendingAddressId);

      // The pendingAddressId is the index (0, 1, 2, etc.) from the address list
      updateData.addressIndex = parseInt(pendingAddressId, 10);
    }

    console.log("[PersonalInfo] Final update data:", JSON.stringify(updateData, null, 2));

    // Update profile (including address if selected)
    updateProfileMutation(
      { data: updateData },
      {
        onSuccess: async (response) => {
          console.log("[PersonalInfo] Profile update response:", JSON.stringify(response, null, 2));

          // Wait a bit for the backend to process the address update
          // Then refetch profile to get the updated default address
          const refetchResult = await refetchProfile();
          console.log("[PersonalInfo] Refetched profile:", JSON.stringify(refetchResult.data?.data?.user?.defaultAddress, null, 2));

          // Clear pending state after refetch completes
          setPendingAddressId(null);
          setPendingAddressText(null);

          // Set success flag for profile screen
          await AsyncStorage.setItem("profileUpdateSuccess", "true");

          // Navigate back to profile screen
          router.back();
        },
        onError: (error: any) => {
          console.error("[PersonalInfo] Profile update error:", JSON.stringify(error?.response?.data, null, 2));
        },
      }
    );
  };

  return (
    <>
      <AlertComponent />
      <YStack
        backgroundColor="$background"
      paddingBottom={bottomSafeAreaInset}
      flex={1}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        <YStack padding={"$md"}>
          <HeadingSMBold>{"Personal Info"}</HeadingSMBold>
        </YStack>
        <Spacer size={"$md"} />
        <YStack paddingHorizontal={"$md"}>
          <TextSMSemiBold>{"Full Name"}</TextSMSemiBold>
          <Spacer size={"$sm"} />

          <Controller
            name="fullname"
            control={form.control}
            rules={{
              required: "Full Name is required",
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
                  placeholder={"Melissa Johnsn"}
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
                  error={fieldState.error?.message}
                />
                <AppImage name="editIcon" width={16} height={16} />
              </XStack>
            )}
          />
          <Spacer size={"$reg"} />
          <TextSMSemiBold>{"Country"}</TextSMSemiBold>
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
          <TextSMSemiBold>{"Gender"}</TextSMSemiBold>
          <Spacer size={"$sm"} />
          <Controller
            name="gender"
            control={form.control}
            rules={{
              required: "Gender is required",
            }}
            render={({ field }) => {
              const genderValue =
                (field.value as "male" | "female" | null) ?? null;
              const genderLabel =
                genderValue === "male"
                  ? "Male"
                  : genderValue === "female"
                  ? "Female"
                  : "Select Gender";

              // Sync selectedGender with form value
              if (selectedGender !== genderValue) {
                setSelectedGender(genderValue);
              }

              return (
                <OpTouch
                  onPress={() => {
                    setTempGenderSelection(genderValue);
                    genderBottomSheetRef.current?.handleOpenPress();
                  }}
                >
                  <XStack
                    borderWidth={1}
                    borderColor="$lightgrey"
                    borderRadius="$full"
                    alignItems="center"
                    backgroundColor="$white"
                    paddingHorizontal="$md"
                    paddingVertical="$reg"
                    justifyContent="space-between"
                  >
                    <XStack alignItems="center">
                      <AppImage
                        name="genderIcon"
                        width={15}
                        height={15}
                        tintColor={getTokenValue("$secondary")}
                      />
                      <Spacer size="$reg" />
                      <TextMDRegular
                        color={genderValue ? "$black" : "$secondary"}
                      >
                        {genderLabel}
                      </TextMDRegular>
                    </XStack>
                    <AppImage
                      name="arrowDown"
                      width={14}
                      height={8}
                      tintColor={getTokenValue("$secondary")}
                    />
                  </XStack>
                </OpTouch>
              );
            }}
          />
          <Spacer size={"$reg"} />
          <TextSMSemiBold>{"Date of Birth"}</TextSMSemiBold>
          <Spacer size={"$sm"} />
          <Controller
            name="dob" // e.g. "dateOfBirth"
            control={form.control}
            rules={{ required: "Date of Birth is required" }}
            render={({ field }) => {
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
                    value={display}
                    onChangeText={() => {}}
                    editable={false}
                    placeholder={"DD / MM / YYYY"}
                    width={"90%"}
                    borderWidth={0}
                  />
                  <OpTouch
                    onPress={() => {
                      setTempDateSelection(iso || null);
                      if (iso) {
                        setCalendarDate(fromISO(iso));
                      }
                      calendarBottomSheetRef.current?.handleOpenPress();
                    }}
                    hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
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

          <Spacer size={"$reg"} />
          <TextSMSemiBold>{t("profile.phoneNumber.label")}</TextSMSemiBold>
          <Spacer size={"$sm"} />
          <YStack
            borderRadius={"$3xl"}
            borderWidth={1}
            borderColor="$lightgrey"
            backgroundColor="$white"
            overflow="hidden"
          >
            <Controller
              control={form.control}
              name="phone"
              rules={{
                required: "Phone number is required",
                minLength: {
                  value: 10,
                  message: "Phone number too short",
                },
                // validate: validatePhoneNumber,
              }}
              render={({ field: { onChange, value }, fieldState }) => (
                <XStack alignItems="center">
                  <OpTouch onPress={() => setShowCountryPicker(true)}>
                    <XStack
                      alignItems="center"
                      // borderWidth={1}
                      borderRightWidth={1}
                      borderRightColor="$lightgrey"
                      paddingHorizontal={"$reg"}
                      backgroundColor="$background"
                      paddingVertical={"$reg"}
                    >
                      <CountryPicker
                        countryCode={selectedCountry.cca2 as CountryCode}
                        withFilter
                        withFlag
                        withCallingCode
                        withEmoji
                        onSelect={onSelectCountry}
                        onClose={() => setShowCountryPicker(false)}
                        visible={showCountryPicker}
                        theme={{
                          flagSizeButton: 20,
                        }}
                      />
                      <Spacer size={"$xxs"} />
                      <AppImage
                        name="arrowDown"
                        width={14}
                        height={8}
                        tintColor={getTokenValue("$lightgrey")}
                      />
                    </XStack>
                  </OpTouch>
                  <XStack alignItems="center" paddingHorizontal={"$reg"}>
                    <TextMDSemiBold color="$secondary">
                      +{selectedCountry.callingCode[0]}
                    </TextMDSemiBold>
                    <FormInput
                      width={"70%"}
                      borderWidth={0}
                      paddingHorizontal={0}
                      value={value}
                      keyboardType="numeric"
                      onChangeText={(text) => {
                        // Only allow numbers
                        const numericText = text.replace(/[^0-9]/g, "");
                        onChange(numericText);
                      }}
                      placeholder={t("profile.phoneNumber.placeholder")}
                    />
                    <OpTouch onPress={() => setShowCountryPicker(true)}>
                      <AppImage name="warningIcon" width={16} height={16} />
                    </OpTouch>
                  </XStack>
                </XStack>
              )}
            />
          </YStack>

          <Spacer size={"$reg"} />
          <TextSMSemiBold>{"Email Address"}</TextSMSemiBold>
          <Spacer size={"$sm"} />
          <Controller
            name="email"
            control={form.control}
            rules={{
              required: "Email is required",
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
                  placeholder={"melissa@gmail.com"}
                  width={"90%"}
                  keyboardType="email-address"
                  borderWidth={0}
                  icon={
                    <AppImage
                      tintColor={getTokenValue("$secondary")}
                      name="emailIcon"
                      width={14}
                      height={18}
                    />
                  }
                  error={fieldState.error?.message}
                />
                <OpTouch>
                  <AppImage name="editIcon" width={14} height={14} />
                </OpTouch>
              </XStack>
            )}
          />
          <Spacer size={"$lg"} />

          <XStack justifyContent="space-between">
            <TextMDBold>{"Address"}</TextMDBold>
            <OpTouch
              onPress={() =>
                router.push({
                  pathname: "/allAddressList",
                  params: { returnTo: "personalInfo" },
                })
              }
            >
              <TextSMMedium color="$primary">{"Change"}</TextSMMedium>
            </OpTouch>
          </XStack>
          <Spacer size={"$lg"} />

          <OpTouch
            onPress={() =>
              router.push({
                pathname: "/allAddressList",
                params: { returnTo: "personalInfo" },
              })
            }
          >
            <YStack
              style={{
                ...SHADOW_STYLES,
              }}
              backgroundColor="$white"
              borderRadius={"$2xl"}
              padding="$reg"
            >
              <XStack>
                <YStack
                  marginTop={-2}
                  justifyContent="center"
                  alignItems="center"
                  borderRadius={"$full"}
                  width={40}
                  height={40}
                  backgroundColor={"$background"}
                >
                  <AppImage
                    name="locationIconUnfilled"
                    width={14}
                    height={18}
                    tintColor={getTokenValue("$secondary")}
                  />
                </YStack>
                <Spacer size={"$sm"} />
                <ParagraphMD flex={1} color="$secondary" flexWrap="wrap">
                  {(() => {
                    // If there's a pending address text, show it directly
                    if (pendingAddressText) {
                      return pendingAddressText;
                    }

                    // First check profile's defaultAddress
                    const profileDefault = (user as any)?.defaultAddress;
                    if (profileDefault && Object.keys(profileDefault).length > 0) {
                      return [
                        profileDefault.address1,
                        profileDefault.address2,
                        profileDefault.city,
                        profileDefault.province,
                        profileDefault.country,
                        profileDefault.zip,
                      ]
                        .filter(Boolean)
                        .join(", ");
                    }

                    // Fallback: find address with isDefault: true from addresses list
                    // Backend returns array directly or in .addresses property
                    const addresses = Array.isArray(addressesData?.data)
                      ? addressesData.data
                      : (addressesData?.data?.addresses || []);
                    const defaultFromList = addresses.find((addr: any) => addr.isDefault === true);
                    if (defaultFromList) {
                      return [
                        defaultFromList.address1,
                        defaultFromList.address2,
                        defaultFromList.city,
                        defaultFromList.province,
                        defaultFromList.country,
                        defaultFromList.zip,
                      ]
                        .filter(Boolean)
                        .join(", ");
                    }

                    // If no default found, use the first address
                    if (addresses.length > 0) {
                      const firstAddr = addresses[0];
                      return [
                        firstAddr.address1,
                        firstAddr.address2,
                        firstAddr.city,
                        firstAddr.province,
                        firstAddr.country,
                        firstAddr.zip,
                      ]
                        .filter(Boolean)
                        .join(", ");
                    }

                    return "No address added. Tap to add an address.";
                  })()}
                </ParagraphMD>
              </XStack>
            </YStack>
          </OpTouch>
          <Spacer size={"$lg"} />
          <YStack justifyContent="center" alignItems="center">
            <AppImage name="unLock" width={15} height={16} />
            <Spacer size={"$reg"} />
            <TextSMRegular textAlign="center" color={"$secondary"}>
              {
                "Your profile information is safe with us and we don’t share data to anyone."
              }
            </TextSMRegular>
          </YStack>
          <Spacer size={"$lg"} />
        </YStack>
      </ScrollView>
      <YStack paddingHorizontal={"$md"}>
        <PrimaryButton
          label="Save Changes"
          onPress={handleSaveChanges}
          width={"100%"}
          iconPosition="right"
          icon={
            <AppImage
              tintColor={getTokenValue("$white")}
              name="check"
              width={16}
              height={16}
            />
          }
          isLoading={isUpdating}
        />
      </YStack>

      {/* Gender Selection Bottom Sheet Modal */}
      <BottomSheetModalWithView
        ref={genderBottomSheetRef}
        enablePanDownToClose
        enableDynamicSizing
        backgroundStyle={{
          backgroundColor: tokens.color.white,
        }}
        style={{
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.15,
          shadowRadius: 30,
          elevation: 20,
        }}
      >
        <YStack padding="$lg" paddingBottom="$xl" gap="$md">
          {/* Header */}
          <YStack alignItems="center" marginBottom="$sm">
            <TextMDBold textAlign="center" color="$darkgrey">
              Select Gender
            </TextMDBold>
            <TextSMMedium
              textAlign="center"
              color="$textgrey"
              opacity={0.7}
              marginTop="$xs"
            >
              Choose your gender identity
            </TextSMMedium>
          </YStack>

          {/* Gender Options - More Elegant Sizes */}
          <XStack gap="$sm" justifyContent="center">
            <OpTouch
              flex={1}
              onPress={() => {
                setTempGenderSelection("female");
              }}
            >
              <YStack
                backgroundColor={
                  tempGenderSelection === "female"
                    ? "rgba(124, 58, 237, 0.1)"
                    : "rgba(255, 255, 255, 0.6)"
                }
                borderWidth={tempGenderSelection === "female" ? 1.5 : 1}
                borderColor={
                  tempGenderSelection === "female"
                    ? tokens.color.primary
                    : "rgba(203, 213, 225, 0.3)"
                }
                borderRadius="$xl"
                padding="$md"
                alignItems="center"
                justifyContent="center"
                minHeight={72}
                style={{
                  // @ts-ignore - for glass effect
                  backdropFilter: "blur(8px)",
                  ...(tempGenderSelection === "female"
                    ? {
                        shadowColor: tokens.color.primary,
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.15,
                        shadowRadius: 8,
                        elevation: 4,
                      }
                    : {
                        shadowColor: "#000",
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.05,
                        shadowRadius: 4,
                        elevation: 2,
                      }),
                }}
              >
                <YStack
                  backgroundColor={
                    tempGenderSelection === "female"
                      ? tokens.color.primary
                      : "rgba(124, 58, 237, 0.1)"
                  }
                  borderRadius="$full"
                  width={32}
                  height={32}
                  alignItems="center"
                  justifyContent="center"
                  marginBottom="$xs"
                >
                  <AppImage
                    name="genderIcon"
                    width={18}
                    height={18}
                    tintColor={
                      tempGenderSelection === "female"
                        ? tokens.color.white
                        : tokens.color.primary
                    }
                  />
                </YStack>
                <TextSMSemiBold
                  color={
                    tempGenderSelection === "female"
                      ? tokens.color.primary
                      : tokens.color.darkgrey
                  }
                >
                  Female
                </TextSMSemiBold>
              </YStack>
            </OpTouch>

            <OpTouch
              flex={1}
              onPress={() => {
                setTempGenderSelection("male");
              }}
            >
              <YStack
                backgroundColor={
                  tempGenderSelection === "male"
                    ? "rgba(124, 58, 237, 0.1)"
                    : "rgba(255, 255, 255, 0.6)"
                }
                borderWidth={tempGenderSelection === "male" ? 1.5 : 1}
                borderColor={
                  tempGenderSelection === "male"
                    ? tokens.color.primary
                    : "rgba(203, 213, 225, 0.3)"
                }
                borderRadius="$xl"
                padding="$md"
                alignItems="center"
                justifyContent="center"
                minHeight={72}
                style={{
                  // @ts-ignore - for glass effect
                  backdropFilter: "blur(8px)",
                  ...(tempGenderSelection === "male"
                    ? {
                        shadowColor: tokens.color.primary,
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.15,
                        shadowRadius: 8,
                        elevation: 4,
                      }
                    : {
                        shadowColor: "#000",
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.05,
                        shadowRadius: 4,
                        elevation: 2,
                      }),
                }}
              >
                <YStack
                  backgroundColor={
                    tempGenderSelection === "male"
                      ? tokens.color.primary
                      : "rgba(124, 58, 237, 0.1)"
                  }
                  borderRadius="$full"
                  width={32}
                  height={32}
                  alignItems="center"
                  justifyContent="center"
                  marginBottom="$xs"
                >
                  <AppImage
                    name="genderIcon"
                    width={18}
                    height={18}
                    tintColor={
                      tempGenderSelection === "male"
                        ? tokens.color.white
                        : tokens.color.primary
                    }
                  />
                </YStack>
                <TextSMSemiBold
                  color={
                    tempGenderSelection === "male"
                      ? tokens.color.primary
                      : tokens.color.darkgrey
                  }
                >
                  Male
                </TextSMSemiBold>
              </YStack>
            </OpTouch>
          </XStack>

          {/* Save Button */}
          <YStack marginTop="$md">
            <OpTouch
              disabled={!tempGenderSelection}
              onPress={() => {
                if (tempGenderSelection) {
                  form.setValue("gender", tempGenderSelection);
                  setSelectedGender(tempGenderSelection);
                  genderBottomSheetRef.current?.handleClosePress();
                }
              }}
            >
              <YStack opacity={tempGenderSelection ? 1 : 0.5}>
                <PrimaryButton
                  label="Save Selection"
                  onPress={() => {
                    if (tempGenderSelection) {
                      form.setValue("gender", tempGenderSelection);
                      setSelectedGender(tempGenderSelection);
                      genderBottomSheetRef.current?.handleClosePress();
                    }
                  }}
                  width="100%"
                  isLoading={false}
                />
              </YStack>
            </OpTouch>
          </YStack>
        </YStack>
      </BottomSheetModalWithView>

      {/* Date Picker Bottom Sheet Modal - iOS Style */}
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
    </YStack>
    </>
  );
};

export default PersonalInfo;
