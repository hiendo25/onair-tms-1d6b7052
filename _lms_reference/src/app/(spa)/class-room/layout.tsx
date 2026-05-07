import React from "react";

import Authorized from "@/modules/auth-wrapper/Authorized";
import OrganizationWrapper from "@/modules/organization/container/OrganizationWrapper";
import { SPALayout } from "@/shared/ui/layouts/spa";

interface PropTypes {
  children: React.ReactNode;
}

const Layout = async (props: PropTypes) => {
  const { children } = props;
  return (
    <Authorized>
      <OrganizationWrapper>
        <SPALayout loading={false}>{children}</SPALayout>
      </OrganizationWrapper>
    </Authorized>
  );
};

export default Layout;
