import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { Session, User } from "@supabase/supabase-js";
import isEqual from "fast-deep-equal";
import { supabase } from "@/lib/supabase";
import { useQueryClient } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import {
  getCurrencyForCountry,
  normalizeCountryCode,
  withCountryDialCode,
} from "@/app/lib/countryConfig";

export type UserRole = "client" | "provider" | "admin";
export type RoleMembershipState =
  | "not_started"
  | "onboarding"
  | "pending_review"
  | "approved"
  | "rejected"
  | "suspended";

export type RoleMembership = {
  role: UserRole;
  state: RoleMembershipState;
  active: boolean;
};

export type Profile = {
  id: string;
  role: UserRole;
  email: string;
  full_name: string | null;
  phone: string | null;
  country: string | null;
  currency: string | null;
  avatar_url: string | null;
  phone_verified?: boolean | null;
};

export type SignUpInput = {
  email: string;
  password: string;
  fullName: string;
  phone: string;
  country: string;
  role: UserRole;
  address?: string;
  businessName?: string;
  category?: string;
  bio?: string;
  experienceYears?: number;
};

type AuthContextType = {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  memberships: RoleMembership[];
  approvedRoles: UserRole[];
  activeRole: UserRole | null;
  isLoading: boolean;
  isClient: boolean;
  isProvider: boolean;
  isAdmin: boolean;
  hasRole: (role: UserRole) => boolean;
  isRoleApproved: (role: UserRole) => boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (input: SignUpInput) => Promise<{
    userId: string | null;
    hasSession: boolean;
    emailVerified: boolean;
  }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<Profile | null>;
  refreshMemberships: () => Promise<RoleMembership[]>;
  switchRole: (role: UserRole) => Promise<void>;
  startRoleOnboarding: (
    role: Extract<UserRole, "client" | "provider">,
  ) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function buildReferralCode(userId: string) {
  return `FH-${userId.slice(0, 8).toUpperCase()}`;
}

async function ensureUserSetup(
  user: User,
  existingProfile: Profile | null,
  existingMemberships: RoleMembership[],
) {
  const metadata = (user.user_metadata ?? {}) as {
    role?: UserRole;
    full_name?: string;
    phone?: string;
    country?: string;
    currency?: string;
    address?: string;
    business_name?: string;
    category?: string;
    bio?: string;
    experience_years?: number;
  };

  const desiredRole = existingProfile?.role ?? metadata.role ?? "client";
  const email = user.email ?? existingProfile?.email;
  const country = normalizeCountryCode(
    metadata.country ?? existingProfile?.country,
  );
  const currency =
    metadata.currency ??
    existingProfile?.currency ??
    getCurrencyForCountry(country);

  if (!email) {
    return false;
  }

  let changed = false;

  if (!existingProfile) {
    const { error } = await supabase.from("profiles").upsert(
      {
        id: user.id,
        role: desiredRole,
        email,
        full_name: metadata.full_name ?? user.user_metadata.full_name ?? null,
        phone: metadata.phone ?? null,
        country,
        currency,
        location: metadata.address ? { address: metadata.address } : undefined,
      },
      { onConflict: "id" },
    );

    if (!error) {
      changed = true;
    }
  }

  if (desiredRole === "client") {
    const [{ error: clientProfileError }, { error: clientRewardsError }] =
      await Promise.all([
        supabase.from("client_profiles").upsert(
          {
            user_id: user.id,
            country,
            currency,
          },
          { onConflict: "user_id" },
        ),
        supabase.from("client_rewards").upsert(
          {
            user_id: user.id,
            referral_code: buildReferralCode(user.id),
          },
          { onConflict: "user_id" },
        ),
      ]);

    if (!clientProfileError || !clientRewardsError) {
      changed = true;
    }

    const clientMembership = existingMemberships.find(
      (membership) => membership.role === "client",
    );

    if (clientMembership?.state !== "approved") {
      const { error } = await supabase.rpc("submit_role_onboarding", {
        p_role: "client",
      });

      if (!error) {
        changed = true;
      }
    }
  }

  if (desiredRole === "provider") {
    const category = metadata.category?.trim();
    const { error: providerProfileError } = await supabase
      .from("provider_profiles")
      .upsert(
        {
          user_id: user.id,
          country,
          currency,
          business_name:
            metadata.business_name?.trim() ||
            metadata.full_name?.trim() ||
            existingProfile?.full_name ||
            null,
          bio: metadata.bio?.trim() || null,
          services: category ? [category] : ["General Services"],
          experience_years:
            typeof metadata.experience_years === "number"
              ? metadata.experience_years
              : 0,
          verification_status: "not_started",
        },
        { onConflict: "user_id" },
      );

    if (!providerProfileError) {
      changed = true;
    }

    const providerMembership = existingMemberships.find(
      (membership) => membership.role === "provider",
    );

    if (!providerMembership) {
      const { error } = await supabase.rpc("start_role_onboarding", {
        p_role: "provider",
      });

      if (!error) {
        changed = true;
      }
    }
  }

  return changed;
}

async function fetchProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await queryClient.fetchQuery({
    queryKey: ["profiles", userId],
    queryFn: () =>
      supabase
        .from("profiles")
        .select(
          "id, role, email, full_name, phone, country, currency, avatar_url, phone_verified",
        )
        .eq("id", userId)
        .single(),
    staleTime: 30_000,
  });

  if (error) {
    return null;
  }

  return data as Profile;
}

async function fetchRoleMemberships(userId: string): Promise<RoleMembership[]> {
  const { data, error } = await queryClient.fetchQuery({
    queryKey: ["user_role_memberships", userId],
    queryFn: () =>
      supabase
        .from("user_role_memberships")
        .select("role, state, active")
        .eq("user_id", userId)
        .order("created_at", { ascending: false }),
    staleTime: 30_000,
  });

  if (error) {
    return [];
  }

  return (data ?? []) as RoleMembership[];
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const queryClientInstance = useQueryClient();
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [memberships, setMemberships] = useState<RoleMembership[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const hasHydratedSession = useRef(false);
  const currentUserIdRef = useRef<string | null>(null);

  const loadUserData = async (user: User) => {
    let [loadedProfile, loadedMemberships] = await Promise.all([
      fetchProfile(user.id),
      fetchRoleMemberships(user.id),
    ]);

    const changed = await ensureUserSetup(
      user,
      loadedProfile,
      loadedMemberships,
    );

    if (changed) {
      await Promise.all([
        queryClientInstance.invalidateQueries({
          queryKey: ["profiles", user.id],
        }),
        queryClientInstance.invalidateQueries({
          queryKey: ["user_role_memberships", user.id],
        }),
      ]);

      [loadedProfile, loadedMemberships] = await Promise.all([
        fetchProfile(user.id),
        fetchRoleMemberships(user.id),
      ]);
    }

    setProfile((previousProfile) =>
      isEqual(previousProfile, loadedProfile) ? previousProfile : loadedProfile,
    );
    setMemberships((previousMemberships) =>
      isEqual(previousMemberships, loadedMemberships)
        ? previousMemberships
        : loadedMemberships,
    );
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);

      if (session?.user) {
        currentUserIdRef.current = session.user.id;
        setIsLoading(true);
        void loadUserData(session.user).finally(() => {
          setIsLoading(false);
          hasHydratedSession.current = true;
        });
      } else {
        currentUserIdRef.current = null;
        setProfile(null);
        setMemberships([]);
        setIsLoading(false);
        hasHydratedSession.current = true;
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "INITIAL_SESSION") {
        return;
      }

      if (session?.user) {
        const sameUser = currentUserIdRef.current === session.user.id;
        const shouldUpdateSession = event !== "TOKEN_REFRESHED" || !sameUser;

        if (shouldUpdateSession) {
          setSession(session);
        }

        currentUserIdRef.current = session.user.id;

        if (!hasHydratedSession.current || !sameUser || event === "SIGNED_IN") {
          if (!hasHydratedSession.current) {
            setIsLoading(true);
          }
          void loadUserData(session.user).finally(() => {
            setIsLoading(false);
            hasHydratedSession.current = true;
          });
        } else if (event === "USER_UPDATED") {
          // Profile metadata changed — reload silently without blocking UI
          void loadUserData(session.user);
        }
        // TOKEN_REFRESHED and other events for same user: skip reload entirely
      } else {
        setSession(null);
        currentUserIdRef.current = null;
        hasHydratedSession.current = true;
        setProfile(null);
        setMemberships([]);
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw error;
    }
  };

  const signUp = async (input: SignUpInput) => {
    const phone = input.phone.trim();
    if (!phone) {
      throw new Error("Phone number is required.");
    }

    const country = normalizeCountryCode(input.country);
    if (!country) {
      throw new Error("Country is required.");
    }

    const normalizedPhone = withCountryDialCode(phone, country);

    const currency = getCurrencyForCountry(country);

    const metadata: Record<string, string | number> = {
      full_name: input.fullName,
      phone: normalizedPhone,
      country,
      currency,
      role: input.role,
    };

    if (input.businessName) {
      metadata.business_name = input.businessName;
    }

    if (input.address) {
      metadata.address = input.address;
    }

    if (input.category) {
      metadata.category = input.category;
    }

    if (input.bio) {
      metadata.bio = input.bio;
    }

    if (typeof input.experienceYears === "number") {
      metadata.experience_years = input.experienceYears;
    }

    const { data, error } = await supabase.auth.signUp({
      email: input.email,
      password: input.password,
      options: {
        data: metadata,
        emailRedirectTo: `${window.location.origin}/verify-email`,
      },
    });

    if (error) {
      throw error;
    }

    const userId = data.user?.id ?? null;
    const hasSession = Boolean(data.session);
    const emailVerified = Boolean(data.user?.email_confirmed_at);

    return { userId, hasSession, emailVerified };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
    setMemberships([]);
    queryClientInstance.clear();
  };

  const refreshProfile = async () => {
    const userId = session?.user?.id;
    if (!userId) {
      setProfile(null);
      return null;
    }

    queryClientInstance.invalidateQueries({ queryKey: ["profiles", userId] });
    const loadedProfile = await fetchProfile(userId);
    setProfile((previousProfile) =>
      isEqual(previousProfile, loadedProfile) ? previousProfile : loadedProfile,
    );
    return loadedProfile;
  };

  const refreshMemberships = async () => {
    const userId = session?.user?.id;
    if (!userId) {
      setMemberships([]);
      return [];
    }

    queryClientInstance.invalidateQueries({
      queryKey: ["user_role_memberships", userId],
    });
    const loadedMemberships = await fetchRoleMemberships(userId);
    setMemberships((previousMemberships) =>
      isEqual(previousMemberships, loadedMemberships)
        ? previousMemberships
        : loadedMemberships,
    );
    return loadedMemberships;
  };

  const switchRole = async (role: UserRole) => {
    const { error } = await supabase.rpc("switch_active_role", {
      p_role: role,
    });

    if (error) {
      throw error;
    }

    await refreshMemberships();
  };

  const startRoleOnboarding = async (
    role: Extract<UserRole, "client" | "provider">,
  ) => {
    const { error } =
      role === "client"
        ? await supabase.rpc("submit_role_onboarding", {
            p_role: role,
          })
        : await supabase.rpc("start_role_onboarding", {
            p_role: role,
          });

    if (error) {
      throw error;
    }

    await refreshMemberships();
  };

  const value = useMemo<AuthContextType>(() => {
    const approvedRoles = memberships
      .filter((membership) => membership.state === "approved")
      .map((membership) => membership.role)
      .filter((role, index, roles) => roles.indexOf(role) === index);

    const activeMembership = memberships.find(
      (membership) => membership.active && membership.state === "approved",
    );
    const activeRole =
      activeMembership?.role ??
      (approvedRoles.length === 1 ? approvedRoles[0] : null);

    const hasRole = (role: UserRole) =>
      memberships.some((membership) => membership.role === role);

    const isRoleApproved = (role: UserRole) => approvedRoles.includes(role);

    return {
      session,
      user: session?.user ?? null,
      profile,
      memberships,
      approvedRoles,
      activeRole,
      isLoading,
      isClient: activeRole === "client",
      isProvider: activeRole === "provider",
      isAdmin: activeRole === "admin",
      hasRole,
      isRoleApproved,
      signIn,
      signUp,
      signOut,
      refreshProfile,
      refreshMemberships,
      switchRole,
      startRoleOnboarding,
    };
  }, [session, profile, memberships, isLoading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
