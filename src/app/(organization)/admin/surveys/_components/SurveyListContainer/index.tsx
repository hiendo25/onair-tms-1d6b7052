"use client";

import * as React from "react";
import { useTransition } from "react";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import { Box, Button, Card, IconButton, InputAdornment, Stack, TextField } from "@mui/material";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { PATHS } from "@/constants/path.constant";
import { useDialogs } from "@/hooks/useDialogs/useDialogs";
import useNotifications from "@/hooks/useNotifications/useNotifications";
import { useUserOrganization } from "@/modules/organization";
import { usePermissions } from "@/modules/permission-wrapper";
import Can from "@/modules/permission-wrapper/components/Can";
import { useGetSurveysQuery } from "@/modules/surveys/operation/queries";
import { Edit02Icon, EyeIcon, Trash01Icon } from "@/shared/assets/icons";
import PageContainer from "@/shared/ui/PageContainer";
import TableData from "@/shared/ui/TableData";
import { Survey } from "@/types/survey.types";

import { surveyColumns } from "./survey-columns";
interface SurveyListContainerProps {
  className?: string;
}
const SurveyListContainer: React.FC<SurveyListContainerProps> = ({ className }) => {
  const organization = useUserOrganization((state) => state.currentOrganization);
  const { data: surveysData, isPending } = useGetSurveysQuery({
    queryParams: {
      organizationId: organization.orgId,
    },
  });
  const router = useRouter();
  const dialogs = useDialogs();
  const notifications = useNotifications();

  const [isTransition, startTransition] = useTransition();
  const surveyList = React.useMemo(() => {
    return surveysData?.data || [];
  }, [surveysData]);
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(12);
  const [surveys, setSurveys] = React.useState<Survey[]>([]);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [selectedSurveyId, setSelectedSurveyId] = React.useState<string | null>(null);

  const { hasPermissions } = usePermissions();

  const canCreateOrUpdate = hasPermissions([{ $or: "survey:create" }, { $or: "survey:update" }]);

  const filteredSurveys = React.useMemo(() => {
    if (!searchQuery.trim()) {
      return surveys;
    }
    const query = searchQuery.toLowerCase();
    return surveys.filter(
      (survey) => survey.name.toLowerCase().includes(query) || survey.description.toLowerCase().includes(query),
    );
  }, [surveys, searchQuery]);

  const paginatedSurveys = React.useMemo(() => {
    const start = page * rowsPerPage;
    const end = start + rowsPerPage;
    return filteredSurveys.slice(start, end);
  }, [filteredSurveys, page, rowsPerPage]);

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
    setPage(0);
  };

  const handleCreateSurvey = () => {
    startTransition(() => {
      router.push(PATHS.SURVEYS.CREATE);
    });
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, surveyId: string) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setSelectedSurveyId(surveyId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedSurveyId(null);
  };

  const handleCopyLink = async () => {
    if (!selectedSurveyId) return;

    const surveyUrl = `${window.location.origin}${PATHS.SURVEYS.SUBMIT(selectedSurveyId)}`;
    try {
      await navigator.clipboard.writeText(surveyUrl);
      notifications.show("Đã sao chép liên kết khảo sát", {
        severity: "success",
        autoHideDuration: 3000,
      });
    } catch (error) {
      notifications.show("Không thể sao chép liên kết", {
        severity: "error",
        autoHideDuration: 3000,
      });
    }
    handleMenuClose();
  };

  const handleViewStatistics = () => {
    if (selectedSurveyId) {
      router.push(PATHS.SURVEYS.STATISTICS(selectedSurveyId));
    }
    handleMenuClose();
  };

  const handleEdit = () => {
    if (selectedSurveyId) {
      router.push(PATHS.SURVEYS.EDIT(selectedSurveyId));
    }
    handleMenuClose();
  };

  const handleDelete = async () => {
    if (!selectedSurveyId) return;

    const confirmed = await dialogs.confirm(
      "Bạn có chắc chắn muốn xóa khảo sát này không? Hành động này không thể hoàn tác.",
      {
        title: "Xác nhận xóa",
        okText: "Xóa",
        cancelText: "Hủy",
        severity: "error",
      },
    );

    if (!confirmed) {
      handleMenuClose();
      return;
    }

    setSurveys((prev) => prev.filter((survey) => survey.id !== selectedSurveyId));
    notifications.show("Xóa khảo sát thành công!", {
      severity: "success",
      autoHideDuration: 3000,
    });
    handleMenuClose();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const dateStr = date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    const timeStr = date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
    return `${dateStr}, ${timeStr}`;
  };

  const handleDeleteSurvey = (surveyId: string, surveyName: string) => () => {};
  const mergedColumns = React.useMemo((): typeof surveyColumns => {
    return canCreateOrUpdate
      ? [
          ...surveyColumns,
          {
            id: "action",
            field: "action",
            headerName: "Hành động",
            fixed: "right",
            width: 140,
            renderCell: (value, { id: surveyId, title }) => {
              return (
                <>
                  <Can pers={["survey:read"]}>
                    <IconButton
                      size="small"
                      className="text-blue-600 bg-transparent hover:bg-blue-50"
                      title="View"
                      onClick={handleDeleteSurvey(surveyId, title)}
                    >
                      <EyeIcon className="w-4 h-4" />
                    </IconButton>
                  </Can>
                  <Can pers={["survey:update"]}>
                    <Link href={PATHS.SURVEYS.EDIT(surveyId)}>
                      <IconButton size="small" className="text-blue-600 bg-transparent hover:bg-blue-50">
                        <Edit02Icon className="w-4 h-4" />
                      </IconButton>
                    </Link>
                  </Can>
                  <Can pers={["survey:delete"]}>
                    <IconButton
                      size="small"
                      className="text-red-600 bg-transparent hover:bg-red-50"
                      onClick={handleDeleteSurvey(surveyId, title)}
                    >
                      <Trash01Icon className="w-4 h-4" />
                    </IconButton>
                  </Can>
                </>
              );
            },
          },
        ]
      : surveyColumns;
  }, []);

  return (
    <Box>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        sx={{ mb: 3 }}
        alignItems={{ xs: "stretch", sm: "center" }}
        justifyContent="space-between"
      >
        <TextField
          placeholder="Tìm kiếm khảo sát..."
          value={searchQuery}
          onChange={handleSearchChange}
          size="small"
          sx={{ width: { xs: "100%", sm: 300 } }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            },
          }}
        />
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreateSurvey}
          loading={isTransition}
          disabled={isTransition}
        >
          Tạo khảo sát
        </Button>
      </Stack>
      <TableData
        rows={surveyList}
        showRowCount
        columns={mergedColumns}
        rowKey="id"
        loading={isPending}
        minWidth={1200}
      />
    </Box>
  );
};

export default SurveyListContainer;
