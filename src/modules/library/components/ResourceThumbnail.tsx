"use client";

import { useState } from "react";
import { Box } from "@mui/material";

import { Resource } from "../types";

import { ResourceIcon } from "./ResourceIcon";

interface ResourceThumbnailProps {
  resource: Resource;
}

export function ResourceThumbnail({ resource }: ResourceThumbnailProps) {
  const [thumbnailError, setThumbnailError] = useState(false);

  if (resource.thumbnail_url && !thumbnailError) {
    return (
      <Box
        sx={{
          width: 48,
          height: 48,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
        }}
      >
        <img
          src={resource.thumbnail_url}
          alt={resource.name}
          onError={() => setThumbnailError(true)}
          style={{
            maxWidth: "100%",
            maxHeight: "100%",
            objectFit: "contain",
          }}
        />
      </Box>
    );
  }

  return <ResourceIcon
    isFolder={resource.kind === "folder"}
    mimeType={resource.mime_type || ""}
    extension={resource.extension || ""}
  />;
}

