import React from "react";
import { Modal, Platform, Pressable } from "react-native";

interface AlertModalProps {
  children: React.ReactNode;
  visible: boolean;
  onCancel?: () => void;
  animationType?: "none" | "slide" | "fade";
  backdropOpacity?: number;
}

export type AlertModalType = React.FC<AlertModalProps>;

export interface AlertModalConfig {
  title?: string;
  message?: string;
  buttons?: Array<{
    text: string;
    onPress?: () => void;
    style?: "default" | "cancel" | "destructive";
  }>;
}

const AlertModal: React.FC<AlertModalProps> = ({
  children,
  visible,
  onCancel,
  animationType = Platform.OS === "ios" ? "fade" : "fade",
  backdropOpacity = 0.5,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType={animationType}
      onRequestClose={onCancel}
    >
      {/* Backdrop */}
      <Pressable
        onPress={onCancel}
        style={{
          flex: 1,
          backgroundColor: `rgba(0,0,0,${backdropOpacity})`,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {children}
      </Pressable>
    </Modal>
  );
};

export default AlertModal;
