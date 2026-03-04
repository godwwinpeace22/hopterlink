# Supabase Authentication & Profile Strategy

## Authentication Providers

### Email/Password (Primary)

- **SignIn.tsx**: Email + password with role selection (client/provider)
- **ClientSignup.tsx**: Email, password, full name, phone (optional)
- **ProviderSignup.tsx**: Email, password, full name, business name, phone, services, experience

**Implementation:**

```typescript
// Sign up
const { data, error } = await supabase.auth.signUp({
  email: formData.email,
  password: formData.password,
  options: {
    data: {
      full_name: formData.fullName,
      role: "client", // or 'provider'
      phone: formData.phone,
    },
    emailRedirectTo: `${window.location.origin}/auth/callback`,
  },
});
```

### Magic Link (Optional - Phase 2)

- Alternative passwordless login via email link
- Better UX for mobile users
- Can be added after initial launch

### Social OAuth (Optional - Phase 2)

- Google, Apple, Facebook
- Requires additional provider configuration
- Consider for user acquisition growth

---

## User Profile Architecture

### Approach: Separate Profiles Table + Role-Specific Tables

**Why this approach:**

1. `auth.users` table is managed by Supabase Auth (limited customization)
2. `user_metadata` has size limits and isn't easily queryable
3. Separate `profiles` table gives full control over user data
4. Role-specific tables (`client_profiles`, `provider_profiles`) keep data organized

### Profile Creation Flow

```typescript
// 1. User signs up via Supabase Auth
const { data: authData, error: authError } = await supabase.auth.signUp({
  email,
  password,
  options: {
    data: {
      role: "client", // This goes into auth.users.raw_user_meta_data
      full_name: "John Doe",
    },
  },
});

// 2. Database trigger automatically creates profile record
// (See trigger below)

// 3. Frontend creates role-specific profile
if (role === "client") {
  const { error: clientError } = await supabase.from("client_profiles").insert({
    user_id: authData.user.id,
    preferred_categories: selectedCategories,
    notification_preferences: defaultPrefs,
  });
} else if (role === "provider") {
  const { error: providerError } = await supabase
    .from("provider_profiles")
    .insert({
      user_id: authData.user.id,
      business_name: formData.businessName,
      services: selectedServices,
      experience_years: formData.experience,
      bio: formData.bio,
      service_areas: [formData.city],
    });
}
```

### Database Trigger: Auto-Create Profile

```sql
-- Function to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, role, email, full_name, phone)
  VALUES (
    NEW.id,
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'client'),
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'phone'
  );

  -- Create client rewards account if role is client
  IF (NEW.raw_user_meta_data->>'role' = 'client') THEN
    INSERT INTO public.client_rewards (user_id, referral_code)
    VALUES (NEW.id, SUBSTRING(MD5(NEW.id::text) FROM 1 FOR 8));
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on auth.users table
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

---

## Role Management Strategy

### Option 1: Role in Profiles Table (Recommended)

✅ **Pros:**

- Easy to query: `SELECT * FROM profiles WHERE role = 'provider'`
- Can be used in RLS policies: `EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'provider')`
- Simple to implement and debug
- No custom JWT claims needed

❌ **Cons:**

- Extra database query to check role
- Could theoretically be modified by user (but RLS prevents this)

### Option 2: Custom JWT Claims

✅ **Pros:**

- Role available in JWT token (no extra query)
- Slightly faster for RLS checks

❌ **Cons:**

- Requires custom Postgres function to set claims
- More complex to implement
- JWT must be refreshed when role changes

**Recommendation**: Use **Option 1** (role in profiles table) for simplicity. Performance difference is negligible with proper indexing.

---

## Role-Based Access Control (RBAC)

### Client Permissions

- ✅ Create/update/delete own jobs
- ✅ View all providers and their profiles
- ✅ View quotes received on their jobs
- ✅ Accept/reject quotes
- ✅ Create bookings (from quotes or direct)
- ✅ Send messages to providers
- ✅ Submit reviews after completed bookings
- ✅ Manage rewards and referrals
- ❌ Cannot submit quotes
- ❌ Cannot view other clients' jobs details
- ❌ Cannot access provider onboarding/verification

### Provider Permissions

- ✅ View all open jobs
- ✅ Submit quotes on jobs
- ✅ Update own quotes (if not accepted)
- ✅ View bookings where they're the provider
- ✅ Update booking status (confirm, start, complete)
- ✅ Send messages to clients
- ✅ Respond to reviews
- ✅ Upload verification documents
- ✅ Manage portfolio and availability
- ❌ Cannot post jobs
- ❌ Cannot view other providers' quotes
- ❌ Cannot access client rewards/referrals
- ❌ Cannot accept quotes (clients do this)

### Admin Permissions (Future)

- ✅ View all data across platform
- ✅ Review and approve provider verifications
- ✅ Resolve disputes
- ✅ Suspend/ban users
- ✅ View platform analytics
- ✅ Manage reward marketplace

---

## Authentication Hooks & Context

### Create Auth Context (React)

```typescript
// src/contexts/AuthContext.tsx
import { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

type Profile = {
  id: string;
  role: 'client' | 'provider' | 'admin';
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  // ... other profile fields
};

type AuthContextType = {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  isClient: boolean;
  isProvider: boolean;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (data: SignUpData) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setIsLoading(false);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setProfile(null);
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (data) {
      setProfile(data);
    }
    setIsLoading(false);
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
  };

  const signUp = async (data: SignUpData) => {
    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          role: data.role,
          full_name: data.fullName,
          phone: data.phone,
        },
      },
    });
    if (error) throw error;
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
  };

  const refreshProfile = async () => {
    if (session?.user) {
      await fetchProfile(session.user.id);
    }
  };

  const value = {
    session,
    user: session?.user ?? null,
    profile,
    isLoading,
    isClient: profile?.role === 'client',
    isProvider: profile?.role === 'provider',
    isAdmin: profile?.role === 'admin',
    signIn,
    signUp,
    signOut,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
```

---

## Protected Routes

### Route Guard Component

```typescript
// src/components/ProtectedRoute.tsx
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';

type ProtectedRouteProps = {
  children: React.ReactNode;
  requireRole?: 'client' | 'provider' | 'admin';
  redirectTo?: string;
};

export function ProtectedRoute({
  children,
  requireRole,
  redirectTo = '/signin'
}: ProtectedRouteProps) {
  const { user, profile, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>; // Or a proper loading spinner
  }

  if (!user) {
    return <Navigate to={redirectTo} replace />;
  }

  if (requireRole && profile?.role !== requireRole) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
}

// Usage in App.tsx
<ProtectedRoute requireRole="client">
  <PostJob onNavigate={handleNavigate} />
</ProtectedRoute>

<ProtectedRoute requireRole="provider">
  <JobBoard onNavigate={handleNavigate} />
</ProtectedRoute>
```

---

## Email Verification Strategy

### Option 1: Required Verification (Recommended for Launch)

- User must verify email before accessing platform
- Prevents spam signups
- Better data quality

```typescript
// In Supabase Dashboard > Authentication > Settings
// Enable: "Confirm email" toggle

// Handle verification in app
const { data, error } = await supabase.auth.signUp({
  email,
  password,
  options: {
    emailRedirectTo: `${window.location.origin}/auth/callback`,
  },
});

// Show message: "Check your email to verify your account"
```

### Option 2: Optional Verification (Phase 1)

- Users can access platform immediately
- Email verification required for certain actions (e.g., posting jobs, submitting quotes)
- Reminder banners/modals until verified

```typescript
// Check verification status
const {
  data: { user },
} = await supabase.auth.getUser();
if (!user?.email_confirmed_at) {
  // Show verification reminder
}

// Re-send verification email
const { error } = await supabase.auth.resend({
  type: "signup",
  email: user.email,
});
```

**Recommendation**: Start with **Option 2** for better onboarding UX, then add restrictions as needed.

---

## Phone Verification (Provider Onboarding)

### Using Twilio Integration

```typescript
// 1. Send verification code (Edge Function)
const sendVerificationCode = async (phone: string) => {
  const { data, error } = await supabase.functions.invoke(
    "send-verification-code",
    {
      body: { phone },
    },
  );
  return data;
};

// 2. Verify code
const verifyPhoneCode = async (phone: string, code: string) => {
  const { data, error } = await supabase.functions.invoke("verify-phone-code", {
    body: { phone, code },
  });

  if (data?.verified) {
    // Update profile
    await supabase
      .from("profiles")
      .update({ phone_verified: true, phone })
      .eq("id", userId);
  }
};
```

**Edge Function** (Deno):

```typescript
// supabase/functions/send-verification-code/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Twilio from "https://deno.land/x/twilio@0.1.0/mod.ts";

serve(async (req) => {
  const { phone } = await req.json();

  const client = new Twilio(
    Deno.env.get("TWILIO_ACCOUNT_SID")!,
    Deno.env.get("TWILIO_AUTH_TOKEN")!,
  );

  const verification = await client.verify.v2
    .services(Deno.env.get("TWILIO_VERIFY_SERVICE_SID")!)
    .verifications.create({ to: phone, channel: "sms" });

  return new Response(JSON.stringify({ success: true }), {
    headers: { "Content-Type": "application/json" },
  });
});
```

---

## Session Management

### Auto-refresh Sessions

Supabase automatically refreshes sessions, but you can customize:

```typescript
const supabase = createClient(url, key, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});
```

### Handle Session Expiry

```typescript
// In AuthContext
useEffect(() => {
  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((event, session) => {
    if (event === "TOKEN_REFRESHED") {
      console.log("Token refreshed");
    }
    if (event === "SIGNED_OUT") {
      // Clear local state
      setProfile(null);
    }
  });

  return () => subscription.unsubscribe();
}, []);
```

---

## Security Best Practices

1. **Password Requirements**
   - Minimum 8 characters
   - At least one uppercase, one lowercase, one number
   - Enforce in signup form validation

2. **Rate Limiting**
   - Supabase Auth has built-in rate limiting
   - Additional rate limiting in Edge Functions for sensitive operations

3. **Two-Factor Authentication (Future)**
   - Supabase supports TOTP 2FA
   - Consider for admin accounts first
   - Roll out to all users in Phase 2

4. **Account Recovery**
   - Password reset via email link
   - Security questions (optional)
   - Admin-assisted recovery for locked accounts

5. **Suspicious Activity Detection**
   - Log auth events (signins, signouts, password changes)
   - Alert on multiple failed login attempts
   - Temporary account locks after 5 failed attempts

---

## Implementation Checklist

- [ ] Set up Supabase Auth in project
- [ ] Create auth context and provider
- [ ] Implement database trigger for profile creation
- [ ] Update SignIn.tsx to use Supabase Auth
- [ ] Update ClientSignup.tsx to use Supabase Auth
- [ ] Update ProviderSignup.tsx to use Supabase Auth
- [ ] Add protected route guards
- [ ] Implement email verification flow
- [ ] Add phone verification for providers (Edge Function)
- [ ] Set up password reset flow
- [ ] Configure email templates in Supabase Dashboard
- [ ] Test role-based access control
- [ ] Add loading states during auth operations
- [ ] Implement auth error handling and user feedback
- [ ] Add "Remember Me" functionality
- [ ] Set up session monitoring and auto-refresh
