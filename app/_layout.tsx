import { queryClient } from "@/api/config/queryClient";
import { AppInitializer } from "@/components/providers/AppInitializer";
import { HEADER_CONFIGS } from "@/constants/headers";
import { AuthGuardProvider } from "@/contexts/AuthGuardContext";
import { useColorScheme } from "@/hooks/useColorScheme";
import config from "@/tamagui.config";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { StripeProvider } from "@stripe/stripe-react-native";
import { QueryClientProvider } from "@tanstack/react-query";
import { useFonts } from "expo-font";

import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import messaging from "@react-native-firebase/messaging";
import { Stack, router } from "expo-router";
import { useEffect, useState, useRef } from "react";
import { Platform } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "react-native-reanimated";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { TamaguiProvider } from "tamagui";
import authApi from "@/api/endpoints/auth";
import useAuthStore from "@/store/useAuthStore";
import { notificationTracker } from "@/services/notificationTracker";
import { handleNotificationDeepLink, NotificationDeepLinkPayload } from "@/utils/deepLinkHandler";
import { setDeepLinkHandled } from "@/utils/navigationState";

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async (notification) => {
    console.log('🔔 [PUSH] Step 6: Notification RECEIVED in handler:', JSON.stringify(notification.request.content, null, 2));
    return {
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
      shouldShowBanner: true,
      shouldShowList: true,
    };
  },
});

// Register Firebase background handler (must be outside component)
messaging().setBackgroundMessageHandler(async (remoteMessage) => {
  console.log('🔔 [PUSH] Background message received:', JSON.stringify(remoteMessage, null, 2));
});

// Store initial notification from killed state (captured BEFORE navigation is ready)
let pendingInitialNotification: any = null;

// Check for initial notification IMMEDIATELY (before component mounts)
messaging()
  .getInitialNotification()
  .then(remoteMessage => {
    if (remoteMessage) {
      console.log('🔔 [PUSH] Killed state: Initial notification captured:', JSON.stringify(remoteMessage.data, null, 2));
      pendingInitialNotification = remoteMessage;

      // IMPORTANT: Set deep link flag IMMEDIATELY to prevent splash screen from navigating
      // This ensures splash screen waits for the deep link navigation to complete
      const notificationData = remoteMessage.data as NotificationDeepLinkPayload | undefined;
      if (notificationData && (notificationData.type || notificationData.deepLink || notificationData.action)) {
        console.log('🔔 [PUSH] Killed state: Setting deep link flag early to prevent splash override');
        setDeepLinkHandled(true);
      }
    } else {
      console.log('🔔 [PUSH] Killed state: No initial notification');
    }
  })
  .catch(error => {
    console.error('🔔 [PUSH] Killed state: Error getting initial notification:', error);
  });

async function registerForPushNotificationsAsync(): Promise<string | undefined> {
  console.log('🔔 [PUSH] ========================================');
  console.log('🔔 [PUSH] STARTING TOKEN REGISTRATION');
  console.log('🔔 [PUSH] ========================================');
  console.log('🔔 [PUSH] Platform:', Platform.OS);
  console.log('🔔 [PUSH] Is Device:', Device.isDevice);

  let token: string | undefined;

  try {
    // Step 1: Android notification channel
    if (Platform.OS === 'android') {
      console.log('🔔 [PUSH] Step 1: Creating Android channel...');
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
      console.log('🔔 [PUSH] Step 1: Android channel created ✅');
    }

    // Step 2: Check if physical device
    if (!Device.isDevice) {
      console.log('🔔 [PUSH] ERROR: Not a physical device ❌');
      console.log('🔔 [PUSH] Push notifications require a physical device, not simulator/emulator');
      return undefined;
    }
    console.log('🔔 [PUSH] Physical device check: PASSED ✅');

    // Step 3: Check Expo permissions
    console.log('🔔 [PUSH] Step 2: Checking notification permissions...');
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    console.log('🔔 [PUSH] Step 2: Existing status:', existingStatus);

    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      console.log('🔔 [PUSH] Step 2: Requesting permission...');
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    console.log('🔔 [PUSH] Step 2: Final status:', finalStatus);

    if (finalStatus !== 'granted') {
      console.log('🔔 [PUSH] Step 2: Permission DENIED ❌');
      return undefined;
    }
    console.log('🔔 [PUSH] Step 2: Permission GRANTED ✅');

    // Step 4: Check Firebase messaging availability
    console.log('🔔 [PUSH] Step 3: Checking Firebase messaging...');
    console.log('🔔 [PUSH] Step 3: messaging() type:', typeof messaging);
    console.log('🔔 [PUSH] Step 3: messaging() exists:', !!messaging);

    try {
      const messagingInstance = messaging();
      console.log('🔔 [PUSH] Step 3: messaging instance created ✅');
      console.log('🔔 [PUSH] Step 3: Has getToken:', typeof messagingInstance.getToken === 'function');
    } catch (msgError: any) {
      console.log('🔔 [PUSH] Step 3: messaging() call FAILED ❌');
      console.log('🔔 [PUSH] Step 3: Error:', msgError.message);
      return undefined;
    }

    // Step 5: iOS specific permission
    if (Platform.OS === 'ios') {
      console.log('🔔 [PUSH] Step 4: Requesting iOS Firebase permission...');
      try {
        const authStatus = await messaging().requestPermission();
        console.log('🔔 [PUSH] Step 4: iOS auth status:', authStatus);

        const enabled =
          authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
          authStatus === messaging.AuthorizationStatus.PROVISIONAL;

        if (!enabled) {
          console.log('🔔 [PUSH] Step 4: iOS Firebase permission DENIED ❌');
          return undefined;
        }
        console.log('🔔 [PUSH] Step 4: iOS Firebase permission GRANTED ✅');
      } catch (iosError: any) {
        console.log('🔔 [PUSH] Step 4: iOS permission error:', iosError.message);
      }
    } else {
      console.log('🔔 [PUSH] Step 4: Skipped (not iOS)');
    }

    // Step 6: Get FCM token
    console.log('🔔 [PUSH] Step 5: Getting FCM token...');
    try {
      token = await messaging().getToken();
      console.log('🔔 [PUSH] Step 5: FCM token received ✅');
      console.log('🔔 [PUSH] Step 5: Token length:', token?.length);
      console.log('🔔 [PUSH] Step 5: Token preview:', token?.substring(0, 40) + '...');
      console.log('🔔 [PUSH] Step 5: Token type:',
        token?.startsWith('ExponentPushToken') ? 'EXPO (BAD!)' : 'NATIVE_FCM (GOOD!)'
      );
    } catch (tokenError: any) {
      console.log('🔔 [PUSH] Step 5: getToken() FAILED ❌');
      console.log('🔔 [PUSH] Step 5: Error name:', tokenError.name);
      console.log('🔔 [PUSH] Step 5: Error message:', tokenError.message);
      console.log('🔔 [PUSH] Step 5: Error code:', tokenError.code);

      // Common error explanations
      if (tokenError.message?.includes('MISSING_INSTANCEID_SERVICE')) {
        console.log('🔔 [PUSH] Step 5: Google Play Services not available on this device/emulator');
      }
      if (tokenError.message?.includes('SERVICE_NOT_AVAILABLE')) {
        console.log('🔔 [PUSH] Step 5: Firebase service not available - check google-services.json');
      }
      if (tokenError.message?.includes('TOO_MANY_REGISTRATIONS')) {
        console.log('🔔 [PUSH] Step 5: Too many registrations - uninstall and reinstall app');
      }

      return undefined;
    }

    console.log('🔔 [PUSH] ========================================');
    console.log('🔔 [PUSH] TOKEN REGISTRATION COMPLETE');
    console.log('🔔 [PUSH] Token:', token ? 'EXISTS ✅' : 'UNDEFINED ❌');
    console.log('🔔 [PUSH] ========================================');

    return token;

  } catch (error: any) {
    console.log('🔔 [PUSH] ========================================');
    console.log('🔔 [PUSH] UNEXPECTED ERROR ❌');
    console.log('🔔 [PUSH] Error:', error.message);
    console.log('🔔 [PUSH] Stack:', error.stack);
    console.log('🔔 [PUSH] ========================================');
    return undefined;
  }
}
// Helper function to send push token to backend
async function sendPushTokenToBackend(pushToken: string) {
  console.log('🔔 [PUSH] Step 4: Sending token to backend...');
  console.log('🔔 [PUSH] Step 4a: Token to send:', pushToken.substring(0, 50) + '...');
  console.log('🔔 [PUSH] Step 4b: Platform:', Platform.OS);

  try {
    const response = await authApi.updateDeviceToken(pushToken, Platform.OS as "ios" | "android");
    console.log("🔔 [PUSH] Step 5: Token sent successfully!");
    console.log("🔔 [PUSH] Step 5a: Backend response:", JSON.stringify(response, null, 2));
    return true;
  } catch (error: any) {
    console.error("🔔 [PUSH] Step 5: Token send FAILED!");
    console.error("🔔 [PUSH] Step 5a: Error message:", error?.message);
    console.error("🔔 [PUSH] Step 5b: Error response:", JSON.stringify(error?.response?.data, null, 2));
    console.error("🔔 [PUSH] Step 5c: HTTP status:", error?.response?.status);
    return false;
  }
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [expoPushToken, setExpoPushToken] = useState("");
  const tokenSentRef = useRef(false);
  const initialNotificationHandledRef = useRef(false);

  // Get auth state from store
  const { token: authToken, _hasHydrated } = useAuthStore();

  // Effect to handle push token registration
  useEffect(() => {
    console.log('🔔 [PUSH] useEffect TRIGGERED - about to call registerForPushNotificationsAsync');

    registerForPushNotificationsAsync()
      .then((token) => {
        console.log('🔔 [PUSH] registerForPushNotificationsAsync RESOLVED');
        console.log('🔔 [PUSH] Returned token:', token ? 'EXISTS' : 'UNDEFINED');
        if (token) {
          setExpoPushToken(token);
          console.log('🔔 [PUSH] Token saved to state ✅');
        } else {
          console.log('⚠️ [PUSH] Token not generated - check logs above for failure point');
        }
      })
      .catch((error) => {
        console.log('🔔 [PUSH] registerForPushNotificationsAsync REJECTED ❌');
        console.log('🔔 [PUSH] Error:', error.message);
      });

    // Process any queued notification tracking events from previous sessions
    notificationTracker.processQueue().catch((error) => {
      console.error('🔔 [PUSH] Failed to process notification tracking queue:', error);
    });

    // Firebase foreground message handler
    const unsubscribeFirebase = messaging().onMessage(async (remoteMessage) => {
      console.log('🔔 [PUSH] Foreground message received:', remoteMessage);
      console.log('🔔 [PUSH] Notification:', remoteMessage.notification);
      console.log('🔔 [PUSH] Image URL:', remoteMessage.notification?.android?.imageUrl);
      console.log('🔔 [PUSH] Data:', remoteMessage.data);

      // Extract notificationId from data payload
      const notificationId = remoteMessage.data?.notificationId as string | undefined;
      const deviceId = useAuthStore.getState().deviceId || undefined;

      // Track notification delivery
      if (notificationId) {
        console.log('🔔 [PUSH] Tracking delivery for notificationId:', notificationId);
        notificationTracker.trackDelivery(notificationId, deviceId, {
          title: remoteMessage.notification?.title,
          source: 'foreground',
        });
      } else {
        console.warn('🔔 [PUSH] No notificationId in payload, skipping delivery tracking');
      }

      // Show as local notification using expo-notifications
      // Pass the notificationId in data for open tracking later
      await Notifications.scheduleNotificationAsync({
        content: {
          title: remoteMessage.notification?.title || 'New Message',
          body: remoteMessage.notification?.body || '',
          data: {
            ...remoteMessage.data,
            notificationId, // Ensure notificationId is passed through
          },
        },
        trigger: null, // Show immediately
      });
    });

    // Firebase token refresh handler
    const unsubscribeTokenRefresh = messaging().onTokenRefresh(async (newToken) => {
      console.log('🔔 [PUSH] Token refreshed:', newToken.substring(0, 30) + '...');
      setExpoPushToken(newToken);
      // Token will be sent to backend via the other useEffect
    });

    // Expo notification listeners (for local notifications triggered by Firebase)
    const subscription = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log("🔔 [PUSH] Step 7: Notification received listener fired!");
        console.log("🔔 [PUSH] Step 7a: Title:", notification.request.content.title);
        console.log("🔔 [PUSH] Step 7b: Body:", notification.request.content.body);
        console.log("🔔 [PUSH] Step 7c: Data:", JSON.stringify(notification.request.content.data, null, 2));

        // Track delivery for notifications received while app is in background/killed
        // (Foreground notifications are already tracked in onMessage handler)
        const notificationData = notification.request.content.data;
        const notificationId = notificationData?.notificationId as string | undefined;
        const deviceId = useAuthStore.getState().deviceId || undefined;

        // Only track if we have a notificationId and it's from background
        // Check if this is a Firebase remote notification (has messageId in trigger)
        const trigger = notification.request.trigger;
        const isFromBackground = trigger && 'remoteMessage' in trigger;

        if (notificationId && isFromBackground) {
          console.log('🔔 [PUSH] Tracking delivery (background) for:', notificationId);
          notificationTracker.trackDelivery(notificationId, deviceId, {
            title: notification.request.content.title,
            source: 'background',
          });
        }
      }
    );

    const responseSub = Notifications.addNotificationResponseReceivedListener(
      async (response) => {
        console.log("🔔 [PUSH] Step 8: Notification tapped (response listener)!");
        console.log("🔔 [PUSH] Step 8a: Title:", response.notification.request.content.title);
        console.log("🔔 [PUSH] Step 8b: Body:", response.notification.request.content.body);
        console.log("🔔 [PUSH] Step 8c: Data:", JSON.stringify(response.notification.request.content.data, null, 2));
        console.log("🔔 [PUSH] Step 8d: Action ID:", response.actionIdentifier);

        // Extract notification data for tracking
        const notificationData = response.notification.request.content.data as NotificationDeepLinkPayload | undefined;
        const notificationId = notificationData?.notificationId as string | undefined;
        const deviceId = useAuthStore.getState().deviceId || undefined;
        const actionId = response.actionIdentifier;

        // Track notification open/click
        if (notificationId) {
          console.log('🔔 [PUSH] Tracking open for notificationId:', notificationId);

          // If user tapped a specific action (not default open)
          if (actionId && actionId !== Notifications.DEFAULT_ACTION_IDENTIFIER) {
            await notificationTracker.trackClick(notificationId, actionId, deviceId, {
              title: response.notification.request.content.title,
            });
          } else {
            // Default tap - track as open
            await notificationTracker.trackOpen(notificationId, deviceId, {
              title: response.notification.request.content.title,
            });
          }
        } else {
          console.warn('🔔 [PUSH] No notificationId in payload, skipping open tracking');
        }

        // Handle deep link navigation
        if (notificationData) {
          console.log('🔔 [PUSH] Checking for deep link in notification data...');
          const handled = handleNotificationDeepLink(notificationData, router, {
            delay: 300, // Small delay to ensure navigation is ready (background/foreground)
          });
          if (handled) {
            console.log('🔔 [PUSH] Deep link navigation initiated');
            // Mark that deep link was handled - prevents splash from overriding
            setDeepLinkHandled(true);
          } else {
            console.log('🔔 [PUSH] No deep link found, staying on current screen');
          }
        }
      }
    );

    return () => {
      unsubscribeFirebase();
      unsubscribeTokenRefresh();
      subscription.remove();
      responseSub.remove();
    };
  }, []);

  // Reset tokenSentRef when user logs out (authToken becomes null)
  useEffect(() => {
    if (!authToken) {
      tokenSentRef.current = false;
    }
  }, [authToken]);

  // Effect to send push token to backend when user is logged in
  useEffect(() => {
    const sendTokenIfReady = async () => {
      console.log('🔔 [PUSH] Checking if ready to send token to backend...');
      console.log('🔔 [PUSH] - Store hydrated:', _hasHydrated);
      console.log('🔔 [PUSH] - Push token exists:', !!expoPushToken);
      console.log('🔔 [PUSH] - Auth token exists:', !!authToken);
      console.log('🔔 [PUSH] - Token already sent this session:', tokenSentRef.current);

      // Only proceed if:
      // 1. Store has hydrated (loaded from storage)
      // 2. We have a push token
      // 3. User is logged in (has auth token)
      // 4. We haven't already sent the token in this session
      if (_hasHydrated && expoPushToken && authToken && !tokenSentRef.current) {
        console.log('🔔 [PUSH] All conditions met, sending token...');
        const success = await sendPushTokenToBackend(expoPushToken);
        if (success) {
          tokenSentRef.current = true;
          console.log('🔔 [PUSH] Token registration complete!');
        }
      } else if (_hasHydrated && expoPushToken && !authToken) {
        console.log('🔔 [PUSH] Token ready but user not logged in - will send after login');
      }
    };

    sendTokenIfReady();
  }, [_hasHydrated, expoPushToken, authToken]);

  // Effect to handle cold start deep linking (app launched from killed state via notification tap)
  useEffect(() => {
    const handleInitialNotification = async () => {
      // Prevent handling more than once
      if (initialNotificationHandledRef.current) {
        return;
      }

      try {
        console.log('🔔 [PUSH] Checking for initial notification (cold start)...');
        const response = await Notifications.getLastNotificationResponseAsync();

        if (response) {
          initialNotificationHandledRef.current = true;
          console.log('🔔 [PUSH] Cold start: Found initial notification!');
          console.log('🔔 [PUSH] Cold start: Title:', response.notification.request.content.title);
          console.log('🔔 [PUSH] Cold start: Data:', JSON.stringify(response.notification.request.content.data, null, 2));

          // Extract notification data for tracking and navigation
          const notificationData = response.notification.request.content.data as NotificationDeepLinkPayload | undefined;
          const notificationId = notificationData?.notificationId as string | undefined;
          const deviceId = useAuthStore.getState().deviceId || undefined;

          // Track notification open
          if (notificationId) {
            console.log('🔔 [PUSH] Cold start: Tracking open for:', notificationId);
            await notificationTracker.trackOpen(notificationId, deviceId, {
              title: response.notification.request.content.title,
              source: 'cold_start',
            });
          }

          // Handle deep link navigation with delay to allow app initialization
          if (notificationData) {
            console.log('🔔 [PUSH] Cold start: Processing deep link with delay...');
            const handled = handleNotificationDeepLink(notificationData, router, {
              delay: 500, // Give app time to initialize before navigating
            });
            if (handled) {
              console.log('🔔 [PUSH] Cold start: Deep link navigation scheduled');
              // Mark that deep link was handled - prevents splash from overriding
              setDeepLinkHandled(true);
            } else {
              console.log('🔔 [PUSH] Cold start: No deep link in notification');
            }
          }
        } else {
          console.log('🔔 [PUSH] Cold start: No initial notification found');
        }
      } catch (error) {
        console.error('🔔 [PUSH] Cold start: Error checking initial notification:', error);
      }
    };

    // Small delay to ensure navigation is ready
    const timer = setTimeout(handleInitialNotification, 100);
    return () => clearTimeout(timer);
  }, []);

  const [loaded] = useFonts({
    "Figtree-Regular": require("../assets/fonts/Figtree-Regular.ttf"),
    "Figtree-Medium": require("../assets/fonts/Figtree-Medium.ttf"),
    "Figtree-Bold": require("../assets/fonts/Figtree-Bold.ttf"),
    "Figtree-SemiBold": require("../assets/fonts/Figtree-SemiBold.ttf"),
    "Figtree-ExtraBold": require("../assets/fonts/Figtree-ExtraBold.ttf"),
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  // Process pending notification from killed state AFTER fonts are loaded and navigation is ready
  useEffect(() => {
    if (!loaded) return;

    // Give navigation time to be fully ready, then process pending notification
    const timer = setTimeout(() => {
      if (pendingInitialNotification) {
        console.log('🔔 [PUSH] Killed state: Processing pending notification now...');
        console.log('🔔 [PUSH] Killed state: Data:', JSON.stringify(pendingInitialNotification.data, null, 2));

        const notificationData = pendingInitialNotification.data as NotificationDeepLinkPayload | undefined;
        const notificationId = notificationData?.notificationId as string | undefined;
        const deviceId = useAuthStore.getState().deviceId || undefined;

        // Track notification open
        if (notificationId) {
          console.log('🔔 [PUSH] Killed state: Tracking open for:', notificationId);
          notificationTracker.trackOpen(notificationId, deviceId, {
            title: pendingInitialNotification.notification?.title,
            source: 'killed_state',
          });
        }

        // Handle deep link navigation
        if (notificationData) {
          console.log('🔔 [PUSH] Killed state: type =', notificationData.type);
          console.log('🔔 [PUSH] Killed state: deepLink =', notificationData.deepLink);
          const handled = handleNotificationDeepLink(notificationData, router, {
            delay: 500, // Additional delay for navigation stability
          });
          if (handled) {
            console.log('🔔 [PUSH] Killed state: Deep link navigation scheduled');
            setDeepLinkHandled(true);
          }
        }

        // Clear pending notification
        pendingInitialNotification = null;
      }
    }, 1000); // Wait 1 second after fonts load to ensure navigation is fully ready

    return () => clearTimeout(timer);
  }, [loaded]);

  if (!loaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <AppInitializer />
          <StripeProvider
            publishableKey={
              process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY || ""
            }
            urlScheme={process.env.EXPO_PUBLIC_APP_SCHEME || "cartaisy"}
            merchantIdentifier={
              process.env.EXPO_PUBLIC_STRIPE_MERCHANT_ID || "merchant.com.cartaisy"
            }
          >
            <TamaguiProvider
              config={config}
              defaultTheme="light"
            >
              <BottomSheetModalProvider>
                <AuthGuardProvider>
                  <Stack
                    screenOptions={{ headerShown: false }}
                    initialRouteName="splash"
                  >
                    <Stack.Screen name="splash" />
                    <Stack.Screen name="wellcome" />
                    <Stack.Screen name="onboardingSlides" />
                    <Stack.Screen name="(auth)" />
                    <Stack.Screen name="(tabs)" />
                    <Stack.Screen name="notification" />
                    <Stack.Screen name="fullName" />
                    <Stack.Screen name="phoneNumber" />
                    <Stack.Screen name="search" />
                    <Stack.Screen name="cancelOrder" />
                    <Stack.Screen
                      name="addAddress"
                      options={HEADER_CONFIGS.addAddress}
                    />
                    <Stack.Screen
                      name="personalInfo"
                      options={HEADER_CONFIGS.personalInfo}
                    />
                    <Stack.Screen
                      name="notificationSettings"
                      options={HEADER_CONFIGS.notificationSettings}
                    />
                    <Stack.Screen
                      name="paymentMethod"
                      options={HEADER_CONFIGS.paymentMethod}
                    />
                    <Stack.Screen
                      name="securitySettings"
                      options={HEADER_CONFIGS.securitySettings}
                    />
                    <Stack.Screen
                      name="changePassword"
                      options={HEADER_CONFIGS.changePassword}
                    />
                    <Stack.Screen
                      name="newPassword"
                      options={HEADER_CONFIGS.newPassword}
                    />
                    <Stack.Screen
                      name="addNewCardDetails"
                      options={HEADER_CONFIGS.addNewCardDetails}
                    />
                    <Stack.Screen
                      name="checkout"
                      options={HEADER_CONFIGS.checkout}
                    />
                    <Stack.Screen
                      name="order-success"
                      options={{ presentation: "modal", headerShown: false }}
                    />
                    <Stack.Screen name="orders" options={HEADER_CONFIGS.orders} />
                    <Stack.Screen
                      name="ordersDetails"
                      options={HEADER_CONFIGS.ordersDetails}
                    />
                    <Stack.Screen
                      name="allAddressList"
                      options={HEADER_CONFIGS.allAddressList}
                    />

                    <Stack.Screen
                      name="_modal"
                      options={{ presentation: "modal", headerShown: false }}
                    />
                    <Stack.Screen name="+not-found" />

                    <Stack.Screen name="products" />
                  </Stack>
                </AuthGuardProvider>
              </BottomSheetModalProvider>
            </TamaguiProvider>
          </StripeProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
