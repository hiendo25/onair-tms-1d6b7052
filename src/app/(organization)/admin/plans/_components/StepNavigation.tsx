"use client";

import { Box, Card, CardContent, Stack, Typography } from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import CheckIcon from "@mui/icons-material/Check";

export interface Step {
  id: number;
  label: string;
  description: string;
}

interface StepNavigationProps {
  steps: Step[];
  currentStep: number;
  completedSteps: number[];
  onStepClick: (stepId: number) => void;
  isStepAccessible: (stepId: number) => boolean;
}

export default function StepNavigation({
  steps,
  currentStep,
  completedSteps,
  onStepClick,
  isStepAccessible,
}: StepNavigationProps) {
  return (
    <Box sx={{ width: 350, flexShrink: 0 }}>
      <Card>
        <CardContent>
          <Stack spacing={2}>
            {steps.map((step) => {
              const accessible = isStepAccessible(step.id);
              const isCompleted = completedSteps.includes(step.id);
              const isCurrent = currentStep === step.id;

              return (
                <Box
                  key={step.id}
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    border: "1px solid",
                    borderColor: isCurrent ? "primary.main" : "grey.300",
                    bgcolor: isCurrent ? "primary.50" : "transparent",
                    cursor: accessible ? "pointer" : "not-allowed",
                    opacity: accessible ? 1 : 0.5,
                  }}
                  onClick={() => onStepClick(step.id)}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Box
                      sx={{
                        width: 32,
                        height: 32,
                        borderRadius: "50%",
                        bgcolor: isCompleted && !isCurrent
                          ? "success.main"
                          : isCurrent
                          ? "primary.main"
                          : accessible
                          ? "grey.300"
                          : "grey.200",
                        color: "white",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: 600,
                        fontSize: "0.875rem",
                      }}
                    >
                      {!accessible ? (
                        <LockOutlinedIcon sx={{ fontSize: "1.125rem", color: "grey.600" }} />
                      ) : isCompleted && !isCurrent ? (
                        <CheckIcon sx={{ fontSize: "1.125rem" }} />
                      ) : (
                        step.id
                      )}
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography sx={{ fontWeight: 600, fontSize: "0.875rem" }}>
                        {step.label}
                      </Typography>
                      <Typography sx={{ fontSize: "0.75rem", color: "text.secondary" }}>
                        {step.description}
                      </Typography>
                    </Box>
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

