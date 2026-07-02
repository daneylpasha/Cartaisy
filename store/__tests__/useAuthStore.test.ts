/**
 * Safety tests for auth state transitions in store/useAuthStore.ts,
 * focused on the logout/refresh-failure path keeping the guest cart intact.
 */
jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock")
);

import useAuthStore from "@/store/useAuthStore";

const baseState = {
  token: null,
  refreshToken: null,
  isProfileComplete: false,
  isGuest: false,
  guestSessionId: null,
  deviceId: null,
};

describe("useAuthStore", () => {
  beforeAll(() => {
    jest.spyOn(console, "log").mockImplementation(() => {});
  });

  afterAll(async () => {
    // setToken schedules a 100ms debug log; let pending timers drain so
    // nothing logs after the suite is torn down, then restore the console spy.
    await new Promise((resolve) => setTimeout(resolve, 120));
    jest.restoreAllMocks();
  });

  beforeEach(() => {
    useAuthStore.setState({ ...baseState });
  });

  it("setToken stores both tokens and leaves guest mode", () => {
    useAuthStore.setState({ isGuest: true, guestSessionId: "guest-1" });

    useAuthStore.getState().setToken("access-1", "refresh-1");

    const state = useAuthStore.getState();
    expect(state.token).toBe("access-1");
    expect(state.refreshToken).toBe("refresh-1");
    expect(state.isGuest).toBe(false);
    // Guest session is kept temporarily so the backend can auto-merge carts
    expect(state.guestSessionId).toBe("guest-1");
  });

  it("clearAuth clears tokens and switches to guest mode, keeping session and device IDs", () => {
    useAuthStore.setState({
      token: "access-1",
      refreshToken: "refresh-1",
      isProfileComplete: true,
      guestSessionId: "guest-1",
      deviceId: "device-1",
    });

    useAuthStore.getState().clearAuth();

    const state = useAuthStore.getState();
    expect(state.token).toBeNull();
    expect(state.refreshToken).toBeNull();
    expect(state.isProfileComplete).toBe(false);
    expect(state.isGuest).toBe(true);
    // The cart is keyed by these; clearing them on logout would drop the cart
    expect(state.guestSessionId).toBe("guest-1");
    expect(state.deviceId).toBe("device-1");
  });

  it("setGuestSession stores the session and marks the user as guest", () => {
    useAuthStore.getState().setGuestSession("guest-2");

    expect(useAuthStore.getState().guestSessionId).toBe("guest-2");
    expect(useAuthStore.getState().isGuest).toBe(true);
  });

  it("enableGuestMode is a no-op while logged in", () => {
    useAuthStore.setState({ token: "access-1" });

    useAuthStore.getState().enableGuestMode();

    expect(useAuthStore.getState().isGuest).toBe(false);
  });

  it("initializeDeviceId generates an ID once and keeps it stable afterwards", () => {
    useAuthStore.getState().initializeDeviceId();
    const firstDeviceId = useAuthStore.getState().deviceId;

    useAuthStore.getState().initializeDeviceId();

    expect(firstDeviceId).toBeTruthy();
    expect(useAuthStore.getState().deviceId).toBe(firstDeviceId);
  });
});
