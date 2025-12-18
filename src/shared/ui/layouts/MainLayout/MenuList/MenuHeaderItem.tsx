import * as React from "react";
import ListSubheader from "@mui/material/ListSubheader";
import type {} from "@mui/material/themeCssVarsAugmentation";

import { useMenuContext } from "./MenuContext";

export interface MenuHeaderItemProps {
  children?: React.ReactNode;
}

export default function MenuHeaderItem({ children }: MenuHeaderItemProps) {
  const { mini = false } = useMenuContext();

  return (
    <ListSubheader
      sx={{
        fontSize: 12,
        fontWeight: "600",
        height: mini ? 0 : 36,
        // ...(hasDrawerTransitions
        //   ? getDrawerSxTransitionMixin(fullyExpanded, "height")
        //   : {}),
        px: 3.5,
        py: 0,
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
        zIndex: 2,
        display: "flex",
        alignItems: "center",
      }}
    >
      {children}
    </ListSubheader>
  );
}
