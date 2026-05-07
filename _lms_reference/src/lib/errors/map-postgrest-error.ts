import { PostgrestError } from "@supabase/supabase-js";

import { DomainError } from "./DomainError";

const UNIQUE_KEY_REGEX = /Key\s*\(([^)]+)\)=\(([^)]+)\)/;

/**
 * Using infra layer
 * @param error from PostFresError
 * @returns
 */
export const mapPostgrestError = (error: PostgrestError): DomainError => {
  console.error(error);
  if (error.code === "23505") {
    const match = error.details?.match(UNIQUE_KEY_REGEX);

    const field = match?.[1] ?? "unknown";
    const value = match?.[2];

    return new DomainError(error.details, "LEVEL_ALREADY_EXISTS", 409, error);
  }

  if (error.code === "23502") {
    return new DomainError("Missing required field", "REQUIRED_FIELD_MISSING", 400, error);
  }

  if (error.code === "22P02") {
    return new DomainError("Invalid UUID format", "INVALID_UUID", 400, error);
  }

  if (error.code === "PGRST103") {
    return new DomainError("Invalid pagination range", "INVALID_PAGINATION", 400, error);
  }

  // Fallback
  return new DomainError("Database error", "DATABASE_ERROR", 500, error);
};
