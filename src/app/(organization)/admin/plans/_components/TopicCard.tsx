"use client";

import { ReactNode } from "react";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { Box, Chip, IconButton, Typography } from "@mui/material";

import { Topic } from "@/modules/plans/plan-form.schema";

interface TopicCardProps {
  topic: Topic;
  mode?: "editable" | "readonly";
  onEdit?: () => void;
  onDelete?: () => void;
  children?: ReactNode;
}

export default function TopicCard({
  topic,
  mode = "readonly",
  onEdit,
  onDelete,
  children,
}: TopicCardProps) {
  return (
    <Box
      sx={{
        p: 2.5,
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 2,
        bgcolor: "common.white",
        boxShadow: "0 10px 26px rgba(0,0,0,0.06)",
      }}
    >
      {/* Topic Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          mb: children ? 2 : 0,
        }}
      >
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5, flexWrap: "wrap" }}>
            <Chip
              label="Chủ đề"
              size="small"
              color="primary"
              sx={{ height: 24 }}
            />
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              {topic.name}
            </Typography>
          </Box>
          {topic.description && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                overflow: "hidden",
                textOverflow: "ellipsis",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                wordBreak: "break-word",
              }}
            >
              {topic.description}
            </Typography>
          )}
        </Box>

        {/* Action Buttons (only in editable mode) */}
        {mode === "editable" && (
          <Box sx={{ display: "flex", gap: 0.5 }}>
            <IconButton size="small" onClick={onEdit}>
              <EditIcon fontSize="small" />
            </IconButton>
            <IconButton size="small" onClick={onDelete}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Box>
        )}
      </Box>

      {/* Additional Content (e.g., course assignment section) */}
      {children}
    </Box>
  );
}
