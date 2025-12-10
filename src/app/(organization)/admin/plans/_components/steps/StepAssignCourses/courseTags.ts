"use client";

import { Course } from "@/modules/plans/plan-form.schema";

export const renderCourseTags = (value: Course[]) => {
  if (!value || value.length === 0) return null;
  if (value.length === 1) return value[0]?.title || "";
  if (value.length === 2) return `${value[0]?.title || ""}, ${value[1]?.title || ""}`;
  return `${value[0]?.title || ""}, ${value[1]?.title || ""} +${value.length - 2}`;
};
