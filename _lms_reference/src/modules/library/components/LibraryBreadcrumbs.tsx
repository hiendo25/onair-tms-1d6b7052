import HomeIcon from "@mui/icons-material/Home";
import { Breadcrumbs, Link, Typography } from "@mui/material";

interface FolderPathItem {
  id: string | null;
  name: string;
}

interface LibraryBreadcrumbsProps {
  folderPath: FolderPathItem[];
  onNavigate: (folderId: string | null) => void;
}

export function LibraryBreadcrumbs({ folderPath, onNavigate }: LibraryBreadcrumbsProps) {
  return (
    <Breadcrumbs aria-label="folder navigation">
      {folderPath.map((folder, index) => {
        const isLast = index === folderPath.length - 1;
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

