const joinPath = (base: string, segment: string) => `${base}/${segment}`;

const providerRoot = "/dashboard/provider";
const clientRoot = "/dashboard/client";
const adminRoot = "/dashboard/admin";

const adminSections = {
  overview: "overview",
  users: "users",
  countries: "countries",
  verification: "verification",
  disputes: "disputes",
  revenue: "revenue",
} as const;

const providerSections = {
  overview: "overview",
  requests: "requests",
  jobBoard: "job-board",
  jobs: "jobs",
  jobDetails: "job/:jobId",
  calendar: "calendar",
  wallet: "wallet",
  profile: "profile",
  profileUser: "profile/:userId",
  messages: "messages",
  notifications: "notifications",
  reviews: "reviews",
  settings: "settings",
} as const;

const clientSections = {
  overview: "overview",
  browse: "browse",
  providers: "providers",
  providerProfile: "providers/profile",
  booking: "booking",
  bookings: "bookings",
  reviews: "reviews",
  wallet: "wallet",
  myJobs: "my-jobs",
  jobDetails: "job/:jobId",
  postJob: "post-job",
  messages: "messages",
  notifications: "notifications",
  profile: "profile",
  profileUser: "profile/:userId",
} as const;

const providerSectionByQueryValue = {
  overview: "overview",
  requests: "requests",
  "job-board": "jobBoard",
  jobs: "jobs",
  calendar: "calendar",
  wallet: "wallet",
  profile: "profile",
  messages: "messages",
  notifications: "notifications",
  reviews: "reviews",
  settings: "settings",
} as const;

const clientSectionByQueryValue = {
  overview: "overview",
  browse: "browse",
  providers: "providers",
  booking: "booking",
  bookings: "bookings",
  reviews: "reviews",
  wallet: "wallet",
  "my-jobs": "myJobs",
  "post-job": "postJob",
  messages: "messages",
  notifications: "notifications",
  profile: "profile",
} as const;

type ProviderSectionKey = keyof typeof providerSections;
type ClientSectionKey = keyof typeof clientSections;

export const paths = {
  home: "/",
  services: "/services",
  providers: "/providers",
  providerProfile: "/providers/:providerId",
  howItWorks: "/how-it-works",
  about: "/about",
  terms: "/terms",
  privacy: "/privacy",
  auth: {
    signIn: "/signin",
    clientSignup: "/client-signup",
    providerSignup: "/provider-signup",
    forgotPassword: "/forgot-password",
    resetPassword: "/reset-password",
    emailVerification: "/verify-email",
  },
  dashboard: {
    root: "/dashboard",
    provider: {
      root: providerRoot,
      sections: providerSections,
      absolute: (section: ProviderSectionKey) =>
        joinPath(providerRoot, providerSections[section]),
      job: (jobId: string) => joinPath(providerRoot, `job/${jobId}`),
      publicProfile: (userId: string) =>
        joinPath(providerRoot, `profile/${userId}`),
    },
    client: {
      root: clientRoot,
      sections: clientSections,
      absolute: (section: ClientSectionKey) =>
        joinPath(clientRoot, clientSections[section]),
      job: (jobId: string) => joinPath(clientRoot, `job/${jobId}`),
      publicProfile: (userId: string) =>
        joinPath(clientRoot, `profile/${userId}`),
    },
    resolveProviderSection: (section: string) => {
      const key = providerSectionByQueryValue[
        section as keyof typeof providerSectionByQueryValue
      ] as ProviderSectionKey | undefined;

      if (!key) {
        return null;
      }

      if (key === "requests") {
        return joinPath(providerRoot, providerSections.jobs);
      }

      return joinPath(providerRoot, providerSections[key]);
    },
    resolveClientSection: (section: string) => {
      const key = clientSectionByQueryValue[
        section as keyof typeof clientSectionByQueryValue
      ] as ClientSectionKey | undefined;

      if (!key) {
        return null;
      }

      return joinPath(clientRoot, clientSections[key]);
    },
    admin: {
      root: adminRoot,
      sections: adminSections,
      absolute: (section: keyof typeof adminSections) =>
        joinPath(adminRoot, adminSections[section]),
    },
  },
  provider: {
    onboarding: "/provider/onboarding",
    verification: "/provider/verification",
  },
  profile: {
    user: (userId: string) => `/profile/${userId}`,
    route: "/profile/:userId",
  },
} as const;
