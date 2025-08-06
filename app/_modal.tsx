import React from "react";
import { Text, View } from "react-native";

const Modal = () => {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text style={{ fontFamily: "Figtree-Regular" }}>
        This is a Modal Screen
      </Text>

      {/* <Button title="Close" onPress={() => router.back()} /> */}
    </View>
  );
};

export default Modal;
