import React from "react";

import Authorized from "@/modules/auth-wrapper/Authorized";
import UserOrganizationWraper from "@/modules/organization/container/UserOrganizationWrapper";
import { SPALayout } from "@/shared/ui/layouts/spa";

interface PropTypes {
  children: React.ReactNode;
}

const Layout = async (props: PropTypes) => {
  const { children } = props;
  return (
    <Authorized>
      <UserOrganizationWraper>
        <SPALayout loading={false}>{children}</SPALayout>
      </UserOrganizationWraper>
    </Authorized>
  );
};

export default Layout;
