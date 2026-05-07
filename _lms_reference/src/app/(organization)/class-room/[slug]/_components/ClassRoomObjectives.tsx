import { PersonOutline } from "@mui/icons-material";
import { Box, Stack, Typography } from "@mui/material";

import { getClassRoomMetaValue } from "@/modules/class-room-management/utils";
import { GetClassRoomBySlugResponse } from "@/repository/class-room";

interface ClassRoomObjectivesProps {
  data: NonNullable<GetClassRoomBySlugResponse["data"]>;
}

const CARD_BG = "rgba(59, 130, 246, 0.08)";
const ICON_BG = "rgba(59, 130, 246, 0.12)";
const CARD_RADIUS = 16;

const normalizeObjectives = (items: unknown): string[] => {
  if (!Array.isArray(items)) {
    return [];
  }

  return items.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
};

const ClassRoomObjectives = ({ data }: ClassRoomObjectivesProps) => {
  const objectivesRaw = getClassRoomMetaValue(data.class_room_metadata, "forWhom");
  const objectives = normalizeObjectives(objectivesRaw);

  return (
    <Stack spacing={2}>
      <Typography component="h1" variant="h3" className="leading-9 text-[24px] md:leading-11 md:text-[26px]">
        Mục tiêu của lớp học
      </Typography>

      {objectives.length === 0 ? (
        <Typography variant="body1" color="text.secondary">
          Chưa có mục tiêu cho lớp học này.
        </Typography>
      ) : (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, 1fr)",
              md: "repeat(4, 1fr)",
            },
            gap: 2,
          }}
        >
          {objectives.map((item, index) => (
            <Stack
              key={`${index}-${item}`}
              spacing={1.5}
              sx={{
                borderRadius: `${CARD_RADIUS}px`,
                bgcolor: CARD_BG,
                p: 2,
                height: "100%",
                boxShadow: "0px 10px 24px rgba(15, 23, 42, 0.06)",
              }}
            >
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 2,
                  bgcolor: ICON_BG,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <PersonOutline sx={{ fontSize: 22, color: "primary.main" }} />
              </Box>
              <Typography variant="body2" color="text.primary" sx={{ lineHeight: 1.6 }}>
                {item}
              </Typography>
            </Stack>
          ))}
        </Box>
      )}
    </Stack>
  );
};

export default ClassRoomObjectives;
