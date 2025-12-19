"use client";

import { useEffect, useMemo, useState } from "react";
import SearchIcon from "@mui/icons-material/Search";
import {
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  InputAdornment,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Radio,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import { useClassRoomsForSelection } from "@/modules/class-room-management/operations/use-class-rooms-for-selection";
import { ClassSessionModeFilter } from "@/repository/class-room";
import { Database } from "@/types/supabase.types";

import { ClassRoomItem, ClassRoomPickerDialogProps } from "./types";

// Helper functions for chip labels and colors
const getSessionTypeLabel = (sessionType?: Database["public"]["Enums"]["class_session_type"]) => {
  switch (sessionType) {
    case "online":
      return "Online";
    case "offline":
      return "Offline";
    case "live":
      return "Live";
    default:
      return null;
  }
};

const getSessionTypeColor = (sessionType?: Database["public"]["Enums"]["class_session_type"]): "primary" | "success" | "info" | "secondary" | "default" => {
  switch (sessionType) {
    case "online":
      return "info";
    case "offline":
      return "secondary";
    case "live":
      return "success";
    default:
      return "default";
  }
};

const getRoomTypeLabel = (roomType?: string) => {
  switch (roomType) {
    case "single":
      return "Đơn";
    case "multiple":
      return "Chuỗi";
    default:
      return null;
  }
};

export default function ClassRoomPickerDialog({
                                                open,
                                                onClose,
                                                onConfirm,
                                                initialSelected = [],
                                                organizationId,
                                                employeeId,
                                                title = "Chọn lớp học",
                                                multiple = true,
                                              }: ClassRoomPickerDialogProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClassRooms, setSelectedClassRooms] = useState<ClassRoomItem[]>(initialSelected);

  const { classRooms, isLoading } = useClassRoomsForSelection({
    organizationId,
    employeeId,
    search: searchTerm,
    sessionMode: ClassSessionModeFilter.Online,
  });

  // Update selected class-rooms when initialSelected changes
  useEffect(() => {
    if (open) {
      setSelectedClassRooms(initialSelected);
    }
  }, [open, initialSelected]);

  const handleToggle = (classRoom: ClassRoomItem) => {
    if (multiple) {
      const isSelected = selectedClassRooms.some((item) => item.id === classRoom.id);
      if (isSelected) {
        setSelectedClassRooms(selectedClassRooms.filter((item) => item.id !== classRoom.id));
      } else {
        setSelectedClassRooms([...selectedClassRooms, classRoom]);
      }
    } else {
      // Single selection
      setSelectedClassRooms([classRoom]);
    }
  };

  const isSelected = (classRoomId: string) => {
    return selectedClassRooms.some((item) => item.id === classRoomId);
  };

  const handleConfirm = () => {
    onConfirm(selectedClassRooms);
    onClose();
  };

  const handleCancel = () => {
    setSelectedClassRooms(initialSelected);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleCancel} maxWidth="sm" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        {/* Search Input */}
        <TextField
          fullWidth
          placeholder="Tìm kiếm lớp học"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          size="small"
          sx={{ mb: 2 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />

        {/* Class-room List */}
        {isLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress />
          </Box>
        ) : classRooms.length === 0 ? (
          <Box sx={{ py: 4, textAlign: "center" }}>
            <Typography variant="body2" color="text.secondary">
              {searchTerm ? "Không tìm thấy lớp học phù hợp" : "Không có lớp học nào"}
            </Typography>
          </Box>
        ) : (
          <List sx={{
            p: 0,
            maxHeight: 400,
            overflow: "auto",
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 1,
          }}>
            {classRooms.map((classRoom) => {
              const selected = isSelected(classRoom.id);
              const sessionTypeLabel = getSessionTypeLabel(classRoom.session_type);
              const sessionTypeColor = getSessionTypeColor(classRoom.session_type);
              const roomTypeLabel = getRoomTypeLabel(classRoom.room_type);

              return (
                <ListItem key={classRoom.id} disablePadding>
                  <ListItemButton onClick={() => handleToggle(classRoom)} dense>
                    {multiple ? (
                      <Box>
                        <Checkbox
                          sx={{
                            borderRadius: 0,
                            border: "darkgrey !important",
                            p: 0,
                          }}
                          checked={selected}
                          tabIndex={-1}
                          disableRipple
                          edge="start"
                        />
                      </Box>
                    ) : (
                      <Radio edge="start" checked={selected} tabIndex={-1} />
                    )}
                    <ListItemText
                      primary={
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, flexWrap: "wrap" }}>
                          {sessionTypeLabel && (
                            <Chip
                              label={`${sessionTypeLabel} - ${roomTypeLabel}`}
                              color={sessionTypeColor}
                              size="small"
                              sx={{
                                borderRadius: "6px",
                              }}
                            />
                          )}
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {classRoom.name}
                          </Typography>
                        </Box>
                      }
                      secondary={
                        <Stack sx={{
                          mt: 0.5,
                        }} direction="row" spacing={1}>
                          <Chip
                            label={`${classRoom.courses_count} môn học`}
                            color="default"
                            size="small"
                            sx={{
                              borderRadius: "6px",
                            }}
                          />

                          {classRoom.room_type === "multiple" && (
                            <Chip
                              label={`${classRoom.sessions_count} buổi học`}
                              color="default"
                              size="small"
                              sx={{
                                borderRadius: "6px",
                              }}
                            />
                          )}
                        </Stack>
                      }
                    />
                  </ListItemButton>
                </ListItem>
              );
            })}
          </List>
        )}
      </DialogContent>
      <DialogActions>
        <Button color="inherit" variant="outlined" onClick={handleCancel}>Hủy</Button>
        <Button onClick={handleConfirm} variant="contained">
          Xác nhận ({selectedClassRooms.length})
        </Button>
      </DialogActions>
    </Dialog>
  );
}

