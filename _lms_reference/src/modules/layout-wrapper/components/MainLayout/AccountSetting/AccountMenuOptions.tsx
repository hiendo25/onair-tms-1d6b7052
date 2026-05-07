"use client";
import React, { Children, memo } from "react";
import { Button, Divider, MenuItem, MenuList, Popover } from "@mui/material";

type AccountMenuDividerItem = {
  type: "divider";
};
type AccountMenuItem = {
  title: string;
  type: "item";
  onClick?: () => void;
};

type AccountMenuItems = (AccountMenuItem | AccountMenuDividerItem)[];
export interface AccountMenuOptionsProps extends React.PropsWithChildren {
  menuItems?: AccountMenuItems;
  slots?: {
    header?: React.ReactNode;
    footer?: React.ReactNode;
  };
}
const AccountMenuOptions: React.FC<AccountMenuOptionsProps> = ({ children, slots, menuItems = [] }) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const Element = Children.only(children);

  const id = open ? "simple-popover" : undefined;

  return (
    <React.Fragment>
      <Button
        aria-label="Open menu"
        onClick={handleClick}
        sx={{ borderColor: "transparent" }}
        type="button"
        color="inherit"
        variant="fill"
        className="bg-transparent text-left p-0 h-auto min-w-auto"
        disableRipple
      >
        {Element}
      </Button>
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        <div className="w-52">
          {slots?.header ? <div className="menu-options-header">{slots?.header}</div> : null}
          <MenuList className="px-1" dense sx={{ gap: "4px 0", paddingBlock: "2px" }}>
            {menuItems.map((item, _index) => {
              if (item.type === "divider") {
                return <Divider key={_index} />;
              }
              return (
                <MenuItem key={_index} className="line-clamp-1 text-sm rounded-md py-2">
                  {item.title}
                </MenuItem>
              );
            })}
          </MenuList>
          {slots?.footer ? <div className="menu-options-footer">{slots?.footer}</div> : null}
        </div>
      </Popover>
    </React.Fragment>
  );
};

export default memo(AccountMenuOptions);
