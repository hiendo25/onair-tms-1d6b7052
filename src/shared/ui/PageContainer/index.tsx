import * as React from "react";

import { cn } from "@/utils";

import PageHeader, { PageHeaderProps } from "./PageHeader";

export interface PageContainerProps {
  children?: React.ReactNode;
  title?: string;
  breadcrumbs?: PageHeaderProps["breadcrumbs"];
  actions?: React.ReactNode;
  contained?: boolean;
  align?: "center" | "right" | "left";
}
export default function PageContainer(props: PageContainerProps) {
  const { children, breadcrumbs, title, actions = null, contained = true, align = "center" } = props;
  return (
    <div
      className={cn("page-container w-full", {
        "lg:max-w-[1680px]": contained,
        "mx-auto": align === "center",
        "ml-auto": align === "right",
        "mr-auto": align === "left",
      })}
    >
      <div className="h-6 md:h-8"></div>
      {(title || actions || breadcrumbs) && (
        <PageHeader breadcrumbs={breadcrumbs} actions={actions} pageTitle={title} />
      )}
      <div className="h-6"></div>
      <div className="flex flex-col w-full flex-1">{children}</div>
    </div>
  );
}
