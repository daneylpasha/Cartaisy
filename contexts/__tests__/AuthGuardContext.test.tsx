import { fireEvent } from "@testing-library/react-native";
import React from "react";
import { Pressable, Text } from "react-native";

jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock")
);

jest.mock("expo-router", () => ({
  router: { push: jest.fn(), back: jest.fn() },
  usePathname: () => "/cart",
}));

// The real LoginBottomSheet pulls in @gorhom/bottom-sheet and the full auth
// form; the gate only needs its imperative present/dismiss handle.
const mockPresent = jest.fn();
const mockDismiss = jest.fn();
jest.mock("@/components/organisms/auth/LoginBottomSheet", () => {
  const ReactActual = require("react");
  return {
    LoginBottomSheet: ReactActual.forwardRef((_props: unknown, ref: React.Ref<unknown>) => {
      ReactActual.useImperativeHandle(ref, () => ({
        present: mockPresent,
        dismiss: mockDismiss,
      }));
      return null;
    }),
  };
});

import { AuthGuardProvider, useAuthGuard } from "@/contexts/AuthGuardContext";
import useAuthStore from "@/store/useAuthStore";
import { renderWithTamagui } from "@/test-utils/renderWithTamagui";

// Probe component exercising the gate the way checkout does.
const GateProbe = ({ onResult }: { onResult: (allowed: boolean) => void }) => {
  const { requireAuth, isAuthenticated } = useAuthGuard();
  return (
    <Pressable
      onPress={() => onResult(requireAuth({ type: "checkout" }))}
      testID="gate-probe"
    >
      <Text>{isAuthenticated ? "authenticated" : "guest"}</Text>
    </Pressable>
  );
};

const renderGate = (onResult: (allowed: boolean) => void) =>
  renderWithTamagui(
    <AuthGuardProvider>
      <GateProbe onResult={onResult} />
    </AuthGuardProvider>
  );

describe("AuthGuardContext auth gate", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useAuthStore.setState({ token: null });
  });

  it("blocks a guest: requireAuth returns false and presents the login sheet", () => {
    const onResult = jest.fn();
    const { getByTestId, getByText } = renderGate(onResult);

    expect(getByText("guest")).toBeTruthy();
    fireEvent.press(getByTestId("gate-probe"));

    expect(onResult).toHaveBeenCalledWith(false);
    expect(mockPresent).toHaveBeenCalledTimes(1);
  });

  it("allows an authenticated customer: requireAuth returns true without the login sheet", () => {
    useAuthStore.setState({ token: "fabricated-jwt" });
    const onResult = jest.fn();
    const { getByTestId, getByText } = renderGate(onResult);

    expect(getByText("authenticated")).toBeTruthy();
    fireEvent.press(getByTestId("gate-probe"));

    expect(onResult).toHaveBeenCalledWith(true);
    expect(mockPresent).not.toHaveBeenCalled();
  });
});
