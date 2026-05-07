import { Tables } from "@/types/supabase.types";

export type Branches = Tables<"branches">;

export type BranchStatus = Branches["status"];
