"use client";

import * as React from "react";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import SearchIcon from "@mui/icons-material/Search";
import {
  Avatar,
  Box,
  Card,
  Chip,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import type { EmployeeLearningPathWithDetails } from "@/repository/learning-paths";

import { getEmployeeSearchValue, SECTION_CARD_SX } from "./learning-path-detail.utils";

interface LearningPathDetailAudienceSectionProps {
  employees: EmployeeLearningPathWithDetails[];
}

export default function LearningPathDetailAudienceSection({
  employees,
}: LearningPathDetailAudienceSectionProps) {
  const [searchValue, setSearchValue] = React.useState<string>("");

  const normalizedSearch = searchValue.trim().toLowerCase();

  const filteredEmployees = React.useMemo(() => {
    if (!normalizedSearch) return employees;
    return employees.filter((employeeItem) =>
      getEmployeeSearchValue(employeeItem).includes(normalizedSearch),
    );
  }, [employees, normalizedSearch]);

  return (
    <Card sx={SECTION_CARD_SX}>
      <Box sx={{ p: 3 }}>
        <Stack spacing={2}>
          <Stack spacing={0.5}>
            <Typography variant="h6" fontWeight={700}>
              Đối tượng
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {employees.length} học viên
            </Typography>
          </Stack>
          <TextField
            value={searchValue}
            onChange={(event) => setSearchValue(event.target.value)}
            placeholder="Tìm kiếm theo tên, mã NV, email..."
            size="small"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
          />
          <Stack spacing={2}>
            {filteredEmployees.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                Không tìm thấy học viên phù hợp.
              </Typography>
            ) : (
              filteredEmployees.map((employeeItem) => {
                const profile = employeeItem.employee.profiles;
                return (
                  <Box
                    key={employeeItem.employee_id}
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      border: "1px solid",
                      borderColor: "divider",
                      bgcolor: "grey.50",
                    }}
                  >
                    <Stack direction="row" spacing={2} alignItems="flex-start">
                      <Avatar src={profile.avatar ?? undefined} alt={profile.full_name} />
                      <Stack spacing={1} flex={1}>
                        <Stack spacing={0.5}>
                          <Typography variant="subtitle2" fontWeight={700}>
                            {profile.full_name}
                          </Typography>
                          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                            <Chip size="small" label={employeeItem.employee.employee_code} />
                            {employeeItem.employee.employee_type && (
                              <Chip
                                size="small"
                                label={employeeItem.employee.employee_type}
                                variant="outlined"
                              />
                            )}
                          </Stack>
                        </Stack>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <MailOutlineIcon fontSize="small" color="action" />
                          <Typography variant="body2" color="text.secondary">
                            {profile.email}
                          </Typography>
                        </Stack>
                      </Stack>
                    </Stack>
                  </Box>
                );
              })
            )}
          </Stack>
        </Stack>
      </Box>
    </Card>
  );
}
