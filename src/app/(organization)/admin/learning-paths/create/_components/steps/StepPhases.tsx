"use client";

import { useState } from "react";
import { DndContext, DragEndEvent, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { arrayMove,SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import AddIcon from "@mui/icons-material/Add";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  FormControl,
  FormHelperText,
  FormLabel,
  IconButton,
  OutlinedInput,
  Stack,
  Typography,
} from "@mui/material";

import type { ClassRoom, Phase } from "@/modules/learning-paths/learning-path-form.schema";
import { useLearningPathFormContext } from "@/modules/learning-paths/use-learning-path-form-context";
import { useUserOrganization } from "@/modules/organization/store/UserOrganizationProvider";
import { ClassRoomItem,ClassRoomPickerDialog } from "@/shared/ui/ClassRoomPicker";

import SortablePhaseItem from "./SortablePhaseItem";

interface StepPhasesProps {
  onContinue: () => void;
  onBack: () => void;
}

export default function StepPhases({ onContinue, onBack }: StepPhasesProps) {
  const {
    control,
    trigger,
    setValue,
    watch,
    formState: { errors },
  } = useLearningPathFormContext();

  const { organization, ...rest } = useUserOrganization((state) => state.data);
  const isAdmin = rest.employeeType === "admin";
  const organizationId = isAdmin ? organization?.id : undefined;
  const employeeId = rest.employeeType === "teacher" ? rest.id : undefined;

  const [expandedPhases, setExpandedPhases] = useState<Record<string, boolean>>({});
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState<number | null>(null);

  const phases = watch("phases") || [];

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // 5px movement required before drag starts
      },
    })
  );

  const handleContinue = async () => {
    // Validate the phases before continuing
    const isValid = await trigger("phases");
    if (isValid) {
      onContinue();
    }
  };

  const handleAddPhase = () => {
    // Generate a unique ID for the new phase using timestamp + random string
    const uniqueId = `phase-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const newPhase: Phase = {
      id: uniqueId,
      order: phases.length + 1,
      description: "",
      class_rooms: [],
    };
    const newPhases = [...phases, newPhase];
    setValue("phases", newPhases, { shouldValidate: false });
    // Auto-expand the newly added phase using the unique ID
    setExpandedPhases((prev) => ({ ...prev, [uniqueId]: true }));
  };

  const handleTogglePhase = (phaseId: string, expanded: boolean) => {
    setExpandedPhases((prev) => ({ ...prev, [phaseId]: expanded }));
  };

  const handleRemovePhase = (index: number) => {
    const updatedPhases = phases.filter((_, i) => i !== index);
    // Reorder remaining phases
    const reorderedPhases = updatedPhases.map((phase, i) => ({
      ...phase,
      order: i + 1,
    }));
    setValue("phases", reorderedPhases, { shouldValidate: false });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = phases.findIndex((phase) => phase.id === active.id);
    const newIndex = phases.findIndex((phase) => phase.id === over.id);

    if (oldIndex !== -1 && newIndex !== -1) {
      const reorderedPhases = arrayMove(phases, oldIndex, newIndex);
      // Update order numbers
      const phasesWithUpdatedOrder = reorderedPhases.map((phase, i) => ({
        ...phase,
        order: i + 1,
      }));
      setValue("phases", phasesWithUpdatedOrder, { shouldValidate: false });
    }
  };

  const handleDescriptionChange = (index: number, value: string) => {
    const updatedPhases = [...phases];
    updatedPhases[index] = {
      ...updatedPhases[index],
      description: value,
    };
    setValue("phases", updatedPhases, { shouldValidate: false });
  };

  const handleOpenDialog = (index: number) => {
    setCurrentPhaseIndex(index);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setCurrentPhaseIndex(null);
  };

  const handleConfirmSelection = (selectedClassRooms: ClassRoomItem[]) => {
    if (currentPhaseIndex === null) return;

    const updatedPhases = [...phases];
    updatedPhases[currentPhaseIndex] = {
      ...updatedPhases[currentPhaseIndex],
      class_rooms: selectedClassRooms as ClassRoom[],
    };
    // Only validate if class-rooms are being added
    const shouldValidate = selectedClassRooms.length > 0;
    setValue("phases", updatedPhases, { shouldValidate });
  };

  const handleRemoveClassRoom = (phaseIndex: number, classRoomId: string) => {
    const updatedPhases = [...phases];
    updatedPhases[phaseIndex] = {
      ...updatedPhases[phaseIndex],
      class_rooms: updatedPhases[phaseIndex].class_rooms.filter((room) => room.id !== classRoomId),
    };
    setValue("phases", updatedPhases, { shouldValidate: false });
  };

  const getPhaseError = (index: number) => {
    if (errors.phases && Array.isArray(errors.phases)) {
      return errors.phases[index];
    }
    return undefined;
  };


  return (
    <Card sx={{ border: "1px solid", borderColor: "divider" }}>
      <CardContent sx={{ p: 4 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            Giai đoạn
          </Typography>
          <Button variant="fill" startIcon={<AddIcon />} onClick={handleAddPhase}>
            Thêm giai đoạn
          </Button>
        </Stack>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
          Thêm và quản lý các giai đoạn trong lộ trình học tập
        </Typography>

        <Stack spacing={3}>
          {/* Phase List */}
          {phases.length === 0 ? (
            <Box
              sx={{
                minHeight: 200,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: "grey.50",
                borderRadius: 2,
                border: "2px dashed",
                borderColor: "grey.300",
                p: 4,
              }}
            >
              <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                Chưa có giai đoạn nào
              </Typography>
              <Button variant="contained" startIcon={<AddIcon />} onClick={handleAddPhase}>
                Thêm giai đoạn đầu tiên
              </Button>
            </Box>
          ) : (
            <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
              <SortableContext items={phases.map((phase) => phase.id!)} strategy={verticalListSortingStrategy}>
                <Stack spacing={2}>
                  {phases.map((phase, index) => {
                    const phaseError = getPhaseError(index);
                    const classRoomsError = phaseError?.class_rooms;

                    return (
                      <SortablePhaseItem
                        key={phase.id}
                        id={phase.id!}
                        phaseNumber={index + 1}
                        classRoomCount={phase.class_rooms.length}
                        expanded={expandedPhases[phase.id!] || false}
                        hasError={!!classRoomsError}
                        onExpandChange={(expanded) => handleTogglePhase(phase.id!, expanded)}
                        onDelete={() => handleRemovePhase(index)}
                      >
                        <Stack spacing={3}>
                          {/* Description Field */}
                          <FormControl fullWidth>
                            <FormLabel>Mô tả giai đoạn</FormLabel>
                            <OutlinedInput
                              placeholder="Nhập mô tả cho giai đoạn này (tùy chọn)"
                              multiline
                              minRows={2}
                              maxRows={8}
                              value={phase.description || ""}
                              onChange={(e) => handleDescriptionChange(index, e.target.value)}
                              size="small"
                              sx={{
                                background: "white",
                                "&.MuiInputBase-multiline": {
                                  padding: 0,
                                },
                              }}
                            />
                          </FormControl>

                          {/* Class-room Selection */}
                          <FormControl fullWidth error={!!classRoomsError}>
                            <FormLabel>Lớp học</FormLabel>
                            <Box
                              sx={{
                                minHeight: 56,
                                p: 1.5,
                                border: "1px solid",
                                borderColor: classRoomsError ? "error.main" : "divider",
                                borderRadius: 1,
                                bgcolor: "white",
                                display: "flex",
                                flexWrap: "wrap",
                                gap: 1,
                                alignItems: "center",
                              }}
                            >
                              {phase.class_rooms.map((classRoom) => (
                                <Chip
                                  key={classRoom.id}
                                  label={classRoom.name}
                                  size="small"
                                  onDelete={() => handleRemoveClassRoom(index, classRoom.id)}
                                />
                              ))}
                              <Button
                                size="small"
                                variant="outlined"
                                startIcon={<AddIcon />}
                                onClick={() => handleOpenDialog(index)}
                              >
                                Thêm lớp
                              </Button>
                            </Box>
                            {classRoomsError?.message && (
                              <FormHelperText>{classRoomsError.message}</FormHelperText>
                            )}
                            {!classRoomsError && (
                              <FormHelperText>Đã chọn {phase.class_rooms.length} lớp học</FormHelperText>
                            )}
                          </FormControl>
                        </Stack>
                      </SortablePhaseItem>
                    );
                  })}
                </Stack>
              </SortableContext>
            </DndContext>
          )}

          {/* Global error for phases array */}
          {errors.phases && typeof errors.phases.message === "string" && (
            <Typography variant="caption" color="error">
              {errors.phases.message}
            </Typography>
          )}
        </Stack>

        <Stack direction="row" spacing={2} sx={{ mt: 4, justifyContent: "space-between" }}>
          <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={onBack}>
            Quay lại
          </Button>
          <Button variant="contained" endIcon={<ArrowForwardIcon />} onClick={handleContinue}>
            Tiếp tục
          </Button>
        </Stack>
      </CardContent>

      {/* Class-Room Picker Dialog */}
      {currentPhaseIndex !== null && (
        <ClassRoomPickerDialog
          open={dialogOpen}
          onClose={handleCloseDialog}
          onConfirm={handleConfirmSelection}
          initialSelected={phases[currentPhaseIndex]?.class_rooms || []}
          organizationId={organizationId}
          employeeId={employeeId}
          title="Chọn lớp học cho giai đoạn"
          multiple={true}
        />
      )}
    </Card>
  );
}

