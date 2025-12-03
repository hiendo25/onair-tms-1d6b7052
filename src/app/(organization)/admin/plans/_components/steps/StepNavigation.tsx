"use client";

import { Box, Card, CardContent, Chip, LinearProgress, Stack, Typography } from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import CheckIcon from "@mui/icons-material/Check";
import RadioButtonCheckedIcon from "@mui/icons-material/RadioButtonChecked";
import { PlanStepId } from "@/modules/plans/plan-step.utils";

export interface Step {
  id: PlanStepId;
  label: string;
  description: string;
}

interface StepNavigationProps {
  steps: Step[];
  currentStep: PlanStepId;
  completedSteps: PlanStepId[];
  onStepClick: (stepId: PlanStepId) => void;
  isStepAccessible: (stepId: PlanStepId) => boolean;
}

export default function StepNavigation({
  steps,
  currentStep,
  completedSteps,
  onStepClick,
  isStepAccessible,
}: StepNavigationProps) {
  const totalSteps = steps.length;
  const progress = Math.min(
    (completedSteps.length / totalSteps) * 100,
    100,
  );

  return (
    <Box sx={{ width: { xs: "100%", md: 360 }, flexShrink: 0, position: { md: "sticky" }, top: { md: 88 } }}>
      <Card sx={{ bgcolor: "grey.50", border: "1px solid", borderColor: "divider", boxShadow: "0 10px 40px rgba(0,0,0,0.05)" }}>
        <CardContent sx={{ pt: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
            <Box>
              <Typography variant="subtitle2" sx={{ color: "text.secondary", fontWeight: 600 }}>
                Hành trình kế hoạch
              </Typography>
              <Typography variant="body2" sx={{ color: "text.disabled" }}>
                Bước {currentStep} / {totalSteps}
              </Typography>
            </Box>
            <Chip
              label={`${Math.round(progress)}%`}
              color="primary"
              size="small"
              sx={{ fontWeight: 600 }}
            />
          </Box>

          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{
              height: 8,
              borderRadius: 999,
              mb: 3,
              bgcolor: "grey.200",
              "& .MuiLinearProgress-bar": { borderRadius: 999 },
            }}
          />

          <Stack spacing={1.5}>
            {steps.map((step, index) => {
              const accessible = isStepAccessible(step.id);
              const isCompleted = completedSteps.includes(step.id);
              const isCurrent = currentStep === step.id;
              const indicatorColor = !accessible
                ? "grey.300"
                : isCompleted
                ? "success.main"
                : isCurrent
                ? "primary.main"
                : "grey.400";

              return (
                <Box
                  key={step.id}
                  sx={{
                    display: "flex",
                    gap: 2,
                    cursor: accessible ? "pointer" : "not-allowed",
                    opacity: accessible ? 1 : 0.5,
                    p: 1.25,
                    borderRadius: 2,
                    bgcolor: isCurrent ? "primary.50" : "common.white",
                    border: "1px solid",
                    borderColor: isCurrent ? "primary.200" : "divider",
                    transition: "all 0.2s ease",
                    boxShadow: isCurrent ? "0 6px 16px rgba(0,0,0,0.06)" : "none",
                    "&:hover": accessible
                      ? {
                          borderColor: "primary.main",
                          boxShadow: "0 6px 16px rgba(0,0,0,0.06)",
                        }
                      : {},
                  }}
                  onClick={() => {
                    if (!accessible) return;
                    onStepClick(step.id);
                  }}
                >
                  <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1, pt: 0.5 }}>
                    <Box
                      sx={{
                        width: 38,
                        height: 38,
                        borderRadius: "50%",
                        bgcolor: indicatorColor,
                        color: "white",
                        display: "grid",
                        placeItems: "center",
                        fontWeight: 700,
                        boxShadow: "0 8px 18px rgba(0,0,0,0.08)",
                      }}
                    >
                      {!accessible ? (
                        <LockOutlinedIcon sx={{ fontSize: "1rem" }} />
                      ) : isCompleted ? (
                        <CheckIcon sx={{ fontSize: "1rem" }} />
                      ) : isCurrent ? (
                        <RadioButtonCheckedIcon sx={{ fontSize: "1rem" }} />
                      ) : (
                        step.id
                      )}
                    </Box>
                    {index < steps.length - 1 && (
                      <Box
                        sx={{
                          width: 2,
                          flex: 1,
                          bgcolor: isCompleted ? "primary.main" : "grey.200",
                          borderRadius: 1,
                        }}
                      />
                    )}
                  </Box>

                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                      <Typography sx={{ fontWeight: 700, fontSize: "0.95rem", color: "text.primary" }}>
                        {step.label}
                      </Typography>
                      {isCompleted && (
                        <Chip
                          size="small"
                          label="Đã hoàn thành"
                          color="success"
                          sx={{ height: 22, fontSize: "0.75rem" }}
                        />
                      )}
                      {isCurrent && !isCompleted && (
                        <Chip
                          size="small"
                          label="Đang thực hiện"
                          color="primary"
                          variant="outlined"
                          sx={{ height: 22, fontSize: "0.75rem" }}
                        />
                      )}
                    </Box>
                    <Typography sx={{ fontSize: "0.85rem", color: "text.secondary", lineHeight: 1.5 }}>
                      {step.description}
                    </Typography>
                  </Box>
                </Box>
              );
            })}
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
