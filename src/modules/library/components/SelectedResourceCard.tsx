"use client";

import { Alert, Card, CardContent, CircularProgress } from "@mui/material";
import { useGetResourceById } from "../operations/query";
import { ResourceCard } from "./ResourceCard";

interface SelectedResourceCardProps {
  resourceId: string;
}

export function SelectedResourceCard({ resourceId }: SelectedResourceCardProps) {
  const { data: resource, isLoading, error } = useGetResourceById(resourceId);

  if (isLoading) {
    return (
      <Card
        sx={{
          width: "100%",
          height: 190,
          border: "1px solid #e0e0e0",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress />
      </Card>
    );
  }

  if (error) {
    return (
      <Card
        sx={{
          width: "100%",
          height: 190,
          border: "1px solid #e0e0e0",
        }}
      >
        <CardContent>
          <Alert severity="error">
            {error instanceof Error ? error.message : "Failed to load resource"}
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (!resource) {
    return (
      <Card
        sx={{
          width: "100%",
          height: 190,
          border: "1px solid #e0e0e0",
        }}
      >
        <CardContent>
          <Alert severity="warning">Resource not found</Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <ResourceCard
      resource={resource}
      selected={false}
    />
  );
}

