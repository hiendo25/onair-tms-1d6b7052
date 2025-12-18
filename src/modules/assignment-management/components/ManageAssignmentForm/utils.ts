import { FieldErrors } from "react-hook-form";

import { Assignment } from "../assignment-form.schema";

type AssignmentTabTypes = "idle" | "invalid" | "valid";
import { TAB_KEYS_ASSIGNMENT } from "./AssignmentFormContainer";

export const getKeyFieldByTab = (tabKey: keyof typeof TAB_KEYS_ASSIGNMENT) => {
  let keyListByTab: (keyof Assignment)[] = [];

  switch (tabKey) {
    case "assignTab-information": {
      keyListByTab = ["name", "description", "assignmentCategories"];
      break;
    }
    case "assignTab-content": {
      keyListByTab = ["questions"];
      break;
    }
    case "assignTab-settings": {
      keyListByTab = ["assignedEmployees"];
      break;
    }
  }
  return keyListByTab;
};

export const getStatusTabAssignment = (
  error: FieldErrors<Assignment>,
  tabKey: keyof typeof TAB_KEYS_ASSIGNMENT,
): AssignmentTabTypes => {
  const tabStatus: AssignmentTabTypes = "idle";

  const keyListByTab = getKeyFieldByTab(tabKey);

  const isValid = keyListByTab.every((key) => !error[key]);

  return isValid ? "valid" : "invalid";
};

