"use client";

import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  Stack,
  Typography,
} from "@mui/material";
import { useLibraryStore } from "@/modules/library/store/libraryProvider";
import { Resource } from "@/modules/library/types";
import { SelectedResourceCard } from "@/modules/library/components/SelectedResourceCard";
import { SelectedResourcesList } from "@/modules/library/components/SelectedResourcesList";

export default function LibraryExample() {
  const openLibrary = useLibraryStore((state) => state.openLibrary);
  const [selectedSingleResource, setSelectedSingleResource] = useState<Resource | null>(null);
  const [selectedMultipleResources, setSelectedMultipleResources] = useState<Resource[]>([]);
  const [loadingSingle, setLoadingSingle] = useState(false);
  const [loadingMultiple, setLoadingMultiple] = useState(false);

  const handleSelectSingle = async () => {
    setLoadingSingle(true);
    try {
      const resources = await openLibrary({
        mode: "single",
        selectedIds: selectedSingleResource ? [selectedSingleResource.id] : [],
      });
      setSelectedSingleResource(resources[0] || null);
    } catch (error) {
      console.error("Failed to open library:", error);
    } finally {
      setLoadingSingle(false);
    }
  };

  const handleSelectMultiple = async () => {
    setLoadingMultiple(true);
    try {
      const resources = await openLibrary({
        mode: "multiple",
        selectedIds: selectedMultipleResources.map((r) => r.id),
      });
      setSelectedMultipleResources(resources);
    } catch (error) {
      console.error("Failed to open library:", error);
    } finally {
      setLoadingMultiple(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: "auto", p: 3, width: "100%" }}>
      <Stack spacing={4}>
        <Card>
          <CardContent>
            <Typography variant="h5" gutterBottom>
              Single Select
            </Typography>
            <Divider sx={{ my: 2 }} />

            <Button
              variant="contained"
              onClick={handleSelectSingle}
              disabled={loadingSingle}
              sx={{ mb: 3 }}
            >
              {loadingSingle ? "Đang mở..." : "Chọn tài nguyên"}
            </Button>

            {selectedSingleResource && (
              <Box sx={{ maxWidth: 300 }}>
                <SelectedResourceCard resourceId={selectedSingleResource.id} />
              </Box>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Typography variant="h5" gutterBottom>
              Multiple Select
            </Typography>
            <Divider sx={{ my: 2 }} />

            <Button
              variant="contained"
              color="secondary"
              onClick={handleSelectMultiple}
              disabled={loadingMultiple}
              sx={{ mb: 3 }}
            >
              {loadingMultiple ? "Đang mở..." : "Chọn nhiều tài nguyên"}
            </Button>

            {selectedMultipleResources.length > 0 && (
              <Box>
                <SelectedResourcesList
                  resourceIds={selectedMultipleResources.map((r) => r.id)}
                />
              </Box>
            )}
          </CardContent>
        </Card>
      </Stack>
    </Box>
  );
}

