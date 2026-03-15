import { describe, test, expect, beforeEach } from "bun:test";
import {
  cachedQuery,
  invalidateCache,
  clearCache,
  cacheKeys,
} from "@/lib/supabaseCache";

describe("supabaseCache", () => {
  beforeEach(() => {
    clearCache();
  });

  describe("cacheKeys", () => {
    test("profile key includes userId", () => {
      expect(cacheKeys.profile("abc123")).toBe("profile:abc123");
    });

    test("providerProfile key includes userId", () => {
      expect(cacheKeys.providerProfile("xyz")).toBe("provider_profile:xyz");
    });
  });

  describe("cachedQuery", () => {
    test("calls fetcher on first access", async () => {
      let callCount = 0;
      const result = await cachedQuery("key1", 5000, async () => {
        callCount++;
        return "value1";
      });

      expect(result).toBe("value1");
      expect(callCount).toBe(1);
    });

    test("returns cached value on second access", async () => {
      let callCount = 0;
      const fetcher = async () => {
        callCount++;
        return "cached";
      };

      await cachedQuery("key2", 60_000, fetcher);
      const result = await cachedQuery("key2", 60_000, fetcher);

      expect(result).toBe("cached");
      expect(callCount).toBe(1);
    });

    test("re-fetches after TTL expires", async () => {
      let callCount = 0;
      const fetcher = async () => {
        callCount++;
        return `value-${callCount}`;
      };

      // Use a 1ms TTL so it expires immediately
      await cachedQuery("key3", 1, fetcher);
      // Wait a tick
      await new Promise((r) => setTimeout(r, 5));
      const result = await cachedQuery("key3", 1, fetcher);

      expect(callCount).toBe(2);
      expect(result).toBe("value-2");
    });

    test("caches different keys independently", async () => {
      await cachedQuery("a", 60_000, async () => "alpha");
      await cachedQuery("b", 60_000, async () => "beta");

      const a = await cachedQuery("a", 60_000, async () => "should-not-run");
      const b = await cachedQuery("b", 60_000, async () => "should-not-run");

      expect(a).toBe("alpha");
      expect(b).toBe("beta");
    });
  });

  describe("invalidateCache", () => {
    test("removes specific key so fetcher runs again", async () => {
      let callCount = 0;
      const fetcher = async () => {
        callCount++;
        return callCount;
      };

      await cachedQuery("evict-me", 60_000, fetcher);
      expect(callCount).toBe(1);

      invalidateCache("evict-me");

      const result = await cachedQuery("evict-me", 60_000, fetcher);
      expect(callCount).toBe(2);
      expect(result).toBe(2);
    });

    test("does not affect other keys", async () => {
      await cachedQuery("keep", 60_000, async () => "kept");
      await cachedQuery("remove", 60_000, async () => "removed");

      invalidateCache("remove");

      const kept = await cachedQuery("keep", 60_000, async () => "overwritten");
      expect(kept).toBe("kept");
    });
  });

  describe("clearCache", () => {
    test("removes all keys", async () => {
      await cachedQuery("x", 60_000, async () => 1);
      await cachedQuery("y", 60_000, async () => 2);

      clearCache();

      let callCount = 0;
      await cachedQuery("x", 60_000, async () => {
        callCount++;
        return 10;
      });
      await cachedQuery("y", 60_000, async () => {
        callCount++;
        return 20;
      });

      expect(callCount).toBe(2);
    });
  });
});
