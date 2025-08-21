import { AppImage } from "@/components/atoms/AppImage";
import { OpTouch } from "@/components/atoms/OpTouch";
import { Spacer } from "@/components/atoms/Spacer";
import { TextMDRegular } from "@/components/atoms/texts/TextMDRegular";
import React, { useState } from "react";
import { Text, XStack, YStack } from "tamagui";

type Gender = "male" | "female" | null;

export function GenderDropdown({
  value,
  onChange,
}: {
  value: Gender;
  onChange: (v: Gender) => void;
}) {
  const [open, setOpen] = useState(false);
  const label =
    value === "male" ? "Male" : value === "female" ? "Female" : "Female";

  return (
    <YStack>
      {/* Input pill */}
      <XStack
        // height={56}
        borderRadius={"$3xl"}
        backgroundColor={"$white"}
        borderWidth={1}
        borderColor={"$lightgrey"}
        paddingHorizontal={"$md"}
        paddingVertical={"$reg"}
        alignItems="center"
        justifyContent="space-between"
      >
        <XStack alignItems="center">
          <AppImage name={"genderIcon"} width={15} height={15} />
          <Spacer size={"$reg"} />
          <TextMDRegular color={value ? "$black" : "$secondary"}>
            {label}
          </TextMDRegular>
        </XStack>

        {/* Only arrow toggles dropdown */}
        <OpTouch
          onPress={() => setOpen((s) => !s)}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <AppImage
            name="arrowDown"
            width={14}
            height={15}
            style={{ transform: [{ rotate: open ? "180deg" : "0deg" }] }}
          />
        </OpTouch>
      </XStack>

      {/* Inline dropdown */}
      <Spacer size={"$sm"} />
      {open && (
        <YStack
          borderWidth={1}
          borderColor={"$lightgrey"}
          borderRadius={16}
          backgroundColor={"$white"}
          overflow="hidden"
        >
          {(["male", "female"] as const).map((g) => (
            <OpTouch
              key={g}
              onPress={() => {
                onChange(g);
                setOpen(false);
              }}
            >
              <XStack paddingHorizontal={"$md"} paddingVertical={"$sm"}>
                <Text fontSize={15}>{g === "male" ? "Male" : "Female"}</Text>
              </XStack>
            </OpTouch>
          ))}
        </YStack>
      )}
    </YStack>
  );
}
