import { createBrowserClient } from "@supabase/ssr";
import { SupabaseAuthClientOptions, SupabaseClientOptions } from "@supabase/supabase-js/dist/module/lib/types";

import { Database as DatabaseGenerate } from "@/types/supabase.types";

export function createClient() {
  return createBrowserClient<DatabaseGenerate>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY!,
  );
}
export const supabase = createClient();
