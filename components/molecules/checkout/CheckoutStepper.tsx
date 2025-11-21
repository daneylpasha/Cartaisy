import React from "react";
import { View } from "react-native"; // ⬅️ use RN View
import { XStack, YStack, getTokenValue } from "tamagui";

import { TextSMSemiBold } from "@/components/atoms";
import { OpTouch } from "@/components/atoms/OpTouch";
import { tokens } from "@/tamagui/token";
import { getPrimaryLight } from "@/utils/colorUtils";

export type StepStatus = "completed" | "active" | "pending";

export interface CheckoutStep {
  label: string;
  status: StepStatus;
}

interface CheckoutStepperProps {
  steps: CheckoutStep[];
  currentStep?: number;
  onStepPress?: (stepIndex: number) => void;
}

export const CheckoutStepper = ({
  steps,
  currentStep = 0,
  onStepPress,
}: CheckoutStepperProps) => {
  const padX = getTokenValue("$4xl"); // ⬅️ to cancel outer padding for full-bleed

  const getStepStatus = (index: number): StepStatus => {
    if (index < currentStep) return "completed";
    if (index === currentStep) return "active";
    return "pending";
  };

  const renderCircle = (status: StepStatus) => {
    if (status === "completed") {
      return (
        <YStack
          width={24}
          height={24}
          borderRadius={"$full"}
          borderWidth={2}
          borderColor={"$primary"}
          backgroundColor={"$primary"}
          justifyContent="center"
          alignItems="center"
        >
          <YStack
            width={8}
            height={8}
            borderRadius={"$full"}
            backgroundColor={"$white"}
          />
        </YStack>
      );
    }

    if (status === "active") {
      return (
        <YStack
          borderWidth={6}
          borderColor={getPrimaryLight(tokens.color.primary)}
          borderRadius={"$full"}
        >
          <YStack
            width={24}
            height={24}
            borderRadius={"$full"}
            borderWidth={2}
            borderColor={"$primary"}
            backgroundColor={"$white"}
            justifyContent="center"
            alignItems="center"
          >
            <YStack
              width={8}
              height={8}
              borderRadius={"$full"}
              backgroundColor={"$primary"}
            />
          </YStack>
        </YStack>
      );
    }

    return (
      <YStack
        width={24}
        height={24}
        borderRadius={"$full"}
        borderWidth={1}
        borderColor={"$lightgrey"}
        backgroundColor={"$white"}
        justifyContent="center"
        alignItems="center"
      >
        <YStack
          width={8}
          height={8}
          borderRadius={"$full"}
          backgroundColor={"$lightgrey"}
        />
      </YStack>
    );
  };

  const getLineColor = (fromStatus: StepStatus) =>
    fromStatus === "completed" ? tokens.color.primary : tokens.color.lightgrey;

  const getTextColor = (status: StepStatus) =>
    status === "pending" ? tokens.color.lightgrey : tokens.color.black;
  const segmentColor = (segmentIndex: number) =>
    segmentIndex <= currentStep ? tokens.color.primary : tokens.color.lightgrey;

  return (
    <YStack width="100%" paddingHorizontal="$md" paddingVertical="$md">
      <XStack alignItems="center" style={{ marginHorizontal: -padX }}>
        <View
          style={{ flex: 1, height: 2, backgroundColor: segmentColor(0) }}
        />

        {steps.map((step, index) => {
          const status = step.status || getStepStatus(index);

          return (
            <React.Fragment key={index}>
              <OpTouch
                onPress={() => {
                  // Only allow clicking on completed steps (backward navigation)
                  if (status === "completed" && onStepPress) {
                    onStepPress(index);
                  }
                }}
                disabled={status !== "completed"}
              >
                {renderCircle(status)}
              </OpTouch>
              <View
                style={{
                  flex: 1,
                  height: 2,

                  backgroundColor: segmentColor(index + 1),
                }}
              />
            </React.Fragment>
          );
        })}
      </XStack>

      {/* Row 2: labels under circles */}
      <XStack
        justifyContent="space-between"
        paddingHorizontal={"$sm"}
        marginTop="$xs"
      >
        {steps.map((step, index) => {
          return (
            <TextSMSemiBold marginLeft={20} key={index}>
              {step.label}
            </TextSMSemiBold>
          );
        })}
      </XStack>
    </YStack>
  );
};
