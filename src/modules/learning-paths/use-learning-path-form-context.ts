"use client";

import { useFormContext } from "react-hook-form";
import { LearningPathFormSchema } from "./learning-path-form.schema";

export const useLearningPathFormContext = () => useFormContext<LearningPathFormSchema>();

