"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  IconButton,
  Radio,
  RadioGroup,
  Stack,
  TextField,
  Typography,
  Autocomplete,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import TaskAltIcon from "@mui/icons-material/TaskAlt";
import dayjs from "dayjs";
import { Controller, UseFormReturn, useWatch } from "react-hook-form";
import CustomDateTimePickerField from "@/shared/ui/form/CustomDateTimePickerField";
import { PlanSurveyTarget, Survey, SurveyFormValues } from "@/modules/plans/plan-form.schema";
import { fDateTime, FORMAT_DATE_TIME_CLEANER } from "@/lib";
import { UnitOption } from "./PlanSurveySection";

interface SurveyConfigDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: () => void;
  form: UseFormReturn<SurveyFormValues, any, Survey>;
  surveyTitle?: string;
  surveyCreatedAt?: string | null;
  targetOptions: { value: PlanSurveyTarget; label: string }[];
  unitOptions: UnitOption[];
  unitSearch: string;
  onUnitSearchChange: (value: string) => void;
  unitLoading?: boolean;
  isSaving?: boolean;
}

const toDayjs = (value?: string | null) => {
  if (!value) return null;
  const parsed = dayjs(value);
  return parsed.isValid() ? parsed : null;
};

const toIsoString = (value: any) => {
  if (!value) return null;
  return dayjs(value).isValid() ? dayjs(value).toISOString() : null;
};

export function SurveyConfigDialog({
  open,
  onClose,
  onSave,
  form,
  surveyTitle,
  surveyCreatedAt,
  targetOptions,
  unitOptions,
  unitSearch,
  onUnitSearchChange,
  unitLoading = false,
  isSaving = false,
}: SurveyConfigDialogProps) {
  const targetType = form.watch("targetType");
  const selectedUnitIds = useWatch({ control: form.control, name: "targetUnitIds" }) ?? [];
  const [cachedUnitOptions, setCachedUnitOptions] = useState<UnitOption[]>([]);
  const previousTargetTypeRef = useRef<PlanSurveyTarget>(null);

  useEffect(() => {
    // Reset cache when switching between branch/department to avoid mixing data.
    if (previousTargetTypeRef.current && previousTargetTypeRef.current !== targetType) {
      setCachedUnitOptions([]);
      onUnitSearchChange("");
      form.setValue("targetUnitIds", []);
    }
    previousTargetTypeRef.current = targetType!;
  }, [form, targetType, onUnitSearchChange]);

  useEffect(() => {
    setCachedUnitOptions((prev) => {
      const map = new Map<string, UnitOption>();
      selectedUnitIds.forEach((id) => {
        const fromNew = unitOptions.find((item) => item.id === id);
        const fromPrev = prev.find((item) => item.id === id);
        const fallbackType = targetType === "branch" || targetType === "department" ? targetType : undefined;
        map.set(id, fromNew || fromPrev || { id, name: id, type: fallbackType });
      });
      unitOptions.forEach((item) => map.set(item.id, item));
      return Array.from(map.values());
    });
  }, [selectedUnitIds, targetType, unitOptions]);

  const resolvedUnitOptions = useMemo(() => cachedUnitOptions, [cachedUnitOptions]);

  const shouldShowUnits = targetType === "branch" || targetType === "department";

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", pb: 1 }}>
        <Stack direction="row" spacing={1} alignItems="center">
          <TaskAltIcon color="primary" />
          <Typography variant="h6">Cấu hình khảo sát</Typography>
        </Stack>
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        {surveyTitle && (
          <Box
            sx={{
              p: 1.5,
              borderRadius: 2,
              bgcolor: "grey.50",
              border: "1px solid",
              borderColor: "divider",
              mb: 2,
            }}
          >
            <Typography variant="subtitle1" sx={{ fontWeight: 700, display: "flex", alignItems: "center", gap: 1 }}>
              <TaskAltIcon fontSize="small" color="success" />
              {surveyTitle}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Tạo ngày: {fDateTime(surveyCreatedAt, FORMAT_DATE_TIME_CLEANER)}
            </Typography>
          </Box>
        )}

        <Box sx={{ mb: 2 }}>
          <Typography sx={{ fontWeight: 600, mb: 1 }}>Đối tượng khảo sát</Typography>
          <Controller
            control={form.control}
            name="targetType"
            render={({ field }) => (
              <RadioGroup {...field}>
                {targetOptions.map((opt) => (
                  <FormControlLabel
                    key={opt.value}
                    value={opt.value}
                    control={<Radio color="primary" />}
                    label={opt.label}
                  />
                ))}
              </RadioGroup>
            )}
          />
        </Box>

        {shouldShowUnits && (
          <Controller
            control={form.control}
            name="targetUnitIds"
            render={({ field, fieldState }) => (
              <Autocomplete
                key={targetType}
                multiple
                options={resolvedUnitOptions}
                getOptionLabel={(opt) => opt.name}
                value={resolvedUnitOptions.filter((opt) => field.value?.includes(opt.id))}
                onChange={(_e, newValue) => field.onChange(newValue.map((item) => item.id))}
                inputValue={unitSearch}
                onInputChange={(_e, newValue, reason) => {
                  if (reason === "input") onUnitSearchChange(newValue);
                  if (reason === "clear") onUnitSearchChange("");
                }}
                filterOptions={(options) => options}
                loading={unitLoading}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label={targetType === "branch" ? "Chi nhánh" : "Phòng ban"}
                    placeholder={`Chọn ${targetType === "branch" ? "chi nhánh" : "phòng ban"}`}
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                    slotProps={{
                      input: {
                        ...params.InputProps,
                        endAdornment: (
                          <>
                            {unitLoading ? <CircularProgress color="inherit" size={16} /> : null}
                            {params.InputProps.endAdornment}
                          </>
                        ),
                      }
                    }}
                  />
                )}
                sx={{ mb: 2 }}
              />
            )}
          />
        )}

        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
          <Controller
            control={form.control}
            name="startDate"
            render={({ field, fieldState }) => (
              <CustomDateTimePickerField
                label="Ngày bắt đầu"
                value={toDayjs(field.value)}
                onChange={(value) => field.onChange(toIsoString(value))}
                ampm={false}
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
                required
              />
            )}
          />
          <Controller
            control={form.control}
            name="endDate"
            render={({ field, fieldState }) => (
              <CustomDateTimePickerField
                label="Ngày kết thúc"
                value={toDayjs(field.value)}
                onChange={(value) => field.onChange(toIsoString(value))}
                ampm={false}
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
                required
              />
            )}
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button variant="outlined" onClick={onClose}>
          Quay lại
        </Button>
        <Button variant="contained" onClick={onSave} disabled={isSaving}>
          {isSaving ? "Đang lưu..." : "Lưu"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
