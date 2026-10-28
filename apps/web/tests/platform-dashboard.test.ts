import { afterEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "@/lib/api/session";
import { isRange, platformGet } from "@/lib/api/platform-dashboard";
import { bytes, relativeTime } from "@/components/superadmin/format";

afterEach(() => vi.unstubAllGlobals());

describe("platform dashboard API", () => {
  it("accepts only supported date filters", () => {
    expect(isRange("7d")).toBe(true);
    expect(isRange("12m")).toBe(true);
    expect(isRange("custom")).toBe(false);
  });

  it("uses same-origin session and never shares cached reads", async () => {
    const fetcher = vi.fn().mockResolvedValue(new Response(JSON.stringify({ value: 0 }), { status: 200 }));
    vi.stubGlobal("fetch", fetcher);
    expect(await platformGet<{ value: number }>("dashboard?range=7d")).toEqual({ value: 0 });
    expect(fetcher).toHaveBeenCalledWith("/api/v1/platform/dashboard?range=7d", expect.objectContaining({ credentials: "same-origin", cache: "no-store", redirect: "error" }));
  });

  it("preserves 403 for permission handling and rejects invalid responses", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValueOnce(new Response("", { status: 403 })).mockResolvedValueOnce(new Response("bad json", { status: 200 })));
    await expect(platformGet("me")).rejects.toMatchObject({ status: 403 });
    await expect(platformGet("dashboard")).rejects.toBeInstanceOf(ApiError);
  });
});

describe("dashboard formatting", () => {
  it("formats bytes with decimal units and preserves date on server render", () => {
    expect(bytes(1_500_000_000)).toBe("1,5 GB");
    expect(relativeTime("2026-10-28T09:00:00Z", 0)).toContain("Okt 2026");
  });
});
