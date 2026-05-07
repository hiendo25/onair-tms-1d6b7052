import { AdminUserAttributes } from "@supabase/supabase-js";

export interface UserInsert {
  password: string;
  email: string;
  organizationId: string;
}
