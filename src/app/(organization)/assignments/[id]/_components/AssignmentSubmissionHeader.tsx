"use client";

import React from "react";
import { Card, Typography, Stack, Box, Avatar, Divider } from "@mui/material";

interface AssignmentSubmissionHeaderProps {
  // Student information
  avatar: string | null;
  fullName: string;
  employeeCode: string;
  email: string;
  
  // Submission information
  submittedAt: string;
  
  // Assignment information
  assignmentName: string;
  assignmentDescription?: string;
  
  // Score information
  totalScore: number;
  maxScore: number;
}

const AssignmentSubmissionHeader: React.FC<AssignmentSubmissionHeaderProps> = ({
  avatar,
  fullName,
  employeeCode,
  email,
  submittedAt,
  assignmentName,
  assignmentDescription,
  totalScore,
  maxScore,
}) => {
  return (
    <Card sx={{ p: 3, mb: 3 }}>
      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
        <Avatar
          src={avatar || undefined}
          alt={fullName}
          sx={{ width: 56, height: 56 }}
        />
        <Box flex={1}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {fullName}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Mã học viên: {employeeCode}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Email: {email}
          </Typography>
        </Box>
        <Box textAlign="right">
          <Typography variant="body2" color="text.secondary">
            Ngày nộp
          </Typography>
          <Typography variant="body1">
            {new Date(submittedAt).toLocaleString("vi-VN")}
          </Typography>
        </Box>
      </Stack>

      <Divider sx={{ my: 2 }} />

      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {assignmentName}
          </Typography>
          {assignmentDescription && (
            <Box
              sx={{
                "& p": { margin: 0 },
                "& ul, & ol": { marginTop: 0.5, marginBottom: 0.5 },
              }}
            >
              <Typography
                variant="body2"
                color="text.secondary"
                component="div"
                dangerouslySetInnerHTML={{ __html: assignmentDescription }}
              />
            </Box>
          )}
        </Box>
        <Box textAlign="right">
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            {totalScore.toFixed(1)}/{maxScore}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Tổng điểm
          </Typography>
        </Box>
      </Stack>
    </Card>
  );
};

export default AssignmentSubmissionHeader;

