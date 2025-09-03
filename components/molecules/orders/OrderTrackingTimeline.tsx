import { TextMDSemiBold, TextSMBold, TextSMMedium } from "@/components/atoms";
import { Spacer } from "@/components/atoms/Spacer";
import { ParagraphSM } from "@/components/atoms/texts/ParagraphSM";
import React from "react";
import { XStack, YStack } from "tamagui";

export type StepStatus = "completed" | "active" | "pending";

export type TimelineStep = {
  dateLabel?: string;
  title: string;
  subtitle?: string;
  status?: StepStatus;
};

const steps: TimelineStep[] = [
  {
    dateLabel: "Jan 12",
    title: "Ordered Today",
    subtitle: "Your order is received",
    status: "completed",
  },
  {
    dateLabel: "Jan 13",
    title: "Your order has been confirmed",
    subtitle: "Your order is being shipped",
    status: "completed",
  },
  {
    dateLabel: "Jan 14 - Jan 17",
    title: "Your order is being delivered",
    subtitle: "Your order is being delivered",
    status: "active",
  },
  {
    dateLabel: "Jan 18",
    title: "Your order is completed",
    subtitle: "You have received your order",
    status: "pending",
  },
];

type Props = {
  items?: TimelineStep[];
  activeIndex?: number;
  setActiveIndex?: (index: number) => void;
};

const OrderTimeline: React.FC<Props> = ({
  items = steps,
  activeIndex,
  setActiveIndex,
}) => {
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
          borderColor={"$primarylight"}
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

  return (
    <YStack width="100%" >
      {items.map((step, index) => {
        const status = step.status || "pending";
        const isLast = index === items.length - 1;

        return (
          <XStack key={index}>
            <YStack alignItems="center" width={34}>
              {renderCircle(status)}

              {!isLast && (
                <YStack
                  width={2}
                  flex={1}
                  backgroundColor={
                    status === "completed" ? "$primary" : "$lightgrey"
                  }
                  marginTop={4}
                />
              )}
            </YStack>

            <Spacer size={"$md"} />

            <YStack flex={1} paddingVertical={"$reg"} >
              {step.dateLabel && (
                <>
                  <TextSMMedium color={"$secondary"}>
                    {step.dateLabel}
                  </TextSMMedium>
                  {/* <Spacer size={"$xxs"} /> */}
                </>
              )}
              <TextSMBold>{step.title}</TextSMBold>
              {step.subtitle && (
                <>
                  {/* <Spacer size={"$xxs"} /> */}
                  <ParagraphSM color={"$secondary"}>
                    {step.subtitle}
                  </ParagraphSM>
                </>
              )}
            </YStack>
          </XStack>
        );
      })}
    </YStack>
  );
};

export default OrderTimeline;
