"use client";

import React, { useEffect, useState } from "react";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import SaveIcon from "@mui/icons-material/Save";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  FormControlLabel,
  InputAdornment,
  Snackbar,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";

import { TARGET_TRIGGER_TYPES, type TargetTriggerType } from "@/constants/gamification-rules.constant";
import type { GamificationRuleWithDefault } from "@/repository/gamification-rules";

// Map trigger types to Vietnamese labels
const TRIGGER_LABELS: Record<TargetTriggerType, string> = {
  course_completed: "Hoàn thành môn học",
  class_completed: "Hoàn thành lớp học",
  phase_completed: "Hoàn thành giai đoạn lộ trình học tập",
  learning_path_completed: "Hoàn thành lộ trình học tập",
};

const GamificationRulesTab: React.FC = () => {
  const [rules, setRules] = useState<GamificationRuleWithDefault[]>([]);
  const [originalRules, setOriginalRules] = useState<GamificationRuleWithDefault[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingAll, setSavingAll] = useState(false);
  const [snackbar, setSnackbar] = useState<{open: boolean; message: string; severity: "success" | "error"}>({
    open: false,
    message: "",
    severity: "success",
  });

  // Fetch rules on component mount
  useEffect(() => {
    fetchRules();
  }, []);

  const fetchRules = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/gamification/rules");
      const data = await response.json();

      if (data.success) {
        setRules(data.data);
        setOriginalRules(data.data);
      }
    } catch (error) {
      console.error("Error fetching rules:", error);
      setSnackbar({
        open: true,
        message: "Không thể tải danh sách quy tắc",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (triggerType: TargetTriggerType) => {
    // Update local state only, don't call API
    setRules((prev) =>
      prev.map((rule) =>
        rule.trigger_type === triggerType
          ? { ...rule, is_active: !rule.is_active }
          : rule
      )
    );
  };

  const handleXpChange = (triggerType: TargetTriggerType, value: string) => {
    // Update local state for XP amount
    setRules((prev) =>
      prev.map((rule) =>
        rule.trigger_type === triggerType
          ? { ...rule, xp_amount: parseInt(value) || 0 }
          : rule
      )
    );
  };

  const handleSaveAll = async () => {
    try {
      setSavingAll(true);

      // Prepare rules to save (all rules, backend will handle create/update logic)
      const rulesToSave = rules.map((rule) => ({
        trigger_type: rule.trigger_type,
        xp_amount: rule.xp_amount,
        is_active: rule.is_active,
      }));

      const response = await fetch("/api/gamification/rules/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ rules: rulesToSave }),
      });

      const data = await response.json();

      if (data.success) {
        await fetchRules();
        setSnackbar({
          open: true,
          message: "Lưu thành công",
          severity: "success",
        });
      } else {
        setSnackbar({
          open: true,
          message: data.message || "Lưu thất bại",
          severity: "error",
        });
      }
    } catch (error) {
      console.error("Error saving rules:", error);
      setSnackbar({
        open: true,
        message: "Có lỗi xảy ra khi lưu",
        severity: "error",
      });
    } finally {
      setSavingAll(false);
    }
  };

  const hasChanges = () => {
    return rules.some((rule) => {
      const original = originalRules.find((r) => r.trigger_type === rule.trigger_type);
      return (
        original &&
        (original.xp_amount !== rule.xp_amount || original.is_active !== rule.is_active)
      );
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      <Card>
        <CardContent>
          {/* Header */}
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
            <Box display="flex" alignItems="center" gap={1}>
              <EmojiEventsIcon color="primary" />
              <Typography variant="subtitle1" component="h2">
                Cấu hình điểm thưởng
              </Typography>
            </Box>

            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={handleSaveAll}
              disabled={!hasChanges() || savingAll}
            >
              {savingAll ? "Đang lưu..." : "Lưu thay đổi"}
            </Button>
          </Box>

        {/* Rules List */}
        <Stack spacing={3}>
          {TARGET_TRIGGER_TYPES.map((triggerType) => {
            const rule = rules.find((r) => r.trigger_type === triggerType);
            const isActive = rule?.is_active ?? false;
            const xpAmount = rule?.xp_amount ?? 0;

            return (
              <Box
                key={triggerType}
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                sx={{
                  py: 1,
                  borderBottom: "1px solid",
                  borderColor: "divider",
                  "&:last-child": {
                    borderBottom: "none",
                  },
                }}
              >
                {/* Toggle Switch */}
                <FormControlLabel
                  control={
                    <Switch
                      checked={isActive}
                      onChange={() => handleToggle(triggerType)}
                      disabled={savingAll}
                      sx={{ mr: 2 }}
                    />
                  }
                  label={
                    <Typography variant="body1" sx={{ minWidth: 250 }}>
                      {TRIGGER_LABELS[triggerType]}
                    </Typography>
                  }
                />

                {/* XP Amount Input */}
                <TextField
                  type="number"
                  value={xpAmount}
                  onChange={(e) => handleXpChange(triggerType, e.target.value)}
                  disabled={savingAll}
                  size="small"
                  sx={{ width: 120 }}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">điểm</InputAdornment>,
                  }}
                  inputProps={{
                    min: 0,
                    style: { textAlign: "right" },
                  }}
                />
              </Box>
            );
          })}
        </Stack>
      </CardContent>
    </Card>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default GamificationRulesTab;
