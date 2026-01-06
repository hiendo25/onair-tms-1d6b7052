"use client";

import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import { Box, Card, Divider, Stack, Typography } from "@mui/material";

import type { SettingsItem } from "./learning-path-detail.utils";
import { SECTION_CARD_SX } from "./learning-path-detail.utils";

interface LearningPathDetailSettingsSectionProps {
  items: SettingsItem[];
}

export default function LearningPathDetailSettingsSection({
  items,
}: LearningPathDetailSettingsSectionProps) {
  return (
    <Card sx={SECTION_CARD_SX}>
      <Box sx={{ p: 3 }}>
        <Stack spacing={2}>
          <Stack spacing={0.5}>
            <Typography variant="h6" fontWeight={700}>
              Thiết lập lộ trình
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Cấu hình và điều kiện hoàn thành
            </Typography>
          </Stack>

          <Stack spacing={1.5}>
            {items.map((item, index) => (
              <Box key={item.id} className="flex items-center gap-2">
                <div className="border border-[#E1E3E6] inline rounded-lg py-0.5 px-3.5">{index + 1}</div>
                <Typography variant="body2">{item.label}</Typography>
              </Box>
            ))}
          </Stack>
        </Stack>
      </Box>
    </Card>
  );
}
