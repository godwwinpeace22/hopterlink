import { describe, test, expect } from "bun:test";
import {
  getVerificationConfig,
  getRiskLevelColor,
  canBidOnCategory,
  SERVICE_CATEGORIES,
  type ProviderVerificationStatus,
} from "@/app/config/verificationConfig";

describe("getVerificationConfig", () => {
  test("returns config for a known category", () => {
    const config = getVerificationConfig("Electrical");
    expect(config).toBeDefined();
    expect(config!.riskLevel).toBe("high");
    expect(config!.licenseRequired).toBe(true);
    expect(config!.insuranceMinimum).toBe("$2M");
  });

  test("is case-insensitive", () => {
    const config = getVerificationConfig("electrical");
    expect(config).toBeDefined();
    expect(config!.category).toBe("Electrical");
  });

  test("returns undefined for unknown category", () => {
    expect(getVerificationConfig("Rocket Science")).toBeUndefined();
  });

  test("low risk categories do not require insurance or license", () => {
    const config = getVerificationConfig("Virtual Assistant");
    expect(config).toBeDefined();
    expect(config!.riskLevel).toBe("low");
    expect(config!.insuranceRequired).toBe(false);
    expect(config!.licenseRequired).toBe(false);
    expect(config!.backgroundCheckRequired).toBe(false);
  });

  test("medium risk categories require insurance and background check", () => {
    const config = getVerificationConfig("Cleaning Services");
    expect(config).toBeDefined();
    expect(config!.riskLevel).toBe("medium");
    expect(config!.insuranceRequired).toBe(true);
    expect(config!.backgroundCheckRequired).toBe(true);
    expect(config!.licenseRequired).toBe(false);
  });

  test("sensitive categories require enhanced background check", () => {
    const config = getVerificationConfig("Childcare");
    expect(config).toBeDefined();
    expect(config!.riskLevel).toBe("sensitive");
    expect(config!.enhancedBackgroundCheck).toBe(true);
  });
});

describe("getRiskLevelColor", () => {
  test("returns green classes for low risk", () => {
    expect(getRiskLevelColor("low")).toContain("green");
  });

  test("returns yellow classes for medium risk", () => {
    expect(getRiskLevelColor("medium")).toContain("yellow");
  });

  test("returns orange classes for high risk", () => {
    expect(getRiskLevelColor("high")).toContain("orange");
  });

  test("returns purple classes for sensitive risk", () => {
    expect(getRiskLevelColor("sensitive")).toContain("purple");
  });

  test("returns gray classes for unknown risk level", () => {
    // @ts-expect-error – testing fallback
    expect(getRiskLevelColor("unknown")).toContain("gray");
  });
});

describe("canBidOnCategory", () => {
  const fullyApproved: ProviderVerificationStatus = {
    email: "approved",
    phone: "approved",
    identity: "approved",
    background: "approved",
    enhanced_background: "approved",
    vulnerable_sector: "approved",
    license: "approved",
    insurance: "approved",
    wcb: "approved",
    first_aid: "approved",
    references: "approved",
  };

  test("allows bidding when all requirements are approved", () => {
    const result = canBidOnCategory("Electrical", fullyApproved);
    expect(result.canBid).toBe(true);
    expect(result.missingRequirements).toHaveLength(0);
  });

  test("allows bidding for unknown categories", () => {
    const result = canBidOnCategory("Unknown Category", {
      email: "not_started",
      phone: "not_started",
      identity: "not_started",
    });
    expect(result.canBid).toBe(true);
  });

  test("blocks bidding when required fields are missing", () => {
    const incomplete: ProviderVerificationStatus = {
      email: "approved",
      phone: "approved",
      identity: "pending",
    };
    const result = canBidOnCategory("Electrical", incomplete);
    expect(result.canBid).toBe(false);
    expect(result.missingRequirements.length).toBeGreaterThan(0);
    expect(result.missingRequirements).toContain("Identity Verification");
  });

  test("low risk category only needs email, phone, identity", () => {
    const minimal: ProviderVerificationStatus = {
      email: "approved",
      phone: "approved",
      identity: "approved",
    };
    const result = canBidOnCategory("Tutoring", minimal);
    expect(result.canBid).toBe(true);
  });

  test("medium risk category requires background check and insurance", () => {
    const noBackground: ProviderVerificationStatus = {
      email: "approved",
      phone: "approved",
      identity: "approved",
      background: "pending",
      insurance: "approved",
    };
    const result = canBidOnCategory("Cleaning Services", noBackground);
    expect(result.canBid).toBe(false);
    expect(result.missingRequirements).toContain("Background Check");
  });

  test("sensitive category requires vulnerable sector check", () => {
    const noVulnerable: ProviderVerificationStatus = {
      email: "approved",
      phone: "approved",
      identity: "approved",
      background: "approved",
      vulnerable_sector: "not_started",
      insurance: "approved",
      first_aid: "approved",
      references: "approved",
    };
    const result = canBidOnCategory("Childcare", noVulnerable);
    expect(result.canBid).toBe(false);
    expect(result.missingRequirements).toContain("Vulnerable Sector Check");
  });
});

describe("SERVICE_CATEGORIES integrity", () => {
  test("all categories have a non-empty category name", () => {
    for (const cat of SERVICE_CATEGORIES) {
      expect(cat.category.length).toBeGreaterThan(0);
    }
  });

  test("all categories have at least email requirement", () => {
    for (const cat of SERVICE_CATEGORIES) {
      const hasEmail = cat.requirements.some((r) => r.id === "email");
      expect(hasEmail).toBe(true);
    }
  });

  test("high risk categories require license", () => {
    const highRisk = SERVICE_CATEGORIES.filter((c) => c.riskLevel === "high");
    expect(highRisk.length).toBeGreaterThan(0);
    for (const cat of highRisk) {
      expect(cat.licenseRequired).toBe(true);
      expect(cat.licenseTypes!.length).toBeGreaterThan(0);
    }
  });

  test("sensitive categories require enhanced background check", () => {
    const sensitive = SERVICE_CATEGORIES.filter(
      (c) => c.riskLevel === "sensitive",
    );
    expect(sensitive.length).toBeGreaterThan(0);
    for (const cat of sensitive) {
      expect(cat.enhancedBackgroundCheck).toBe(true);
    }
  });
});
