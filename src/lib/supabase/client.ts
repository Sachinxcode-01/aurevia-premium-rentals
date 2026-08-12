import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "./types";

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// Singleton for use outside of React components (e.g. hooks)
let _client: ReturnType<typeof createClient> | null = null;
export function getClient() {
  if (!_client) _client = createClient();
  return _client;
}
