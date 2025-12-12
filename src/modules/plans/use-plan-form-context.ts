"use client";

import { useFormContext } from "react-hook-form";
import { PlanFormSchema } from "./plan-form.schema";

export const usePlanFormContext = () => useFormContext<PlanFormSchema>();

