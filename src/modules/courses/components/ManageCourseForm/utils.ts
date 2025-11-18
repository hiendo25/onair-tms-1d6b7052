import { FieldErrors } from "react-hook-form";
import { UpsertCourseFormData } from "./upsert-course.schema";
import { TAB_KEYS_MANAGE_COURSE } from "./UpsertCourseFormContainer";

/**
 * @param tabKey Name of courses tabs
 * @returns The key fields by tab.
 */
export const getKeyFieldByTab = (tabKey: keyof typeof TAB_KEYS_MANAGE_COURSE) => {
  let keyListByTab: (keyof UpsertCourseFormData)[] = [];

  switch (tabKey) {
    case "clsTab-information": {
      keyListByTab = ["title", "slug", "description", "categories"];
      break;
    }

    case "clsTab-section": {
      keyListByTab = ["sections"];
      break;
    }
  }
  return keyListByTab;
};

export const getStatusCoursesTab = (
  errors: FieldErrors<UpsertCourseFormData>,
  tabKey: keyof typeof TAB_KEYS_MANAGE_COURSE,
): "invalid" | "valid" => {
  const keyListByTab = getKeyFieldByTab(tabKey);

  const isValid = keyListByTab.every((key) => !errors[key]);

  return isValid ? "valid" : "invalid";
};
