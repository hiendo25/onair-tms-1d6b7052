"use client";
import * as React from "react";
import MuiAvatar from "@mui/material/Avatar";
import MuiListItemAvatar from "@mui/material/ListItemAvatar";
import ListItemText from "@mui/material/ListItemText";
import MenuItem from "@mui/material/MenuItem";
import Select, { selectClasses, SelectProps } from "@mui/material/Select";
import { styled } from "@mui/material/styles";
import Image from "next/image";

import ChevronSelectVerticalIcon from "@/shared/assets/icons/ChevronSelectVerticalIcon";

const Avatar = styled(MuiAvatar)(({ theme }) => ({
  width: 24,
  height: 24,
  backgroundColor: (theme.vars || theme).palette.grey[200],
  color: (theme.vars || theme).palette.text.secondary,
  fontSize: 12,
  textTransform: "uppercase",
  fontWeight: 600,
  // border: `1px solid ${(theme.vars || theme).palette.divider}`,
}));

interface OrganizationItem {
  id: string;
  name: string;
  shortName: string;
  logo: string;
  favicon: string;
  domain: string;
}
const ListItemAvatar = styled(MuiListItemAvatar)({
  minWidth: 0,
  marginRight: 12,
});

const SelectWrapper = styled(Select)(() => ({
  maxHeight: 56,
  "&.MuiList-root": {
    p: "8px",
  },
  [`& .${selectClasses.select}`]: {
    display: "flex",
    alignItems: "center",
    gap: "2px",
    pl: 1,
  },
}));
export interface OrganizationSelectorProps {
  options: OrganizationItem[];
  value: string | undefined;
  onChange?: (value: string, option: OrganizationItem) => void;
}
const OrganizationSelector: React.FC<OrganizationSelectorProps> = ({ options, value, onChange }) => {
  const handleChange: SelectProps<string>["onChange"] = (evt) => {
    const value = evt.target.value;

    const option = options.find((item) => item.id === value);

    if (option) onChange?.(value, option);
  };
  return (
    <Select
      labelId="organization-select"
      id="organization-simple-select"
      value={value}
      onChange={handleChange}
      displayEmpty
      inputProps={{ "aria-label": "Chọn doanh nghiệp" }}
      fullWidth
      IconComponent={ChevronSelectVerticalIcon}
      MenuProps={{
        PaperProps: {
          sx: (theme) => ({
            background: "white",
            boxShadow: "0px 0px 8px -3px rgb(0 0 0 / 30%)",
            border: "none",
            ".MuiList-root": {
              gap: "3px",
            },
            ".MuiButtonBase-root": {
              "&:focus-visible": {
                outline: "none",
              },
              "&.Mui-selected": {
                background: theme.palette.grey[200],
              },
            },
            ...theme.applyStyles("dark", {
              backgroundColor: "#141a21",
            }),
          }),
        },
      }}
      sx={(theme) => ({
        maxHeight: 40,
        background: theme.palette.grey[200],
        [`& .${selectClasses.select}`]: {
          display: "flex",
          alignItems: "center",
          gap: "2px",
          pl: 1,
        },
        svg: {
          fontSize: 14,
        },
        fieldset: {
          border: "none",
        },
        ".MuiOutlinedInput-input": {
          paddingInline: "8px",
        },
        ...theme.applyStyles("dark", {
          backgroundColor: "hsl(212.31deg 24.53% 10.39%)",
        }),
      })}
    >
      {options.map((option) => (
        <MenuItem value={option.id} key={option.id}>
          <ListItemAvatar>
            {option.favicon ? (
              <Image src={option.favicon} width={24} height={24} alt={option.shortName} />
            ) : (
              <Avatar alt={option.shortName}>{option.shortName?.slice(0, 2)}</Avatar>
            )}
          </ListItemAvatar>
          <ListItemText primary={option.shortName} />
        </MenuItem>
      ))}
    </Select>
  );
};
export default OrganizationSelector;
