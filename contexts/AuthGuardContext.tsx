import { LoginBottomSheet, LoginBottomSheetRef } from "@/components/organisms/auth/LoginBottomSheet";
import useAuthStore from "@/store/useAuthStore";
import { router, usePathname } from "expo-router";
import React, { createContext, useCallback, useContext, useRef, useState } from "react";

type PendingAction = {
  type: "cart" | "favorite" | "address" | "checkout" | "account";
  callback?: () => void;
};

interface AuthGuardContextType {
  requireAuth: (action: PendingAction) => boolean;
  showLoginModal: () => void;
  hideLoginModal: () => void;
  isAuthenticated: boolean;
  pendingAction: PendingAction | null;
  setPendingReturnPath: (path: string) => void;
  pendingReturnPath: string | null;
  clearPendingReturnPath: () => void;
}

const AuthGuardContext = createContext<AuthGuardContextType | null>(null);

export const useAuthGuard = () => {
  const context = useContext(AuthGuardContext);
  if (!context) {
    throw new Error("useAuthGuard must be used within AuthGuardProvider");
  }
  return context;
};

interface AuthGuardProviderProps {
  children: React.ReactNode;
}

export const AuthGuardProvider: React.FC<AuthGuardProviderProps> = ({ children }) => {
  const loginBottomSheetRef = useRef<LoginBottomSheetRef>(null);
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);
  const [pendingReturnPath, setPendingReturnPathState] = useState<string | null>(null);
  const currentPath = usePathname();

  const { token } = useAuthStore();
  const isAuthenticated = !!token;

  const showLoginModal = useCallback(() => {
    loginBottomSheetRef.current?.present();
  }, []);

  const hideLoginModal = useCallback(() => {
    loginBottomSheetRef.current?.dismiss();
  }, []);

  const setPendingReturnPath = useCallback((path: string) => {
    setPendingReturnPathState(path);
  }, []);

  const clearPendingReturnPath = useCallback(() => {
    setPendingReturnPathState(null);
  }, []);

  const requireAuth = useCallback(
    (action: PendingAction): boolean => {
      if (isAuthenticated) {
        // User is logged in, allow action
        return true;
      }

      // User is guest, store pending action and show login modal
      setPendingAction(action);
      setPendingReturnPathState(currentPath);
      showLoginModal();
      return false;
    },
    [isAuthenticated, currentPath, showLoginModal]
  );

  const handleLoginSuccess = useCallback(() => {
    console.log("[AuthGuard] Login success, pending action:", pendingAction);

    // Execute pending action callback if exists
    if (pendingAction?.callback) {
      // Small delay to let the modal close animation complete
      setTimeout(() => {
        pendingAction.callback?.();
      }, 300);
    }

    // Clear pending action
    setPendingAction(null);
  }, [pendingAction]);

  const handleSignUpPress = useCallback(() => {
    // Save current path for return after signup
    setPendingReturnPathState(currentPath);

    // Navigate to signup screen
    router.push("/(auth)/signUp");
  }, [currentPath]);

  const handleDismiss = useCallback(() => {
    // User dismissed modal without logging in
    setPendingAction(null);
  }, []);

  return (
    <AuthGuardContext.Provider
      value={{
        requireAuth,
        showLoginModal,
        hideLoginModal,
        isAuthenticated,
        pendingAction,
        setPendingReturnPath,
        pendingReturnPath,
        clearPendingReturnPath,
      }}
    >
      {children}
      <LoginBottomSheet
        ref={loginBottomSheetRef}
        onLoginSuccess={handleLoginSuccess}
        onSignUpPress={handleSignUpPress}
        onDismiss={handleDismiss}
      />
    </AuthGuardContext.Provider>
  );
};
