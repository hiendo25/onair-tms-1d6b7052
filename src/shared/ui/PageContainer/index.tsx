import * as React from "react";
import { Toolbar } from "@mui/material";
import Box from "@mui/material/Box";
import Container, { ContainerProps } from "@mui/material/Container";
import Stack from "@mui/material/Stack";

import AccountSetting from "../layouts/MainLayout/AccountSetting";
import ThemeSwitcher from "../layouts/MainLayout/ThemeSwitcher";
import NotificationButton from "../NotificationButton";
import SettingButton from "../SettingButton";

import PageHeader, { PageHeaderProps } from "./PageHeader";

export interface PageContainerProps extends ContainerProps {
  children?: React.ReactNode;
  title?: string;
  breadcrumbs?: PageHeaderProps["breadcrumbs"];
  actions?: React.ReactNode;
}
export default function PageContainer(props: PageContainerProps) {
  const { children, breadcrumbs, title, actions = null } = props;
  return (
    <div className="page-container">
      <div className="h-6"></div>
      <PageHeader
        breadcrumbs={breadcrumbs}
        actions={actions}
        pageTitle={title}
        // rightColumn={
        //   <Stack direction="row" alignItems="center" spacing={1.5}>
        //     <NotificationButton />
        //     <AccountSetting />
        //     {/* <ThemeSwitcher /> */}
        //     {/* <SettingButton /> */}
        //   </Stack>
        // }
      />
      <div className="h-6"></div>
      <Container
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          width: "100%",
          maxWidth: { sm: "100%", md: "1700px" },
        }}
        className="px-0!"
        maxWidth={false}
      >
        {children}
      </Container>
    </div>
  );
}
