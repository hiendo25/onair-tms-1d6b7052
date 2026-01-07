"use client";

import React, { useEffect, useState } from "react";
import { Box, Card, CardContent, LinearProgress, Typography, Alert, CircularProgress } from "@mui/material";
import Image from "next/image";

interface LevelInfo {
  id: string;
  title: string;
  description: string | null;
  icon: string | null;
  scoreRequired: number;
}

interface NextLevelInfo extends LevelInfo {
  xpNeeded: number;
}

interface GamificationData {
  currentXp: number;
  currentLevelId: string | null;
  currentLevel: LevelInfo | null;
  nextLevel: NextLevelInfo | null;
}

const MyGamificationContent: React.FC = () => {
  const [data, setData] = useState<GamificationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGamificationData = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/gamification/my-xp");

        if (!response.ok) {
          throw new Error("Failed to fetch gamification data");
        }

        const result = await response.json();

        if (result.success) {
          setData(result.data);
        } else {
          throw new Error("Invalid response format");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchGamificationData();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!data) {
    return (
      <Box p={3}>
        <Alert severity="info">No gamification data available</Alert>
      </Box>
    );
  }

  const progressPercentage = data.nextLevel
    ? Math.min(100, (data.currentXp / data.nextLevel.scoreRequired) * 100)
    : 100;

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Thành tích của tôi
      </Typography>

      {/* Current XP Card */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Điểm kinh nghiệm (XP)
          </Typography>
          <Typography variant="h3" color="primary">
            {data.currentXp.toLocaleString()} XP
          </Typography>
        </CardContent>
      </Card>

      {/* Current Level Card */}
      {data.currentLevel && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Danh hiệu hiện tại
            </Typography>
            <Box display="flex" alignItems="center" gap={2}>
              {data.currentLevel.icon && (
                <Box sx={{ width: 64, height: 64, position: "relative", flexShrink: 0 }}>
                  <Image
                    src={data.currentLevel.icon}
                    alt={data.currentLevel.title}
                    fill
                    style={{ objectFit: "contain", borderRadius: "6px" }}
                  />
                </Box>
              )}
              <Box>
                <Typography variant="h5">{data.currentLevel.title}</Typography>
                <Typography variant="caption" color="text.secondary">
                  Yêu cầu: {data.currentLevel.scoreRequired.toLocaleString()} XP
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Next Level Card */}
      {data.nextLevel && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Danh hiệu tiếp theo
            </Typography>
            <Box display="flex" alignItems="center" gap={2} mb={2}>
              {data.nextLevel.icon && (
                <Box sx={{ width: 64, height: 64, position: "relative", flexShrink: 0 }}>
                  <Image
                    src={data.nextLevel.icon}
                    alt={data.nextLevel.title}
                    fill
                    style={{ objectFit: "contain", borderRadius: "6px" }}
                  />
                </Box>
              )}
              <Box flex={1}>
                <Typography variant="h5">{data.nextLevel.title}</Typography>
                <Typography variant="caption" color="text.secondary">
                  Yêu cầu: {data.nextLevel.scoreRequired.toLocaleString()} XP
                </Typography>
              </Box>
            </Box>

            {/* Progress Bar */}
            <Box>
              <Box display="flex" justifyContent="space-between" mb={1}>
                <Typography variant="body2">
                  Tiến độ
                </Typography>
                <Typography variant="body2" color="primary" fontWeight="bold">
                  {data.nextLevel.xpNeeded > 0
                    ? `Còn ${data.nextLevel.xpNeeded.toLocaleString()} XP`
                    : `Đã đạt!`}
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={progressPercentage}
                sx={{ height: 10, borderRadius: 5 }}
              />
              <Typography variant="caption" color="text.secondary" mt={0.5}>
                {progressPercentage.toFixed(1)}%
              </Typography>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* No Next Level */}
      {!data.nextLevel && data.currentLevel && (
        <Card>
          <CardContent>
            <Alert severity="success">
              Chúc mừng! Bạn đã đạt danh hiệu cao nhất!
            </Alert>
          </CardContent>
        </Card>
      )}

      {/* No Level Yet */}
      {!data.currentLevel && !data.nextLevel && (
        <Card>
          <CardContent>
            <Alert severity="info">
              Bạn chưa có danh hiệu. Hãy tích lũy điểm kinh nghiệm để đạt danh hiệu đầu tiên!
            </Alert>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default MyGamificationContent;
