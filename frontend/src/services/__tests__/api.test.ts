import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import api from "../api";

describe("API Request Interceptor", () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    // Clear all mocks
    vi.clearAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it("should attach authorization token if it exists in localStorage", async () => {
    const token = "test_access_token";
    localStorage.setItem("mvr_access_token", token);

    // Mock an axios request configuration
    const config = { headers: {} } as any;

    // Use the exposed interceptor function
    // @ts-ignore
    const interceptor = api.interceptors.request.handlers[0].fulfilled;
    const result = await interceptor(config);

    expect(result.headers.Authorization).toBe(`Bearer ${token}`);
  });

  it("should not attach authorization token if it does not exist in localStorage", async () => {
    const config = { headers: {} } as any;

    // @ts-ignore
    const interceptor = api.interceptors.request.handlers[0].fulfilled;
    const result = await interceptor(config);

    expect(result.headers.Authorization).toBeUndefined();
  });

  it("should handle request interceptor error (error path test)", async () => {
    const error = new Error("Request configuration failed");

    // Access the rejected handler
    // @ts-ignore
    const rejectInterceptor = api.interceptors.request.handlers[0].rejected;

    // Check that it rejects with the same error
    await expect(rejectInterceptor(error)).rejects.toThrow("Request configuration failed");
  });
});
