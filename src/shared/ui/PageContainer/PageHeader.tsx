import { Avatar, Box, Stack, Toolbar, Typography } from "@mui/material";
import Link from "next/link";
import PageContentHeader from "./PageContentHeader";
import PageHeaderBreadcrumbs from "./PageHeaderBreadCrumb";

export interface Breadcrumb {
  title: string;
  path?: string;
}
export interface PageHeaderProps {
  pageTitle?: string;
  actions?: React.ReactNode;
  breadcrumbs?: Breadcrumb[];
  rightColumn?: React.ReactNode;
  className?: string;
}
const PageHeader: React.FC<PageHeaderProps> = ({
  pageTitle,
  actions,
  breadcrumbs,
  rightColumn,
  className,
}) => {
  return (
    <Toolbar sx={{ px: "0 !important" }} className={className}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{
          flexWrap: "wrap",
          width: "100%",
        }}
      >
        <Stack direction="row" alignItems="center">
          <Stack>
            <PageContentHeader>
              {pageTitle ? (
                <Typography component="h1" variant="h4">
                  {pageTitle}
                </Typography>
              ) : null}
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "row",
                  gap: 1,
                  // marginLeft: "auto",
                }}
              >
                {actions}
              </Box>
            </PageContentHeader>
            {breadcrumbs ? (
              <PageHeaderBreadcrumbs
                aria-label="breadcrumb"
                separator={
                  <span className="text-sm mx-1 mt-[1px] inline-block text-gray-600">
                    /
                  </span>
                }
                className="mt-1"
              >
                {breadcrumbs?.map((breadcrumb, index) => (
                  <BreadcrumbItem
                    key={index}
                    title={breadcrumb.title}
                    path={breadcrumb.path}
                    className="text-xs"
                  />
                ))}
              </PageHeaderBreadcrumbs>
            ) : null}
          </Stack>
        </Stack>
        <Stack
          direction="row"
          alignItems="center"
          spacing={1}
          sx={{ marginLeft: "auto" }}
        >
          {rightColumn}
        </Stack>
      </Stack>
    </Toolbar>
  );
};
export default PageHeader;

interface BreadcrumbItemProps {
  path?: string;
  title?: string;
  className?: string;
}
const BreadcrumbItem: React.FC<BreadcrumbItemProps> = ({
  path,
  title,
  className,
}) => {
  if (path)
    return (
      <Link color="inherit" href={path} className={className}>
        {title}
      </Link>
    );

  return (
    <Typography
      className={className}
      sx={{
        color: "text.primary",
      }}
    >
      {title}
    </Typography>
  );
};
