import { beforeEach, describe, expect, mock, test } from "bun:test";
import React from "react";

type AuthState = {
  isLoading: boolean;
  user: { email?: string | null; email_confirmed_at?: string | null } | null;
  approvedRoles: Array<"client" | "provider" | "admin">;
  activeRole: "client" | "provider" | "admin" | null;
  memberships: Array<{ role: "client" | "provider" | "admin" }>;
};

const authState: AuthState = {
  isLoading: false,
  user: null,
  approvedRoles: [],
  activeRole: null,
  memberships: [],
};

const locationState = { search: "" };

function MockNavigate(props: { to: string; replace?: boolean }) {
  return { kind: "Navigate", props } as unknown as React.ReactElement;
}

mock.module("@/contexts/AuthContext", () => ({
  useAuth: () => authState,
}));

mock.module("react-router-dom", () => ({
  Navigate: MockNavigate,
  useLocation: () => locationState,
}));

const { DashboardRouter, RequireAuth } = await import("@/app/routes/guards");

describe("web route guards", () => {
  beforeEach(() => {
    authState.isLoading = false;
    authState.user = null;
    authState.approvedRoles = [];
    authState.activeRole = null;
    authState.memberships = [];
    locationState.search = "";
  });

  test("RequireAuth redirects unverified client access to verify-email", () => {
    authState.user = {
      email: "client@example.com",
      email_confirmed_at: null,
    };
    authState.approvedRoles = ["client"];
    authState.activeRole = "client";

    const element = RequireAuth({
      access: "client",
      children: <div>ok</div>,
    }) as React.ReactElement;

    expect(element.type).toBe(MockNavigate);
    expect(element.props.to).toBe("/verify-email?email=client%40example.com");
  });

  test("RequireAuth allows verified client access", () => {
    authState.user = {
      email: "client@example.com",
      email_confirmed_at: "2026-03-14T00:00:00Z",
    };
    authState.approvedRoles = ["client"];
    authState.activeRole = "client";

    const element = RequireAuth({
      access: "client",
      children: <div>ok</div>,
    }) as React.ReactElement;

    expect(element.props.children.props.children).toBe("ok");
  });

  test("RequireAuth redirects unverified provider membership to verify-email", () => {
    authState.user = {
      email: "provider@example.com",
      email_confirmed_at: null,
    };
    authState.memberships = [{ role: "provider" }];

    const element = RequireAuth({
      access: "provider-membership",
      children: <div>ok</div>,
    }) as React.ReactElement;

    expect(element.type).toBe(MockNavigate);
    expect(element.props.to).toBe("/verify-email?email=provider%40example.com");
  });

  test("DashboardRouter redirects active unverified client to verify-email", () => {
    authState.user = {
      email: "client@example.com",
      email_confirmed_at: null,
    };
    authState.activeRole = "client";

    const element = DashboardRouter() as React.ReactElement;

    expect(element.type).toBe(MockNavigate);
    expect(element.props.to).toBe("/verify-email?email=client%40example.com");
  });

  test("DashboardRouter redirects unverified provider membership to verify-email", () => {
    authState.user = {
      email: "provider@example.com",
      email_confirmed_at: null,
    };
    authState.memberships = [{ role: "provider" }];

    const element = DashboardRouter() as React.ReactElement;

    expect(element.type).toBe(MockNavigate);
    expect(element.props.to).toBe("/verify-email?email=provider%40example.com");
  });
});
