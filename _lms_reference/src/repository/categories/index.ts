import { supabase } from "@/services";

import { CreateCategoryPayload } from "./type";

const getCategories = async () => {
  return await supabase.from("categories").select("*", { count: "exact" }).order("created_at", { ascending: false });
};

const createCategory = async (payload: CreateCategoryPayload) => {
  try {
    if (!payload.name) {
      console.error("Missing name");
      return;
    }
    return await supabase.from("categories").insert(payload).select("*").single();
  } catch (err) {
    console.log(err);
    throw new Error("Create Class Field Failed");
  }
};

export { createCategory, getCategories };
