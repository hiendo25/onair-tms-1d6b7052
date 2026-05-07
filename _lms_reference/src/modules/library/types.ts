import { Database } from "@/types/supabase.types";

type Resource = Database["public"]["Tables"]["resources"]["Row"] & {}
type Library = Database["public"]["Tables"]["libraries"]["Row"] & {}

export type { Resource, Library };
