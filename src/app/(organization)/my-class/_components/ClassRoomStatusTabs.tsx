"use client";
import { Tabs, Tab, Stack, Box } from "@mui/material";
import { CLASSROOM_RUNTIME_STATUS_LABEL, STATUS_ORDER } from "../../admin/class-room/list/utils/status";
import { ClassRoomRuntimeStatusFilter } from "../../admin/class-room/list/types/types";
import { ClassRoomStatusCountDto } from "@/types/dto/classRooms/classRoom.dto";

interface ClassRoomStatusTabsProps {
  value: ClassRoomRuntimeStatusFilter;
  counts?: ClassRoomStatusCountDto[];
  onChange: (status: ClassRoomRuntimeStatusFilter) => void;
}
const STATUS_LABEL_OVERRIDE: Partial<Record<ClassRoomRuntimeStatusFilter, string>> = {
  [ClassRoomRuntimeStatusFilter.Past]: "Đã kết thúc",
};

const RUNTIME_STATUS_PRESENTATION: Record<
  ClassRoomRuntimeStatusFilter,
  {
    chipBg: string;
    chipColor: string;
    activeChipBg?: string;
    activeChipColor?: string;
  }
> = {
  [ClassRoomRuntimeStatusFilter.All]: {
    chipBg: "#F4F6F8",
    chipColor: "#1D2433",
    activeChipBg: "#1D2433",
    activeChipColor: "#FFFFFF",
  },
  [ClassRoomRuntimeStatusFilter.Ongoing]: {
    chipBg: "#FFECE8",
    chipColor: "#E64A19",
    activeChipBg: "#B71D18",
    activeChipColor: "#FFFFFF",
  },
  [ClassRoomRuntimeStatusFilter.Today]: {
    chipBg: "#FFF3D6",
    chipColor: "#C26D00",
    activeChipBg: "#B76E00",
    activeChipColor: "#FFFFFF",
  },
  [ClassRoomRuntimeStatusFilter.Upcoming]: {
    chipBg: "#E9F7EE",
    chipColor: "#198754",
    activeChipBg: "#118D57",
    activeChipColor: "#FFFFFF",
  },
  [ClassRoomRuntimeStatusFilter.Past]: {
    chipBg: "#ECEFF4",
    chipColor: "#637381",
    activeChipBg: "#637381",
    activeChipColor: "#FFFFFF",
  },
  [ClassRoomRuntimeStatusFilter.Draft]: {
    chipBg: "#EBE4FF",
    chipColor: "#5E35B1",
    activeChipBg: "#B71D18",
    activeChipColor: "#FFFFFF",
  },
};

const VISIBLE_STATUS: ClassRoomRuntimeStatusFilter[] = STATUS_ORDER.filter(
  (status) => status !== ClassRoomRuntimeStatusFilter.Draft,
);

export default function ClassRoomStatusTabs({
  value,
  counts,
  onChange,
}: ClassRoomStatusTabsProps) {

  const getCount = (status: string) => {
    const matched = counts?.find((c) =>
      c.runtime_status === status ||
      (c.runtime_status === null && status === "all")
    );
    return matched?.total ?? 0;
  };

  return (
    <Tabs
      value={value}
      onChange={(_, newValue) => onChange(newValue as ClassRoomRuntimeStatusFilter)}
      variant="scrollable"
      scrollButtons="auto"
      allowScrollButtonsMobile
      className="border-0"
      slotProps={{
        indicator: {
          sx: {
            backgroundColor: "#1D2433",
            height: 2,
            borderRadius: 99,
          },
        }
      }}
      sx={{
        "& .MuiTabs-flexContainer": {
          gap: 3,
        },
      }}
    >
      {
        VISIBLE_STATUS.map((status) => {
          const count = getCount(status);
          const isActive = value === status;
          const presentation = RUNTIME_STATUS_PRESENTATION[status];
          const chipBg = isActive && presentation.activeChipBg
            ? presentation.activeChipBg
            : presentation.chipBg;
          const chipColor = isActive && presentation.activeChipColor
            ? presentation.activeChipColor
            : presentation.chipColor;

          return (
            <Tab
              key={status}
              value={status}
              disableRipple
              sx={{
                minWidth: "auto",
                padding: 0,
                paddingBottom: 1,
                textTransform: "none",
                alignItems: "flex-start",
                fontSize: 14,
                fontWeight: 500,
                color: "#637381",
                opacity: 1,
                "&.Mui-selected": {
                  color: "#1D2433",
                  fontWeight: 600,
                },
              }}
              label={
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <Box component="span">
                    {STATUS_LABEL_OVERRIDE[status] ?? CLASSROOM_RUNTIME_STATUS_LABEL[status]}
                  </Box>
                  <Box
                    component="span"
                    sx={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      minWidth: 32,
                      padding: "4px 10px",
                      borderRadius: "8px",
                      backgroundColor: chipBg,
                      color: chipColor,
                      fontSize: 13,
                      fontWeight: 600,
                      lineHeight: "20px",
                    }}
                  >
                    {count}
                  </Box>
                </Stack>
              }
            />
          );
        })
      }
    </Tabs>
  );
}
