"use client";

import * as React from "react";
import { Box, Card, CardContent, Typography } from "@mui/material";

export interface InfoGroupItem {
  label: string;
  value: React.ReactNode;
}

export interface InfoGroupCardProps {
  title: string;
  description?: string;
  items: InfoGroupItem[];
}

const EMPTY_VALUE_LABEL = "Chưa cập nhật";

const InfoGroupCard: React.FC<InfoGroupCardProps> = ({ title, description, items }) => {
  const renderValue = (value: React.ReactNode) => {
    if (value === undefined || value === null || value === "") {
      return (
        <Typography variant="subtitle1" sx={{ fontWeight: 600, lineHeight: 1.4 }}>
          {EMPTY_VALUE_LABEL}
        </Typography>
      );
    }

    if (typeof value === "string" || typeof value === "number") {
      return (
        <Typography variant="subtitle1" sx={{ fontWeight: 600, lineHeight: 1.4 }}>
          {value}
        </Typography>
      );
    }

    return value;
  };

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
        <Typography variant="h6" sx={{ mb: 1, fontWeight: 700 }}>
          {title}
        </Typography>
        {description ? (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {description}
          </Typography>
        ) : null}

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, minmax(0, 1fr))",
              md: "repeat(3, minmax(0, 1fr))",
            },
            gap: 2,
          }}
        >
          {items.map((item) => (
            <Box
              key={item.label}
              sx={{
                p: 2,
                borderRadius: 2,
                border: "1px solid",
                borderColor: "divider",
                bgcolor: "background.paper",
                minHeight: 92,
              }}
            >
              <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: "block" }}>
                {item.label}
              </Typography>
              {renderValue(item.value)}
            </Box>
          ))}
        </Box>
      </CardContent>
    </Card>
  );
};

export default InfoGroupCard;
