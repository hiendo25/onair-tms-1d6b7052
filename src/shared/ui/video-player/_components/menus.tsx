import type { MenuPlacement, TooltipPlacement } from "@vidstack/react";
import { Menu, Tooltip } from "@vidstack/react";
import { SettingsIcon } from "@vidstack/react/icons";

import { buttonClass, iconClass, tooltipClass } from "./buttons";

export interface SettingsProps {
  placement: MenuPlacement;
  tooltipPlacement: TooltipPlacement;
}

export const Settings = ({ placement, tooltipPlacement }: SettingsProps) => {
  return (
    <Menu.Root className="parent">
      <Tooltip.Root>
        <Tooltip.Trigger asChild>
          <Menu.Button className={buttonClass}>
            <SettingsIcon className={iconClass} />
          </Menu.Button>
        </Tooltip.Trigger>
        <Tooltip.Content className={tooltipClass} placement={tooltipPlacement}>
          Cài đặt
        </Tooltip.Content>
      </Tooltip.Root>
    </Menu.Root>
  );
};
