# Push Notification Diagnostic Report - Mobile App

**Generated:** 2025-12-17 (Updated)
**App:** Cartaisy Mobile (React Native / Expo)
**Status:** UPDATED - Now using Native FCM Tokens

---

## 1. Token Generation

| Field | Value |
|-------|-------|
| **File** | `app/_layout.tsx:44-122` |
| **Function** | `registerForPushNotificationsAsync()` |
| **Method** | `messaging().getToken()` (Firebase native FCM) |
| **Token Type** | **Native FCM Token** (NOT Expo Push Token) |
| **Firebase Project** | `cartaisy-production` |

### Token Generation Flow:
1. Check if physical device (`Device.isDevice`)
2. Set up Android notification channel (Android only)
3. Request Expo notification permissions (for local notification display)
4. Request Firebase iOS permissions (iOS only)
5. Get native FCM token via `messaging().getToken()`
6. Return FCM token to caller

---

## 2. Token Registration (Backend)

| Field | Value |
|-------|-------|
| **File** | `app/_layout.tsx:107-124` |
| **Function** | `sendPushTokenToBackend()` |
| **API Endpoint** | `POST /customer/auth/device-token` |
| **API File** | `api/endpoints/auth.ts:91-97` |
| **Request Body** | `{ deviceToken: string, platform: "ios" \| "android" }` |

### Registration Conditions (all must be true):
1. Store has hydrated (`_hasHydrated === true`)
2. Push token exists (`expoPushToken !== ""`)
3. User is logged in (`authToken !== null`)
4. Token not already sent this session (`tokenSentRef.current === false`)

### Headers Sent:
- `Authorization: Bearer {authToken}`
- `Content-Type: application/json`
- `X-Store-ID: {storeId}`

---

## 3. Notification Handlers

| Handler | Configured | Location |
|---------|------------|----------|
| `setNotificationHandler` (Expo) | **Yes** | `app/_layout.tsx:26-37` |
| `setBackgroundMessageHandler` (Firebase) | **Yes** | `app/_layout.tsx:39-42` |
| `onMessage` (Firebase foreground) | **Yes** | `app/_layout.tsx:162-178` |
| `onTokenRefresh` (Firebase) | **Yes** | `app/_layout.tsx:180-185` |
| `addNotificationReceivedListener` (Expo) | **Yes** | `app/_layout.tsx:187-194` |
| `addNotificationResponseReceivedListener` (Expo) | **Yes** | `app/_layout.tsx:196-205` |

### Expo Handler Configuration (for local notifications):
```typescript
Notifications.setNotificationHandler({
  handleNotification: async (notification) => {
    return {
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
      shouldShowBanner: true,
      shouldShowList: true,
    };
  },
});
```

### Firebase Background Handler:
```typescript
messaging().setBackgroundMessageHandler(async (remoteMessage) => {
  console.log('🔔 [PUSH] Background message received:', remoteMessage);
});
```

### Firebase Foreground Handler:
```typescript
messaging().onMessage(async (remoteMessage) => {
  // Show as local notification using expo-notifications
  await Notifications.scheduleNotificationAsync({
    content: {
      title: remoteMessage.notification?.title || 'New Message',
      body: remoteMessage.notification?.body || '',
      data: remoteMessage.data || {},
    },
    trigger: null, // Show immediately
  });
});
```

---

## 4. Firebase Config (Android)

| Field | Value |
|-------|-------|
| **google-services.json exists** | **Yes** (`/google-services.json`, `/android/app/google-services.json`) |
| **Project ID** | `cartaisy-production` |
| **Project Number** | `263022966458` |
| **Package name in google-services.json** | `com.rendernext.cartaisy` |
| **Package name in app.json** | `com.rendernext.cartaisy` |
| **Match** | **Yes** |
| **Firebase Plugins in app.json** | `@react-native-firebase/app`, `@react-native-firebase/messaging` |

---

## 5. iOS Config

| Field | Value |
|-------|-------|
| **GoogleService-Info.plist exists** | **No** |
| **Bundle Identifier** | `com.rendernext.cartaisy` |
| **APS entitlement configured** | **Yes** (`ios/cartaisy/cartaisy.entitlements`) |
| **aps-environment** | `development` |
| **UIBackgroundModes** | `remote-notification` (in `app.json`) |

### iOS Entitlements (`cartaisy.entitlements`):
```xml
<key>aps-environment</key>
<string>development</string>
```

---

## 6. Expo Notification Plugin Config

From `app.json`:
```json
{
  "notification": {
    "icon": "./assets/images/icon.png",
    "color": "#8B5CF6",
    "androidMode": "default",
    "androidCollapsedTitle": "{{unread_count}} new notifications"
  }
}
```

Plugin config:
```json
["expo-notifications", {
  "icon": "./assets/images/icon.png",
  "color": "#8B5CF6",
  "sounds": []
}]
```

---

## 7. Files Involved in Push Notifications

| File | Role |
|------|------|
| `app/_layout.tsx` | Main push notification setup, token generation, handlers |
| `api/endpoints/auth.ts` | API function to send token to backend |
| `api/apiClient.ts` | Axios instance with auth interceptors |
| `store/useAuthStore.ts` | Auth state management (token, hydration) |
| `app.json` | Expo/Firebase configuration |
| `google-services.json` | Firebase Android configuration |
| `ios/cartaisy/cartaisy.entitlements` | iOS push entitlements |

---

## 8. Logging Reference

All logging uses the prefix `🔔 [PUSH]` for easy filtering.

| Step | Log Message | Indicates |
|------|-------------|-----------|
| 1 | `Step 1: Starting push notification registration...` | Registration initiated |
| 1a | `Step 1a: Platform: {ios/android}` | Platform detected |
| 1b | `Step 1b: Is physical device: {true/false}` | Device type check |
| 1c | `Step 1c: Setting up Android notification channel...` | Android channel setup |
| 1d | `Step 1d: Android notification channel created` | Channel ready |
| 2 | `Step 2: Permission status (existing): {status}` | Current permission |
| 2a | `Step 2a: Requesting permission...` | Permission request started |
| 2b | `Step 2b: Permission status (after request): {status}` | Permission result |
| 3 | `Step 3: Project ID from config: {id}` | Project ID found |
| 3a | `Step 3a: Getting Expo push token...` | Token request started |
| 3b | `Step 3b: Expo Push Token: {token}` | Token received |
| 3c | `Step 3c: Token type: {EXPO/NATIVE_FCM}` | Token type identified |
| 4 | `Step 4: Sending token to backend...` | Backend registration started |
| 4a | `Step 4a: Token to send: {first 50 chars}` | Token being sent |
| 4b | `Step 4b: Platform: {ios/android}` | Platform being sent |
| 5 | `Step 5: Token sent successfully!` | Registration success |
| 5a | `Step 5a: Backend response: {response}` | Backend response |
| 5-ERR | `Step 5: Token send FAILED!` | Registration failed |
| 6 | `Step 6: Notification RECEIVED in handler` | Notification arrived |
| 7 | `Step 7: Notification received listener fired!` | Listener triggered |
| 8 | `Step 8: Notification tapped (response listener)!` | User interaction |

---

## 9. Issues Found

### Critical Issues:

1. **Missing GoogleService-Info.plist for iOS**
   - iOS Firebase Cloud Messaging will not work without this file
   - The app uses `@react-native-firebase/messaging` plugin but lacks iOS config
   - **Impact:** Push notifications will fail on iOS devices
   - **Action Required:** Download from Firebase Console and add to project

### Warnings:

2. **iOS APS Environment Set to "development"**
   - This will only work with development provisioning profiles
   - Must be changed to "production" for App Store releases
   - **Impact:** Production iOS users won't receive push notifications

3. **Token Registration Only After Login**
   - Push tokens are only sent to backend after user logs in
   - Guest users cannot receive push notifications
   - **Impact:** Limited notification reach

### Resolved Issues (as of 2025-12-17):

4. **✅ FIXED: Was using Expo Push Tokens instead of Native FCM**
   - **Previous:** Used `getExpoPushTokenAsync()` → `ExponentPushToken[xxx]`
   - **Now:** Uses `messaging().getToken()` → Native FCM token
   - **Impact:** Backend Firebase Admin SDK can now send notifications

---

## 10. Recommendations

### High Priority:

1. **Add GoogleService-Info.plist for iOS**
   ```bash
   # Download from Firebase Console
   # Firebase Console > Project Settings > iOS app > Download GoogleService-Info.plist
   # Place in: /ios/cartaisy/GoogleService-Info.plist
   ```

   Then add to `app.json`:
   ```json
   "ios": {
     "googleServicesFile": "./GoogleService-Info.plist"
   }
   ```

2. **Update iOS APS Environment for Production**
   - Before release, update `ios/cartaisy/cartaisy.entitlements`:
   ```xml
   <key>aps-environment</key>
   <string>production</string>
   ```
   - Or handle via EAS build profiles

### Medium Priority:

3. **Test with Expo Push Notification Tool**
   - Visit: https://expo.dev/notifications
   - Enter your Expo Push Token from logs
   - Send a test notification

4. **Verify Backend Endpoint**
   - Ensure `/customer/auth/device-token` endpoint:
     - Accepts `{ deviceToken, platform }` body
     - Stores token correctly in database
     - Returns appropriate success response

### Low Priority:

5. **Consider Guest User Notifications**
   - If marketing notifications needed for guests
   - Store token with device ID instead of user ID

---

## 11. Test Checklist

Run the app and verify each step:

| Step | Expected Log | Actual Result | Pass/Fail |
|------|--------------|---------------|-----------|
| App starts | `Step 1: Starting push notification registration (Native FCM)...` | | |
| Platform check | `Step 1a: Platform: android/ios` | | |
| Device check | `Step 1b: Is physical device: true` | | |
| Expo Permission | `Step 2: Expo permission status: granted` | | |
| iOS Firebase Permission | `Step 3a: Firebase iOS auth status: 1` (iOS only) | | |
| FCM Token request | `Step 4: Getting native FCM token...` | | |
| Token generated | `Step 4a: Native FCM Token generated: [long alphanumeric]...` | | |
| **Token type** | `Step 4b: Token type: NATIVE_FCM (GOOD!)` | | |
| Ready to send | `Checking if ready to send token to backend...` | | |
| Auth check | `Auth token exists: true` (after login) | | |
| Send to backend | `Step 5: Sending token to backend...` | | |
| Backend response | `Step 6: Token sent successfully!` | | |
| Foreground notification | `Firebase foreground message received!` | | |
| Background notification | `Background message received:` | | |
| Notification tap | `Step 8: Notification tapped!` | | |

---

## 12. Quick Debug Commands

```bash
# Filter push notification logs on Android
adb logcat | grep -E "🔔|PUSH"

# Filter push notification logs on iOS (via Metro)
# Look for lines containing "🔔" or "[PUSH]"

# Test with Expo Push Tool
# 1. Get token from logs (ExponentPushToken[xxx])
# 2. Go to https://expo.dev/notifications
# 3. Paste token and send test
```

---

## 13. Current Implementation Summary

```
┌─────────────────────────────────────────────────────────────────┐
│              PUSH NOTIFICATION FLOW (Native FCM)                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. App Launch                                                   │
│     └── _layout.tsx: registerForPushNotificationsAsync()        │
│                                                                  │
│  2. Check Device & Permissions                                   │
│     ├── Device.isDevice check                                    │
│     ├── Notifications.getPermissionsAsync() (Expo)               │
│     └── messaging().requestPermission() (Firebase iOS)           │
│                                                                  │
│  3. Generate Token (NATIVE FCM - NOT EXPO!)                      │
│     └── messaging().getToken()                                   │
│         ├── Token: Native FCM format (long alphanumeric)         │
│         └── Stored in state: expoPushToken                       │
│                                                                  │
│  4. Wait for Login                                               │
│     └── useEffect watches: _hasHydrated, expoPushToken, authToken│
│                                                                  │
│  5. Send to Backend (after login)                                │
│     └── authApi.updateDeviceToken(token, platform)               │
│         └── POST /customer/auth/device-token                     │
│             Body: { deviceToken, platform }                       │
│                                                                  │
│  6. Backend Sends Notification via Firebase Admin SDK            │
│     └── Uses native FCM token directly                           │
│                                                                  │
│  7. Notification Received                                        │
│     ├── BACKGROUND: messaging().setBackgroundMessageHandler()    │
│     ├── FOREGROUND: messaging().onMessage() → local notification │
│     └── TAP: addNotificationResponseReceivedListener()           │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 14. Backend Requirements

The backend must:

1. **Accept device token registration:**
   ```
   POST /customer/auth/device-token
   Headers: Authorization: Bearer {jwt}
   Body: { deviceToken: string, platform: "ios" | "android" }
   ```

2. **Store tokens associated with users:**
   ```sql
   user_devices (
     user_id,
     device_token,
     platform,
     created_at,
     updated_at
   )
   ```

3. **Send notifications using Firebase Admin SDK (NOT Expo Push API):**
   ```typescript
   // Using firebase-admin
   import * as admin from 'firebase-admin';

   await admin.messaging().send({
     token: nativeFcmToken, // NOT ExponentPushToken!
     notification: {
       title: 'Title',
       body: 'Message body',
     },
     data: {
       customData: 'value',
     },
   });
   ```

---

## 15. Next Steps After Implementation

1. **Rebuild the app** (required for native module changes):
   ```bash
   # Android
   npx expo run:android --clear

   # iOS
   npx expo run:ios --clear

   # Or use EAS Build
   eas build --profile development --platform all
   ```

2. **Test on physical device** (simulators don't support FCM)

3. **Verify in logs:**
   - Look for `Token type: NATIVE_FCM (GOOD!)`
   - Token should be a long alphanumeric string, NOT `ExponentPushToken[...]`

4. **Send test notification from backend**
   - Use the native FCM token stored in database
   - Send via Firebase Admin SDK

---

**End of Diagnostic Report**
