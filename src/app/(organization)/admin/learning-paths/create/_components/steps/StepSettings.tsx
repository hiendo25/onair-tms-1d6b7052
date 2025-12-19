"use client";

import {
  Box,
  Card,
  CardContent,
  FormControl,
  FormControlLabel,
  FormLabel,
  OutlinedInput,
  Radio,
  RadioGroup,
  Stack,
  Switch,
  Typography,
} from "@mui/material";
import { Controller } from "react-hook-form";

import { useLearningPathFormContext } from "@/modules/learning-paths/use-learning-path-form-context";

interface StepSettingsProps {
  onSubmit: () => void;
  isLoading?: boolean;
}

export default function StepSettings({ onSubmit, isLoading = false }: StepSettingsProps) {
  const { control, watch } = useLearningPathFormContext();

  const deadlineType = watch("settings.deadlineType");

  return (
    <Card sx={{ border: "1px solid", borderColor: "divider" }}>
      <CardContent sx={{ p: 4 }}>
        <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
          Thiết lập
        </Typography>

        <Stack spacing={3}>
          {/* Sequential Learning Toggle */}
          <Box
            sx={{
              p: 2.5,
              bgcolor: "grey.50",
              borderRadius: 2,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Box>
              <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 0.5 }}>
                Học tuần tự theo thời gian
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Học viên phải hoàn thành giai đoạn trước mới được học giai đoạn sau
              </Typography>
            </Box>
            <Controller
              name="settings.sequentialLearning"
              control={control}
              defaultValue={false}
              render={({ field }) => (
                <Switch
                  checked={field.value ?? false}
                  onChange={(e) => field.onChange(e.target.checked)}
                  color="primary"
                />
              )}
            />
          </Box>

          {/* Completion Criteria */}
          <Box
            sx={{
              p: 2.5,
              bgcolor: "grey.50",
              borderRadius: 2,
            }}
          >
            <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
              Tiêu chí hoàn thành
            </Typography>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Typography variant="body2">Hoàn thành tối thiểu</Typography>
              <Controller
                name="settings.completionCriteria"
                control={control}
                defaultValue={80}
                render={({ field }) => (
                  <OutlinedInput
                    {...field}
                    value={field.value ?? 80}
                    onChange={(e) => field.onChange(e.target.value === "" ? "" : Number(e.target.value))}
                    type="number"
                    size="small"
                    inputProps={{
                      min: 0,
                      max: 100,
                    }}
                    sx={{
                      width: 80,
                      bgcolor: "white",
                      "& input": {
                        textAlign: "center",
                      },
                    }}
                  />
                )}
              />
              <Typography variant="body2">% trong lộ trình</Typography>
            </Stack>
          </Box>

          {/* Completion Deadline */}
          <Box
            sx={{
              p: 2.5,
              bgcolor: "grey.50",
              borderRadius: 2,
            }}
          >
            <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
              Thời hạn hoàn thành
            </Typography>
            <Controller
              name="settings.deadlineType"
              control={control}
              defaultValue="none"
              render={({ field }) => (
                <RadioGroup {...field} value={field.value || "none"}>
                  <FormControlLabel
                    value="none"
                    control={<Radio />}
                    label="Không giới hạn thời gian"
                  />
                  <FormControlLabel
                    value="hours"
                    control={<Radio />}
                    label={
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1.5,
                        }}
                        onClick={(e) => {
                          // Prevent radio toggle when clicking on input
                          if ((e.target as HTMLElement).tagName === 'INPUT' &&
                              (e.target as HTMLInputElement).type === 'number') {
                            e.stopPropagation();
                          }
                        }}
                      >
                        <Typography component="span">Hoàn thành trong</Typography>
                        <Controller
                          name="settings.deadlineHours"
                          control={control}
                          defaultValue={48}
                          render={({ field: hoursField }) => (
                            <OutlinedInput
                              {...hoursField}
                              value={hoursField.value ?? ""}
                              onChange={(e) => hoursField.onChange(e.target.value === "" ? "" : Number(e.target.value))}
                              type="number"
                              size="small"
                              disabled={deadlineType === "none"}
                              inputProps={{
                                min: 1,
                              }}
                              onClick={(e) => e.stopPropagation()}
                              sx={{
                                width: 80,
                                bgcolor: deadlineType === "none" ? "grey.200" : "white",
                                "& input": {
                                  textAlign: "center",
                                },
                              }}
                            />
                          )}
                        />
                        <Typography component="span">ngày</Typography>
                      </Box>
                    }
                  />
                </RadioGroup>
              )}
            />
          </Box>

          {/* Allow Retake Toggle */}
          <Box
            sx={{
              p: 2.5,
              bgcolor: "grey.50",
              borderRadius: 2,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Box>
              <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 0.5 }}>
                Cho phép học lại lộ trình
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Học viên có thể học lại lộ trình sau khi đã hoàn thành
              </Typography>
            </Box>
            <Controller
              name="settings.allowRetake"
              control={control}
              defaultValue={false}
              render={({ field }) => (
                <Switch
                  checked={field.value ?? false}
                  onChange={(e) => field.onChange(e.target.checked)}
                  color="primary"
                />
              )}
            />
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

