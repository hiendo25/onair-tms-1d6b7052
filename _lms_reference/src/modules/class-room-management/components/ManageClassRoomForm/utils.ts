import { FieldErrors } from "react-hook-form";

import { ClassRoomFormValues } from "./classroom-form.schema";
import { TAB_KEYS_CLASS_ROOM } from "./ClassRoomFormContainer";

/**
 * @param tabKey Name of classRoom tabs
 * @returns The key fields by tab.
 */
export const getKeyFieldByTab = (tabKey: keyof typeof TAB_KEYS_CLASS_ROOM) => {
  let keyListByTab: (keyof ClassRoomFormValues)[] = [];

  switch (tabKey) {
    case "clsTab-information": {
      keyListByTab = ["title", "thumbnailUrl", "slug", "description", "categories", "roomType", "docs", "forWhom"];
      break;
    }

    case "clsTab-session": {
      keyListByTab = ["classRoomSessions"];
      break;
    }
    case "clsTab-setting": {
      break;
    }
  }
  return keyListByTab;
};

export const getStatusTabClassRoom = (
  errors: FieldErrors<ClassRoomFormValues>,
  tabKey: keyof typeof TAB_KEYS_CLASS_ROOM,
): "invalid" | "valid" => {
  const keyListByTab = getKeyFieldByTab(tabKey);

  const isValid = keyListByTab.every((key) => !errors[key]);

  return isValid ? "valid" : "invalid";
};
