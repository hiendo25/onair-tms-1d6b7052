"use client";

import { useState } from "react";
import { DndContext, DragEndEvent, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { arrayMove,SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import AddIcon from "@mui/icons-material/Add";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  Autocomplete,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  FormControl,
  FormLabel,
  IconButton,
  OutlinedInput,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import type { ClassRoom, Phase } from "@/modules/learning-paths/learning-path-form.schema";
import { useClassRoomsForSelection } from "@/modules/learning-paths/operations/use-class-rooms-for-selection";
import { useLearningPathFormContext } from "@/modules/learning-paths/use-learning-path-form-context";
import { useUserOrganization } from "@/modules/organization/store/UserOrganizationProvider";

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

  const { data: orgData } = useUserOrganization((state) => state);
  const organizationId = orgData?.organizationId || "";

  const [searchTerm, setSearchTerm] = useState("");
  const [expandedPhases, setExpandedPhases] = useState<Record<number, boolean>>({});

  const { classRooms, isLoading: isLoadingClassRooms } = useClassRoomsForSelection({
    organizationId,
    search: searchTerm,
  });

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
    const newPhase: Phase = {
      order: phases.length + 1,
      description: "",
      class_rooms: [],
    };
    const newPhases = [...phases, newPhase];
    setValue("phases", newPhases, { shouldValidate: false });
    // Auto-expand the newly added phase
    setExpandedPhases((prev) => ({ ...prev, [newPhases.length - 1]: true }));
  };

  const handleTogglePhase = (index: number, expanded: boolean) => {
    setExpandedPhases((prev) => ({ ...prev, [index]: expanded }));
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

    const oldIndex = phases.findIndex((_, i) => `phase-${i}` === active.id);
    const newIndex = phases.findIndex((_, i) => `phase-${i}` === over.id);

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

  const handleClassRoomsChange = (index: number, newValue: ClassRoom[]) => {
    const updatedPhases = [...phases];
    updatedPhases[index] = {
      ...updatedPhases[index],
      class_rooms: newValue,
    };
    // Only validate if class-rooms are being added (not removed or cleared)
    const shouldValidate = newValue.length > 0;
    setValue("phases", updatedPhases, { shouldValidate });
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
              <SortableContext items={phases.map((_, i) => `phase-${i}`)} strategy={verticalListSortingStrategy}>
                <Stack spacing={2}>
                  {phases.map((phase, index) => {
                    const phaseError = getPhaseError(index);
                    const classRoomsError = phaseError?.class_rooms;

                    return (
                      <SortablePhaseItem
                        key={`phase-${index}`}
                        id={`phase-${index}`}
                        phaseNumber={index + 1}
                        classRoomCount={phase.class_rooms.length}
                        expanded={expandedPhases[index] || false}
                        hasError={!!classRoomsError}
                        onExpandChange={(expanded) => handleTogglePhase(index, expanded)}
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
                          <Autocomplete
                            multiple
                            options={classRooms}
                            value={phase.class_rooms}
                            onChange={(_, newValue) => handleClassRoomsChange(index, newValue)}
                            getOptionLabel={(option) => option.name}
                            isOptionEqualToValue={(option, value) => option.id === value.id}
                            loading={isLoadingClassRooms}
                            onInputChange={(_, value) => setSearchTerm(value)}
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                label="Chọn lớp học"
                                placeholder="Tìm kiếm lớp học..."
                                error={!!classRoomsError}
                                helperText={
                                  classRoomsError?.message || `Đã chọn ${phase.class_rooms.length} lớp học`
                                }
                              />
                            )}
                            renderTags={(value, getTagProps) =>
                              value.map((option, tagIndex) => (
                                <Chip
                                  {...getTagProps({ index: tagIndex })}
                                  key={option.id}
                                  label={option.name}
                                  size="small"
                                />
                              ))
                            }
                            renderOption={(props, option) => (
                              <li {...props} key={option.id}>
                                <Box>
                                  <Typography variant="body2">{option.name}</Typography>
                                  {option.code && (
                                    <Typography variant="caption" color="text.secondary">
                                      {option.code}
                                    </Typography>
                                  )}
                                </Box>
                              </li>
                            )}
                          />
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
    </Card>
  );
}

