import {
  Box,
  ButtonBase,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
  Pagination,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import SearchIcon from "@mui/icons-material/Search";
import TaskAltIcon from "@mui/icons-material/TaskAlt";
import { PlanningSurveyOption } from "@/services/surveys/survey.service";
import { fDateTime, FORMAT_DATE_TIME_CLEANER } from "@/lib";

interface SurveyPickerDialogProps {
  open: boolean;
  loading?: boolean;
  search: string;
  surveys: PlanningSurveyOption[];
  page: number;
  limit: number;
  total: number;
  onClose: () => void;
  onSearchChange: (value: string) => void;
  onPageChange: (page: number) => void;
  onSelect: (survey: PlanningSurveyOption) => void;
}

export function SurveyPickerDialog({
  open,
  loading,
  search,
  surveys,
  page,
  limit,
  total,
  onClose,
  onSearchChange,
  onPageChange,
  onSelect,
}: SurveyPickerDialogProps) {
  const totalPages = Math.ceil(total / limit);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", pb: 1 }}>
        <Stack direction="row" spacing={1} alignItems="center">
          <TaskAltIcon color="primary" />
          <Typography variant="h6">Chọn khảo sát</Typography>
        </Stack>
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers sx={{ pt: 1 }}>
        <TextField
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Tìm kiếm khảo sát..."
          fullWidth
          size="small"
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }
          }}
          sx={{ mb: 2 }}
        />

        <Stack spacing={1.5}>
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
              <CircularProgress size={24} />
            </Box>
          ) : surveys.length === 0 ? (
            <Box sx={{ py: 3, textAlign: "center" }}>
              <Typography variant="body2" color="text.secondary">
                Không có khảo sát phù hợp
              </Typography>
            </Box>
          ) : (
            surveys.map((item) => (
              <ButtonBase
                key={item.id}
                onClick={() => onSelect(item)}
                sx={{
                  width: "100%",
                  borderRadius: 2,
                  border: "1px solid",
                  borderColor: "divider",
                  p: 1.75,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                  gap: 0.5,
                  bgcolor: "grey.50",
                  "&:hover": {
                    borderColor: "primary.main",
                    bgcolor: "primary.50",
                  },
                }}
              >
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                  {item.title}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Tạo ngày: {fDateTime(item.createdAt, FORMAT_DATE_TIME_CLEANER)}
                </Typography>
              </ButtonBase>
            ))
          )}
        </Stack>

        {!loading && totalPages > 1 && (
          <Box sx={{ display: "flex", justifyContent: "center", pt: 2 }}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={(_, value) => onPageChange(value)}
              color="primary"
              size="small"
              shape="rounded"
            />
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
}
