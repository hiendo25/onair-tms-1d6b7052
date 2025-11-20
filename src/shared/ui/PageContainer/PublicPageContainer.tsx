import * as React from "react";
import Box from "@mui/material/Box";
import Container, { ContainerProps } from "@mui/material/Container";
import PageHeader, { PageHeaderProps } from "./PageHeader";

export interface PublicPageContainerProps extends ContainerProps {
  children?: React.ReactNode;
  title?: string;
  breadcrumbs?: PageHeaderProps["breadcrumbs"];
  actions?: React.ReactNode;
}

export default function PublicPageContainer(props: PublicPageContainerProps) {
  const { children, breadcrumbs, title, actions = null } = props;
  return (
    <div className="page-container">
      <Container
        maxWidth="lg"
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
        }}
        className="px-0!"
      >
        <div className="h-6"></div>
        <PageHeader
          breadcrumbs={breadcrumbs}
          actions={actions}
          pageTitle={title}
          rightColumn={null}
        />
        <div className="h-6"></div>
        {children}
      </Container>
    </div>
  );
}

