"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { Box, Button, Card, Stack, Typography } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import HomeIcon from "@mui/icons-material/Home";
import PublicPageContainer from "@/shared/ui/PageContainer/PublicPageContainer";
import { MOCK_SURVEYS } from "@/constants/survey.constants";
import { PATHS } from "@/constants/path.contstants";

export default function ThankYouPage() {
  const params = useParams();
  const router = useRouter();

  const surveyId = params.id as string;

  // Find survey from mock data
  const survey = React.useMemo(() => {
    return MOCK_SURVEYS.find((s) => s.id === surveyId);
  }, [surveyId]);

  const handleGoHome = () => {
    router.push(PATHS.ROOT);
  };

  return (
    <PublicPageContainer>
      <Box sx={{ py: 3 }}>
        <Card sx={{ p: 5, maxWidth: 600, mx: "auto" }}>
          <Stack spacing={3} alignItems="center" textAlign="center">
            {/* Success Icon */}
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: "50%",
                backgroundColor: "success.light",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <CheckCircleIcon sx={{ fontSize: 48, color: "success.main" }} />
            </Box>

            {/* Success Message */}
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              Cảm ơn bạn đã hoàn thành khảo sát!
            </Typography>

            {/* Survey Name */}
            {survey && (
              <Typography variant="body1" color="text.secondary">
                Phản hồi của bạn cho khảo sát <strong>"{survey.name}"</strong> đã được ghi nhận thành công.
              </Typography>
            )}

            {/* Additional Message */}
            <Typography variant="body2" color="text.secondary">
              Ý kiến của bạn rất quan trọng và sẽ giúp chúng tôi cải thiện chất lượng dịch vụ.
            </Typography>

            {/* Action Button */}
            <Button
              variant="contained"
              size="large"
              startIcon={<HomeIcon />}
              onClick={handleGoHome}
              sx={{ mt: 2, minWidth: 200 }}
            >
              Về trang chủ
            </Button>
          </Stack>
        </Card>
      </Box>
    </PublicPageContainer>
  );
}

