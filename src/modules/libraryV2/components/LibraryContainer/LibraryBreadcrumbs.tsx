import HomeIcon from "@mui/icons-material/Home";
import { Breadcrumbs, Link, Typography } from "@mui/material";

import { useLibraryResource } from "./LibraryResource.context";

type LibraryBreadcrumbsProps = {
  className?: string;
};

export function LibraryBreadcrumbs({ className }: LibraryBreadcrumbsProps) {
  const { folderPaths } = useLibraryResource();
  return (
    <Breadcrumbs aria-label="folder navigation">
      {folderPaths.map((folder, index) => {
        const isLast = index === folderPaths.length - 1;
        return isLast ? (
          <Typography
            key={folder.id || "root"}
            color="text.primary"
            sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
          >
            {index === 0 ? <HomeIcon fontSize="small" /> : null}
            {folder.name}
          </Typography>
        ) : (
          <Link
            key={folder.id || "root"}
            component="button"
            variant="body1"
            onClick={() => onNavigate(folder.id)}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.5,
              cursor: "pointer",
              textDecoration: "none",
              "&:hover": {
                textDecoration: "underline",
              },
            }}
          >
            {index === 0 ? <HomeIcon fontSize="small" /> : null}
            {folder.name}
          </Link>
        );
      })}
    </Breadcrumbs>
  );
}
