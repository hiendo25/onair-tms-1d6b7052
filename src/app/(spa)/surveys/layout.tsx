import React from "react";
import { SPALayout } from "@/shared/ui/layouts/spa";

interface PropTypes {
  children: React.ReactNode;
}

const Layout = async (props: PropTypes) => {
  const { children } = props;
  return <SPALayout loading={false} isPublic={true}>{children}</SPALayout>;
};

export default Layout;

