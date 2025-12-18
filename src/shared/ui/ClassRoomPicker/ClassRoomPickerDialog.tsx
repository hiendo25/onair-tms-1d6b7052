"use client";

import { useEffect, useMemo, useState } from "react";
import SearchIcon from "@mui/icons-material/Search";
import {
  Box,
  Button,
  Checkbox,
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
  TextField,
  Typography,
} from "@mui/material";

import { useClassRoomsForSelection } from "@/modules/class-room-management/operations/use-class-rooms-for-selection";

import { ClassRoomItem, ClassRoomPickerDialogProps } from "./types";
import { ClassSessionModeFilter } from "@/repository/class-room";

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

  // Filter class-rooms based on search term (client-side additional filtering)
  const filteredClassRooms = useMemo(() => {
    if (!searchTerm) return classRooms;
    const lowerSearch = searchTerm.toLowerCase();
    return classRooms.filter(
      (room) =>
        room.name.toLowerCase().includes(lowerSearch) ||
        room.code?.toLowerCase().includes(lowerSearch),
    );
  }, [classRooms, searchTerm]);

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
        ) : filteredClassRooms.length === 0 ? (
          <Box sx={{ py: 4, textAlign: "center" }}>
            <Typography variant="body2" color="text.secondary">
              {searchTerm ? "Không tìm thấy lớp học phù hợp" : "Không có lớp học nào"}
            </Typography>
          </Box>
        ) : (
          <List sx={{ p: 0, maxHeight: 400, overflow: "auto" }}>
            {filteredClassRooms.map((classRoom) => {
              const selected = isSelected(classRoom.id);
              return (
                <ListItem key={classRoom.id} disablePadding>
                  <ListItemButton onClick={() => handleToggle(classRoom)} dense>
                    {multiple ? (
                      <Checkbox sx={{
                        borderRadius: 0.5,
                      }} edge="start" checked={selected} tabIndex={-1} disableRipple />
                    ) : (
                      <Radio edge="start" checked={selected} tabIndex={-1} />
                    )}
                    <ListItemText
                      primary={classRoom.name}
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

