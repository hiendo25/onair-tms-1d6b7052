"use client";
import React, { useMemo } from "react";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import { useUserOrganization } from "@/modules/organization/store/UserOrganizationProvider";
import Avatar from "@/shared/ui/Avatar";

import AccountMenuOptions, { AccountMenuOptionsProps } from "./AccountMenuOptions";
interface AccountSettingProps {
  className?: string;
}

const AccountSetting: React.FC<AccountSettingProps> = () => {
  const userOrganization = useUserOrganization((state) => state.data);
  const ACCOUNT_ITEMS: AccountMenuOptionsProps["menuItems"] = useMemo(
    () => [
      {
        title: "Thông tin cá nhân",
        type: "item",
      },
      {
        title: "Tài khoản",
        type: "item",
      },
      {
        title: "Cài đặt",
        type: "item",
      },
    ],
    [],
  );

  return (
    <Stack direction="row" className="account-item">
      <AccountMenuOptions menuItems={ACCOUNT_ITEMS}>
        <div className="max-w-40 flex items-center gap-2">
          <Avatar
            alt={userOrganization.profile?.fullName}
            src={userOrganization.profile?.avatarUrl}
            variant="rounded"
            className="rounded-[10px]"
          />
          <Box component="div" sx={{ mr: "auto" }} className="flex-1">
            <Typography variant="body2" sx={{ fontWeight: 500, fontSize: "0.75rem" }} className="line-clamp-1">
              {userOrganization.profile?.fullName}
            </Typography>
            <Typography
              variant="caption"
              sx={{ color: "text.secondary" }}
              className="line-clamp-1 break-all leading-tight"
            >
              {userOrganization.employeeType}
            </Typography>
          </Box>
        </div>
      </AccountMenuOptions>
    </Stack>
  );
};
export default AccountSetting;
