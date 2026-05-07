"use client";

import { Alert, Box, CircularProgress, Grid, Typography } from "@mui/material";

import { useGetResourcesByIds } from "../operations/query";

import { ResourceCard } from "./ResourceCard";

interface SelectedResourcesListProps {
  resourceIds: string[];
}

export function SelectedResourcesList({ resourceIds }: SelectedResourcesListProps) {
  const { data: resources, isLoading, error } = useGetResourcesByIds(resourceIds);

  if (isLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: 200,
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error">
        {error instanceof Error ? error.message : "Failed to load resources"}
      </Alert>
    );
  }

  if (!resources || resources.length === 0) {
    return (
      <Alert severity="info">No resources selected</Alert>
    );
  }

  const fileCount = resources.filter((r) => r.kind === "file").length;
  const folderCount = resources.filter((r) => r.kind === "folder").length;

  const getCountText = () => {
    const parts = [];
    if (fileCount > 0) {
      parts.push(`${fileCount} file${fileCount > 1 ? "s" : ""}`);
    }
    if (folderCount > 0) {
      parts.push(`${folderCount} folder${folderCount > 1 ? "s" : ""}`);
    }
    return parts.join(", ") + " selected";
  };

  return (
    <Box>
      <Typography variant="subtitle2" sx={{ mb: 2 }}>
        {getCountText()}
      </Typography>
      <Grid container spacing={2}>
        {resources.map((resource) => (
          <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={resource.id}>
            <ResourceCard
              resource={resource}
              selected={false}
            />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

