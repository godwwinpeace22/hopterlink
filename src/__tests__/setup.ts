// Global test setup for hopterlink web app
// Stub import.meta.env for Supabase client
// @ts-nocheck
if (!import.meta.env) {
  import.meta.env = {} as any;
}
(import.meta.env as any).VITE_SUPABASE_URL ??= "https://test.supabase.co";
(import.meta.env as any).VITE_SUPABASE_ANON_KEY ??= "test-anon-key";
