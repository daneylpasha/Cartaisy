import { SHADOW_STYLES } from "@/constants/styles";
import React from "react";
import { Pressable } from "react-native";
import { XStack, YStack } from "tamagui";
import { TextMDBold, TextSMRegular, TextXLBold } from "../atoms";
import { AppImage } from "../atoms/AppImage";
import { Spacer } from "../atoms/Spacer";
import AlertModal from "../organisms/AlertModal";

interface CustomAlertButton {
  text: string;
  onPress?: () => void;
  style?: "default" | "cancel" | "destructive";
}

interface CustomAlertProps {
  visible: boolean;
  title?: string;
  message?: string;
  type?: "success" | "error" | "warning" | "info";
  buttons?: CustomAlertButton[];
  onClose?: () => void;
}

export const CustomAlert: React.FC<CustomAlertProps> = ({
  visible,
  title,
  message,
  type = "info",
  buttons = [{ text: "OK" }],
  onClose,
}) => {
  const getIconConfig = () => {
    switch (type) {
      case "success":
        return {
          name: "check",
          bgColor: "#10B981", // Green
          iconSize: 48,
        };
      case "error":
        return {
          name: "error",
          bgColor: "#EF4444", // Red
          iconSize: 48,
        };
      case "warning":
        return {
          name: "warning-alert",
          bgColor: "#F59E0B", // Orange
          iconSize: 48,
        };
      default:
        return {
          name: "info",
          bgColor: "#3B82F6", // Blue
          iconSize: 48,
        };
    }
  };

  const icon = getIconConfig();

  const handleButtonPress = (button: CustomAlertButton) => {
    if (button.onPress) {
      button.onPress();
    }
    if (onClose) {
      onClose();
    }
  };

  return (
    <AlertModal visible={visible} onCancel={onClose} backdropOpacity={0.6}>
      <Pressable onPress={(e) => e.stopPropagation()}>
        <YStack
          backgroundColor="$white"
          borderRadius="$md"
          padding="$xl"
          width={320}
          alignItems="center"
          style={SHADOW_STYLES}
        >
          {/* Icon Circle */}
          <YStack
            width={80}
            height={80}
            borderRadius="$full"
            backgroundColor={icon.bgColor}
            alignItems="center"
            justifyContent="center"
            marginTop={-60}
            style={SHADOW_STYLES}
          >
            <AppImage
              name={icon.name as any}
              width={icon.iconSize}
              height={icon.iconSize}
              tintColor="white"
            />
          </YStack>

          <Spacer size="$lg" />

          {/* Title */}
          {title && (
            <>
              <TextXLBold textAlign="center">{title}</TextXLBold>
              <Spacer size="$sm" />
            </>
          )}

          {/* Message */}
          {message && (
            <>
              <TextSMRegular
                textAlign="center"
                color="$secondary"
                lineHeight={20}
              >
                {message}
              </TextSMRegular>
              <Spacer size="$xl" />
            </>
          )}

          {/* Buttons */}
          {buttons.length === 1 ? (
            <Pressable
              onPress={() => handleButtonPress(buttons[0])}
              style={{ width: "100%" }}
            >
              <YStack
                backgroundColor="$primary"
                paddingVertical="$md"
                borderRadius="$full"
                alignItems="center"
                justifyContent="center"
              >
                <TextMDBold color="$white">{buttons[0].text}</TextMDBold>
              </YStack>
            </Pressable>
          ) : (
            <XStack width="100%" gap="$sm">
              {buttons.map((button, index) => {
                const isCancel = button.style === "cancel";
                const isDestructive = button.style === "destructive";

                return (
                  <Pressable
                    key={index}
                    onPress={() => handleButtonPress(button)}
                    style={{ flex: 1 }}
                  >
                    <YStack
                      backgroundColor={
                        isDestructive
                          ? "$error"
                          : isCancel
                          ? "$background"
                          : "$primary"
                      }
                      paddingVertical="$md"
                      borderRadius="$full"
                      alignItems="center"
                      justifyContent="center"
                      borderWidth={isCancel ? 1 : 0}
                      borderColor={isCancel ? "$lightgrey" : undefined}
                    >
                      <TextMDBold color={isCancel ? "$primary" : "$white"}>
                        {button.text}
                      </TextMDBold>
                    </YStack>
                  </Pressable>
                );
              })}
            </XStack>
          )}
        </YStack>
      </Pressable>
    </AlertModal>
  );
};

// Hook for easier usage
export const useCustomAlert = () => {
  const [alertConfig, setAlertConfig] = React.useState<CustomAlertProps>({
    visible: false,
  });

  const showAlert = (config: Omit<CustomAlertProps, "visible" | "onClose">) => {
    setAlertConfig({ ...config, visible: true });
  };

  const hideAlert = () => {
    setAlertConfig((prev) => ({ ...prev, visible: false }));
  };

  const AlertComponent = () => (
    <CustomAlert {...alertConfig} onClose={hideAlert} />
  );

  return {
    showAlert,
    hideAlert,
    AlertComponent,
  };
};
