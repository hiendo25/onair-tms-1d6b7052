"use client";

import { Box, Card, CardContent, Typography } from "@mui/material";

import { formatFileSize } from "@/utils";
import { Resource } from "../types";

import { ResourceActionMenu } from "./ResourceActionMenu";
import { ResourceThumbnail } from "./ResourceThumbnail";

interface ResourceCardProps {
  resource: Resource;
  selected: boolean;
  onClick?: () => void;
  onDoubleClick?: () => void;
  onRename?: (resource: Resource) => void;
  onDelete?: (resource: Resource) => void;
}

export function ResourceCard({
  resource,
  selected,
  onClick,
  onDoubleClick,
  onRename,
  onDelete,
}: ResourceCardProps) {
  const isFolder = resource.kind === "folder";

  return (
    <Card
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      sx={{
        cursor: "pointer",
        width: "100%",
        height: 190,
        border: selected ? "1px solid #1976d2" : "1px solid #e0e0e0",
        backgroundColor: selected ? "#e3f2fd" : "white",
        position: "relative",
        "&:hover": {
          boxShadow: 3,
          borderColor: isFolder ? "#5f6368" : selected ? "#1976d2" : "#bdbdbd",
        },
      }}
    >
      {onRename && onDelete && (
        <ResourceActionMenu
          resource={resource}
          onRename={onRename}
          onDelete={onDelete}
        />
      )}
      <CardContent
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
          p: 2,
          "&:last-child": { pb: 2 },
        }}
      >
        <Box sx={{ mb: 1 }}>
          <ResourceThumbnail resource={resource} />
        </Box>
        <Typography
          variant="body2"
          align="center"
          sx={{
            fontWeight: 400,
            wordBreak: "break-word",
            mb: 0.5,
            overflow: "hidden",
            textOverflow: "ellipsis",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
          }}
        >
          {resource.name || "Untitled"}
        </Typography>
        {!isFolder && (
          <Typography variant="caption" color="text.secondary" align="center">
            {formatFileSize(resource.size)}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}

