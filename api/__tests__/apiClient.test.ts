/**
 * Safety tests for the auth refresh flow in api/apiClient.ts.
 *
 * These tests exercise the real axios request/response interceptors and the
 * real auth store. Network I/O is replaced at the axios adapter layer, and
 * the direct refresh-token POST (which bypasses the instance on purpose) is
 * intercepted with a spy on the default axios export.
 */
import axios, { AxiosRequestConfig } from "axios";

jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock")
);

jest.mock("@/api/config/mobileConfig", () => ({
  mobileConfig: {
    apiBaseUrl: "https://api.cartaisy.test/api/v1",
    storeId: "aaaaaaaaaaaaaaaaaaaaaaaa",
  },
}));

import { axiosInstance } from "@/api/apiClient";
import useAuthStore from "@/store/useAuthStore";
import { isCatalogUnavailableError } from "@/utils/catalogUnavailableError";

type AdapterConfig = AxiosRequestConfig & {
  _retry?: boolean;
  headers: Record<string, unknown> & {
    get?: unknown;
    Authorization?: string;
  };
};

const okResponse = (config: AdapterConfig, data: unknown = { success: true }) => ({
  data,
  status: 200,
  statusText: "OK",
  headers: {},
  config,
});

const httpError = (
  config: AdapterConfig,
  status: number,
  data: Record<string, unknown>
) => ({
  isAxiosError: true,
  message: `Request failed with status code ${status}`,
  config,
  response: {
    status,
    statusText: "ERROR",
    data,
    headers: {},
    config,
  },
});

const refreshSuccessPayload = {
  data: {
    data: {
      accessToken: "new-access-token",
      refreshToken: "new-refresh-token",
    },
  },
};

const flushAsync = () => new Promise((resolve) => setTimeout(resolve, 0));

const setAdapter = (
  fn: (config: AdapterConfig) => Promise<unknown>
): jest.Mock => {
  const adapter = jest.fn(fn);
  axiosInstance.defaults.adapter = adapter as never;
  return adapter;
};

/** Adapter that 401s until the request carries the refreshed token. */
const expiredUntilRefreshedAdapter = () =>
  setAdapter(async (config) => {
    if (config.headers.Authorization === "Bearer new-access-token") {
      return okResponse(config, { success: true, url: config.url });
    }
    throw httpError(config, 401, { code: "TOKEN_EXPIRED" });
  });

const loggedInState = {
  token: "expired-access-token",
  refreshToken: "valid-refresh-token",
  isGuest: false,
  guestSessionId: null,
  deviceId: "device-1",
};

describe("apiClient auth refresh", () => {
  let postSpy: jest.SpyInstance;

  beforeAll(() => {
    jest.spyOn(console, "log").mockImplementation(() => {});
  });

  afterAll(async () => {
    // useAuthStore.setToken schedules a 100ms debug log; let pending timers
    // drain so nothing logs after the suite is torn down.
    await new Promise((resolve) => setTimeout(resolve, 120));
  });

  beforeEach(() => {
    useAuthStore.setState({ ...loggedInState });
    postSpy = jest.spyOn(axios, "post");
  });

  afterEach(() => {
    postSpy.mockRestore();
  });

  it("refreshes the token on 401 and retries the original request with the new token", async () => {
    const adapter = expiredUntilRefreshedAdapter();
    postSpy.mockResolvedValue(refreshSuccessPayload);

    const response = await axiosInstance.get("/customer/profile");

    expect(postSpy).toHaveBeenCalledTimes(1);
    expect(postSpy).toHaveBeenCalledWith(
      "https://api.cartaisy.test/api/v1/customer/auth/refresh-token",
      { refreshToken: "valid-refresh-token" },
      expect.objectContaining({
        headers: expect.objectContaining({
          "X-Store-ID": "aaaaaaaaaaaaaaaaaaaaaaaa",
        }),
      })
    );

    // Tokens rotated in the store
    expect(useAuthStore.getState().token).toBe("new-access-token");
    expect(useAuthStore.getState().refreshToken).toBe("new-refresh-token");

    // Original request retried exactly once, with the new Authorization header
    expect(adapter).toHaveBeenCalledTimes(2);
    const retriedConfig = adapter.mock.calls[1][0] as AdapterConfig;
    expect(retriedConfig.url).toBe("/customer/profile");
    expect(retriedConfig.headers.Authorization).toBe("Bearer new-access-token");
    expect(response.data).toEqual({ success: true, url: "/customer/profile" });
  });

  it("keeps the previous refresh token when the refresh response omits a new one", async () => {
    expiredUntilRefreshedAdapter();
    postSpy.mockResolvedValue({
      data: { data: { accessToken: "new-access-token" } },
    });

    await axiosInstance.get("/customer/profile");

    expect(useAuthStore.getState().token).toBe("new-access-token");
    expect(useAuthStore.getState().refreshToken).toBe("valid-refresh-token");
  });

  it("clears auth safely when the refresh call fails, preserving the guest session for the cart", async () => {
    useAuthStore.setState({ guestSessionId: "guest-session-1" });
    setAdapter(async (config) => {
      throw httpError(config, 401, { code: "TOKEN_EXPIRED" });
    });
    const refreshFailure = new Error("refresh token expired");
    postSpy.mockRejectedValue(refreshFailure);

    await expect(axiosInstance.get("/customer/profile")).rejects.toBe(
      refreshFailure
    );

    const state = useAuthStore.getState();
    expect(state.token).toBeNull();
    expect(state.refreshToken).toBeNull();
    // clearAuth switches to guest mode and keeps session/device IDs so the
    // cart survives the forced logout
    expect(state.isGuest).toBe(true);
    expect(state.guestSessionId).toBe("guest-session-1");
    expect(state.deviceId).toBe("device-1");
  });

  it("issues a single refresh for concurrent 401s and retries all queued requests", async () => {
    const adapter = expiredUntilRefreshedAdapter();

    let resolveRefresh: (value: unknown) => void = () => {};
    postSpy.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveRefresh = resolve;
        })
    );

    const first = axiosInstance.get("/customer/profile");
    const second = axiosInstance.get("/customer/orders");

    // Let both 401s reach the response interceptor while refresh is in flight
    await flushAsync();
    resolveRefresh(refreshSuccessPayload);

    const [firstResponse, secondResponse] = await Promise.all([first, second]);

    expect(postSpy).toHaveBeenCalledTimes(1);
    expect(firstResponse.data).toEqual({
      success: true,
      url: "/customer/profile",
    });
    expect(secondResponse.data).toEqual({
      success: true,
      url: "/customer/orders",
    });

    // 2 original attempts + 2 retries, every retry carrying the new token
    expect(adapter).toHaveBeenCalledTimes(4);
    const retriedAuthHeaders = adapter.mock.calls
      .slice(2)
      .map((call) => (call[0] as AdapterConfig).headers.Authorization);
    expect(retriedAuthHeaders).toEqual([
      "Bearer new-access-token",
      "Bearer new-access-token",
    ]);
  });

  it("rejects queued requests when the shared refresh fails", async () => {
    setAdapter(async (config) => {
      throw httpError(config, 401, { code: "TOKEN_EXPIRED" });
    });

    let rejectRefresh: (reason: unknown) => void = () => {};
    postSpy.mockImplementation(
      () =>
        new Promise((_resolve, reject) => {
          rejectRefresh = reject;
        })
    );

    const first = axiosInstance.get("/customer/profile");
    const second = axiosInstance.get("/customer/orders");

    await flushAsync();
    const refreshFailure = new Error("refresh token expired");
    rejectRefresh(refreshFailure);

    await expect(first).rejects.toBe(refreshFailure);
    await expect(second).rejects.toBe(refreshFailure);
    expect(postSpy).toHaveBeenCalledTimes(1);
    expect(useAuthStore.getState().token).toBeNull();
  });

  it.each([
    "/customer/auth/refresh-token",
    "/customer/auth/login",
    "/customer/auth/register",
  ])("does not attempt a refresh for 401s from %s", async (url) => {
    setAdapter(async (config) => {
      throw httpError(config, 401, { code: "INVALID_TOKEN" });
    });

    await expect(axiosInstance.post(url, {})).rejects.toMatchObject({
      response: { status: 401 },
    });
    expect(postSpy).not.toHaveBeenCalled();
    // Auth is left untouched; only a failed refresh may clear it
    expect(useAuthStore.getState().token).toBe("expired-access-token");
  });

  it("does not attempt a refresh for guests without a refresh token", async () => {
    useAuthStore.setState({
      token: null,
      refreshToken: null,
      isGuest: true,
      guestSessionId: "guest-session-1",
    });
    setAdapter(async (config) => {
      throw httpError(config, 401, {});
    });

    await expect(axiosInstance.get("/unified-cart")).rejects.toMatchObject({
      response: { status: 401 },
    });
    expect(postSpy).not.toHaveBeenCalled();
  });

  it("passes non-401 errors through without refreshing", async () => {
    setAdapter(async (config) => {
      throw httpError(config, 500, { message: "internal error" });
    });

    await expect(axiosInstance.get("/customer/profile")).rejects.toMatchObject({
      response: { status: 500 },
    });
    expect(postSpy).not.toHaveBeenCalled();
    expect(useAuthStore.getState().token).toBe("expired-access-token");
  });

  it("passes unavailable-store cart errors through untouched so screens can classify them", async () => {
    setAdapter(async (config) => {
      throw httpError(config, 403, { code: "STORE_INACTIVE" });
    });

    let caught: unknown;
    try {
      await axiosInstance.get("/unified-cart");
    } catch (error) {
      caught = error;
    }

    expect(isCatalogUnavailableError(caught)).toBe(true);
    expect(postSpy).not.toHaveBeenCalled();
    // An unavailable store must not log the customer out
    expect(useAuthStore.getState().token).toBe("expired-access-token");
    expect(useAuthStore.getState().isGuest).toBe(false);
  });
});
