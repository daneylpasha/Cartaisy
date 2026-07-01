import { AppImage } from "@/components/atoms/AppImage";
import { OpTouch } from "@/components/atoms/OpTouch";
import { tokens } from "@/tamagui/token";
import { router } from "expo-router";

export const HEADER_CONFIGS = {
  addAddress: {
    headerBackVisible: false,
    headerTitle: "",
    headerShown: true,
    headerLeft: () => (
      <OpTouch onPress={() => router.back()}>
        <AppImage name={"arrowBack"} size={16} />
      </OpTouch>
    ),
    headerShadowVisible: false,
    headerStyle: {
      backgroundColor: tokens.color.background,
    },
  },
  personalInfo: {
    headerBackVisible: false,
    headerTitle: "",
    headerShown: true,
    headerLeft: () => (
      <OpTouch onPress={() => router.back()}>
        <AppImage name={"arrowBack"} size={16} />
      </OpTouch>
    ),
    headerShadowVisible: false,
    headerStyle: {
      backgroundColor: tokens.color.background,
    },
  },
  notificationSettings: {
    headerBackVisible: false,
    headerTitle: "",
    headerShown: true,
    headerLeft: () => (
      <OpTouch onPress={() => router.back()}>
        <AppImage name={"arrowBack"} size={16} />
      </OpTouch>
    ),
    headerShadowVisible: false,
    headerStyle: {
      backgroundColor: tokens.color.background,
    },
  },
  securitySettings: {
    headerBackVisible: false,
    headerTitle: "",
    headerShown: true,
    headerLeft: () => (
      <OpTouch onPress={() => router.back()}>
        <AppImage name={"arrowBack"} size={16} />
      </OpTouch>
    ),
    headerShadowVisible: false,
    headerStyle: {
      backgroundColor: tokens.color.background,
    },
  },
  paymentMethod: {
    headerBackVisible: false,
    headerTitle: "",
    headerShown: true,
    headerLeft: () => (
      <OpTouch onPress={() => router.back()}>
        <AppImage name={"arrowBack"} size={16} />
      </OpTouch>
    ),
    headerShadowVisible: false,
    headerStyle: {
      backgroundColor: tokens.color.background,
    },
  },
  changePassword: {
    headerBackVisible: false,
    headerTitle: "",
    headerShown: true,
    headerLeft: () => (
      <OpTouch onPress={() => router.back()}>
        <AppImage name={"arrowBack"} size={16} />
      </OpTouch>
    ),
    headerShadowVisible: false,
    headerStyle: {
      backgroundColor: tokens.color.background,
    },
  },
  forgotPassword: {
    headerBackVisible: false,
    headerTitle: "",
    headerShown: true,
    headerLeft: () => (
      <OpTouch onPress={() => router.back()}>
        <AppImage name={"arrowBack"} size={16} />
      </OpTouch>
    ),
    headerShadowVisible: false,
    headerStyle: {
      backgroundColor: tokens.color.background,
    },
  },
  newPassword: {
    headerBackVisible: false,
    headerTitle: "",
    headerShown: true,
    headerLeft: () => (
      <OpTouch onPress={() => router.back()}>
        <AppImage name={"arrowBack"} size={16} />
      </OpTouch>
    ),
    headerShadowVisible: false,
    headerStyle: {
      backgroundColor: tokens.color.background,
    },
  },
  addNewCardDetails: {
    headerBackVisible: false,
    headerTitle: "",
    headerShown: true,
    headerLeft: () => (
      <OpTouch onPress={() => router.back()}>
        <AppImage name={"arrowBack"} size={16} />
      </OpTouch>
    ),
    headerShadowVisible: false,
    headerStyle: {
      backgroundColor: tokens.color.background,
    },
  },
  checkout: {
    headerBackVisible: false,
    headerTitle: "Checkout",
    headerShown: true,
    headerTitleAlign: "center" as const,
    // headerLeft: () => (
    //   <OpTouch onPress={() => router.back()}>
    //     <AppImage name={"arrowBack"} size={16} />
    //   </OpTouch>
    // ),

    headerShadowVisible: false,

    headerStyle: {
      backgroundColor: tokens.color.background,
    },
  },
  orders: {
    headerBackVisible: false,
    headerTitle: "Orders",
    headerShown: true,

    headerTitleAlign: "center" as const,
    headerLeft: () => (
      <OpTouch onPress={() => router.back()}>
        <AppImage name={"arrowBack"} size={16} />
      </OpTouch>
    ),

    headerShadowVisible: false,
    headerStyle: {
      backgroundColor: tokens.color.background,
    },
  },
  ordersDetails: {
    headerBackVisible: false,
    headerTitle: "Orders Details",
    headerTitleAlign: "center" as const,
    headerShown: true,
    headerLeft: () => (
      <OpTouch onPress={() => router.back()}>
        <AppImage name={"arrowBack"} size={16} />
      </OpTouch>
    ),

    headerShadowVisible: false,
    headerStyle: {
      backgroundColor: tokens.color.background,
    },
  },
  allAddressList: {
    headerBackVisible: false,
    headerTitle: "",
    headerShown: true,
    headerLeft: () => (
      <OpTouch onPress={() => router.back()}>
        <AppImage name={"arrowBack"} size={16} />
      </OpTouch>
    ),
    headerShadowVisible: false,
    headerStyle: {
      backgroundColor: tokens.color.background,
    },
  },
  // Reusable function for common patterns
  createBackButtonHeader: (title: string = "") => ({
    headerBackVisible: false,
    headerTitle: title,
    headerShown: true,
    headerLeft: () => (
      <OpTouch onPress={() => router.back()}>
        <AppImage name={"arrowBack"} size={16} />
      </OpTouch>
    ),
    headerShadowVisible: false,
    headerStyle: {
      backgroundColor: tokens.color.background,
    },
  }),
};
