"use client";

import * as React from "react";
import { useTransition } from "react";
import AddIcon from "@mui/icons-material/Add";
import { Box, Button, IconButton, InputAdornment, Stack, TextField } from "@mui/material";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { PATHS } from "@/constants/path.constant";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";
import { useDialogs } from "@/hooks/useDialogs/useDialogs";
import useNotifications from "@/hooks/useNotifications/useNotifications";
import { useUserOrganization } from "@/modules/organization";
import { usePermissions } from "@/modules/permission-wrapper";
import Can from "@/modules/permission-wrapper/components/Can";
import { useGetSurveysQuery } from "@/modules/surveys/operation/queries";
import { GetSurveysQueryParams } from "@/repository/surveys";
import { SearchIcon } from "@/shared/assets/icons";
import { Copy07Icon, Edit02Icon, LineChartUp01Icon, Trash01Icon } from "@/shared/assets/icons";
import TableData from "@/shared/ui/TableData";

import { surveyColumns } from "./survey-columns";
interface SurveyListContainerProps {
  className?: string;
}
const SurveyListContainer: React.FC<SurveyListContainerProps> = ({ className }) => {
  const organization = useUserOrganization((state) => state.currentOrganization);
  const [queryParams, setQueryParams] = React.useState<GetSurveysQueryParams>({
    page: 1,
    pageSize: 10,
    search: "",
  });

  const {
    data: surveysData,
    isPending,
    isLoading,
  } = useGetSurveysQuery({
    queryParams: {
      ...queryParams,
      organizationId: organization.orgId,
    },
  });

  const router = useRouter();
  const dialogs = useDialogs();
  const notifications = useNotifications();
  const { copy } = useCopyToClipboard();
  const { hasPermissions } = usePermissions();

  const canCreateOrUpdate = hasPermissions([{ $or: "survey:create" }, { $or: "survey:update" }]);
  const [isTransition, startTransition] = useTransition();

  const surveyList = React.useMemo(() => {
    return surveysData?.data || [];
  }, [surveysData]);

  const totalCount = React.useMemo(() => {
    return surveysData?.count || 0;
  }, [surveysData]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setQueryParams((prev) => ({ ...prev, page: 1, search: event.target.value }));
  };

  const handleCreateSurvey = () => {
    startTransition(() => {
      router.push(PATHS.SURVEYS.CREATE);
    });
  };

  const handleCopyLink = (surveyId: string) => async () => {
    const surveyUrl = `${window.location.origin}${PATHS.SURVEYS.SUBMISSIONS(surveyId)}`;
    const isCopied = await copy(surveyUrl);
    notifications.show(isCopied ? "Đã sao chép liên kết khảo sát" : "Không thể sao chép liên kết", {
      severity: isCopied ? "success" : "error",
      autoHideDuration: 3000,
    });
  };

  const handleDeleteSurvey = (surveyId: string, surveyName: string) => async () => {
    const confirmed = await dialogs.confirm(
      `"Bạn có chắc chắn muốn xóa ${surveyName} ? Hành động này không thể hoàn tác."`,
      {
        title: "Xác nhận xóa",
        okText: "Xóa",
        cancelText: "Hủy",
        severity: "error",
      },
    );

    if (!confirmed) {
      // handleMenuClose();
      return;
    }

    notifications.show("Hiện chức năng chưa cho phép xóa.", {
      severity: "info",
      autoHideDuration: 3000,
    });
    // handleMenuClose();
  };

  const handleViewStatistics = (surveyId: string) => () => {
    router.push(PATHS.SURVEYS.STATISTICS(surveyId));
  };

  const handleChangePage = React.useCallback((newPage: number) => {
    setQueryParams((prev) => ({ ...prev, page: newPage }));
  }, []);

  const mergedColumns = React.useMemo((): typeof surveyColumns => {
    return canCreateOrUpdate
      ? [
          ...surveyColumns,
          {
            id: "action",
            field: "action",
            headerName: "Hành động",
            fixed: "right",
            width: 180,
            renderCell: (value, { id: surveyId, title }) => {
              return (
                <>
                  <IconButton
                    size="small"
                    className="text-blue-600 bg-transparent hover:bg-blue-50"
                    title="View"
                    onClick={handleCopyLink(surveyId)}
                  >
                    <Copy07Icon className="w-4 h-4" />
                  </IconButton>
                  <Can pers={["survey:read"]}>
                    <IconButton
                      size="small"
                      className="text-blue-600 bg-transparent hover:bg-blue-50"
                      title="View"
                      onClick={handleViewStatistics(surveyId)}
                    >
                      <LineChartUp01Icon className="w-4 h-4" />
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
          value={queryParams.search}
          onChange={handleSearchChange}
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
        rowKey="id"
        rows={surveyList}
        showRowCount
        columns={mergedColumns}
        loading={isLoading || isPending}
        minWidth={1200}
        pagination={{
          total: totalCount,
          page: queryParams.page,
          pageSize: queryParams.pageSize,
          onChangePage: handleChangePage,
        }}
      />
    </Box>
  );
};

export default SurveyListContainer;
