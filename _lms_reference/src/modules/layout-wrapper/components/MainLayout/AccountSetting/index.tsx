"use client";
import React, { useMemo } from "react";
import { Button } from "@mui/material";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import useAuthSignOut from "@/modules/auth/hooks/useAuthSignOut";
import { useUserOrganization } from "@/modules/organization/store/OrganizationProvider";
import { LogoutIcon } from "@/shared/assets/icons";
import Avatar from "@/shared/ui/Avatar";

import AccountMenuOptions, { AccountMenuOptionsProps } from "./AccountMenuOptions";
interface AccountSettingProps {
  className?: string;
  avatarOnly?: boolean;
}

const AccountSetting: React.FC<AccountSettingProps> = ({ className, avatarOnly = false }) => {
  const employee = useUserOrganization((state) => state.currentEmployee);
  const { signOut, isPending } = useAuthSignOut();
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

  const renderHeaderInfo = () => {
    return (
      <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-2 m-1">
        <Avatar
          alt={employee.profile?.fullName}
          src={employee.profile?.avatarUrl}
          variant="rounded"
          className="rounded-[99px]"
        />
        <Box component="div" className="flex-1 mx-auto">
          <Typography variant="body2" sx={{ fontWeight: 500, fontSize: "0.75rem" }} className="line-clamp-1">
            {employee.profile?.fullName}
          </Typography>
          <Typography
            variant="caption"
            sx={{ color: "text.secondary" }}
            className="line-clamp-1 break-all leading-tight"
          >
            {employee.type}
          </Typography>
        </Box>
      </div>
    );
  };
  return (
    <Stack direction="row" className="account-item">
      <AccountMenuOptions
        slots={{
          header: renderHeaderInfo(),
          footer: (
            <div className="p-1 border-t border-gray-200 mt-1">
              <Button
                startIcon={<LogoutIcon fontSize="small" />}
                size="small"
                onClick={signOut}
                disabled={isPending}
                fullWidth
                variant="text"
                color="error"
              >
                Đăng xuất
              </Button>
            </div>
          ),
        }}
        menuItems={ACCOUNT_ITEMS}
      >
        <Avatar
          alt={employee.profile?.fullName}
          src={employee.profile?.avatarUrl}
          variant="rounded"
          className="rounded-[99px]"
        />
      </AccountMenuOptions>
    </Stack>
  );
};
export default AccountSetting;
