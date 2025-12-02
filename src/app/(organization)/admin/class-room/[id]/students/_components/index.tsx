"use client";
import { Fragment, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  IconButton,
  InputAdornment,
  Menu,
  MenuItem,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { grey } from "@mui/material/colors";
import { STUDENT_TABLE_HEAD, ATTENDANCE_OPTIONS } from "../constants/constants";
import { useGetClassRoomStudentsQuery } from "@/modules/class-room-management/operations/query";
import useDebounce from "@/hooks/useDebounce";
import { Pagination } from "@/shared/ui/Pagination";
import { useGetOrganizationUnitsQuery } from "@/modules/organization-units/operations/query";
import { useUserOrganization } from "@/modules/organization/store/UserOrganizationProvider";
import type { ClassRoomStudentDto } from "@/types/dto/classRooms/classRoom.dto";
import { SelectOption } from "@/shared/ui/form/SelectOption";
import { fDateTime } from "@/lib";
import PopupState, { bindMenu, bindTrigger } from "material-ui-popup-state";
import { useDeleteUserInClassRoomMutation, useExportStudentsMutation, useMarkAttendanceMutation } from "@/modules/class-room-management/operations/mutation";
import { useQueryClient } from "@tanstack/react-query";
import { ConfirmDialog } from "@/shared/ui/custom-dialog";
import useNotifications from "@/hooks/useNotifications/useNotifications";
import DownloadIcon from "@mui/icons-material/Download";
import { SearchIcon } from "@/shared/assets/icons";
import { StudentSessionsCollapseRow } from "./StudentSessionsCollapseRow";

interface StudentsSectionProps {
  classRoomId: string;
}

const PAGE_SIZE = 10;
const SEARCH_DEBOUNCE = 600;

type AttendanceFilterValue = "all" | "attended" | "absent" | "pending";

const resolveOrganizationUnitName = (
  student: ClassRoomStudentDto,
  unitType: "branch" | "department",
) => {
  const employments = student.employee?.employments ?? [];

  return (
    employments.find(
      (employment) => employment.organizationUnit?.type === unitType,
    )?.organizationUnit?.name ?? "-"
  );
};


const StudentsSection = ({ classRoomId }: StudentsSectionProps) => {

  const queryClient = useQueryClient();
  const notifications = useNotifications();

  const [search, setSearch] = useState("");
  const [branchId, setBranchId] = useState<string>("all");
  const [departmentId, setDepartmentId] = useState<string>("all");
  const [attendance, setAttendance] =
    useState<AttendanceFilterValue>("all");
  const [page, setPage] = useState(1);

  const debouncedSearch = useDebounce(search, SEARCH_DEBOUNCE);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteTargetIds, setDeleteTargetIds] = useState<string[]>([]);
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState<Set<string>>(new Set<string>());
  const [classRoomRuntimeStatus, setClassRoomRuntimeStatus] = useState<string | null>(null);
  const [expandedStudentRows, setExpandedStudentRows] = useState<
    Record<string, boolean>
  >({});


  const { organization } = useUserOrganization((state) => state.data);
  const organizationId = organization?.id;

  const { data: organizationUnits = [] } = useGetOrganizationUnitsQuery();

  const { mutateAsync: deleteUserInClassRoom, isPending: isDeletingStudents } = useDeleteUserInClassRoomMutation();
  const { mutateAsync: markAttendance, isPending: isMarkingAttendance } = useMarkAttendanceMutation();
  const { mutateAsync: exportStudents, isPending: isExporting } = useExportStudentsMutation();


  const normalizedSearch = debouncedSearch?.trim()
    ? debouncedSearch.trim()
    : undefined;
  const normalizedBranchId = branchId !== "all" ? branchId : undefined;
  const normalizedDepartmentId =
    departmentId !== "all" ? departmentId : undefined;
  const normalizedAttendance =
    attendance !== "all" ? attendance : undefined;

  const branchOptions = useMemo(() => {
    return (organizationUnits ?? []).filter(
      (unit) =>
        unit.organization_id === organizationId && unit.type === "branch",
    );
  }, [organizationUnits, organizationId]);

  const departmentOptions = useMemo(() => {
    return (organizationUnits ?? []).filter(
      (unit) =>
        unit.organization_id === organizationId &&
        unit.type === "department",
    );
  }, [organizationUnits, organizationId]);

  const queryInput = useMemo(
    () => ({
      classRoomId,
      page,
      limit: PAGE_SIZE,
      search: normalizedSearch,
      branchId: normalizedBranchId,
      departmentId: normalizedDepartmentId,
      attendanceStatus: normalizedAttendance,
    }),
    [
      classRoomId,
      page,
      normalizedSearch,
      normalizedBranchId,
      normalizedDepartmentId,
      normalizedAttendance,
    ],
  );

  const {
    data: studentsResult,
    isLoading,
    isError,
    refetch,
    isFetching,
  } = useGetClassRoomStudentsQuery(queryInput);

  const students = studentsResult?.data ?? [];
  const totalStudents = studentsResult?.total ?? 0;

  useEffect(() => {
    const runtimeStatus = students?.[0]?.class_rooms_priority?.runtime_status ?? null;
    if (runtimeStatus) {
      setClassRoomRuntimeStatus(runtimeStatus);
    }
  }, [students]);

  useEffect(() => {
    setSelectedEmployeeIds(new Set<string>());
  }, [normalizedSearch, normalizedBranchId, normalizedDepartmentId, normalizedAttendance]);

  const pageEmployeeIds = useMemo(
    () =>
      students
        .map((student) => student.employee?.id)
        .filter((employeeId): employeeId is string => Boolean(employeeId)),
    [students],
  );

  const selectedCount = selectedEmployeeIds.size;
  const isAllCurrentPageSelected =
    pageEmployeeIds.length > 0 &&
    pageEmployeeIds.every((employeeId) => selectedEmployeeIds.has(employeeId));
  const isSomeCurrentPageSelected =
    pageEmployeeIds.length > 0 &&
    pageEmployeeIds.some((employeeId) => selectedEmployeeIds.has(employeeId));
  const isDeleteLocked =
    classRoomRuntimeStatus === "past" || classRoomRuntimeStatus === "ongoing";

  const exportFilters = useMemo(
    () => ({
      search: normalizedSearch,
      branchId: normalizedBranchId,
      departmentId: normalizedDepartmentId,
      attendanceStatus: normalizedAttendance,
    }),
    [
      normalizedSearch,
      normalizedBranchId,
      normalizedDepartmentId,
      normalizedAttendance,
    ],
  );

  const handleSearchChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setSearch(event.target.value);
    setPage(1);
  };

  const handleBranchChange = (nextBranch: string) => {
    setBranchId(nextBranch);
    setPage(1);
  };

  const handleDepartmentChange = (nextDepartment: string) => {
    setDepartmentId(nextDepartment);
    setPage(1);
  };

  const handleAttendanceChange = (nextAttendance: AttendanceFilterValue) => {
    setAttendance(nextAttendance);
    setPage(1);
  };

  const handlePageChange = (nextPage: number) => {
    setPage(nextPage);
  };

  const handleToggleStudentSessions = (studentId: string) => {
    setExpandedStudentRows((prev) => ({
      ...prev,
      [studentId]: !prev[studentId],
    }));
  };

  const handleToggleStudentSelection = (employeeId?: string) => {
    if (!employeeId) {
      return;
    }
    setSelectedEmployeeIds((prev) => {
      const next = new Set(prev);
      if (next.has(employeeId)) {
        next.delete(employeeId);
      } else {
        next.add(employeeId);
      }
      return next;
    });
  };

  const handleToggleSelectAllCurrentPage = (checked: boolean) => {
    if (pageEmployeeIds.length === 0) {
      return;
    }

    setSelectedEmployeeIds((prev) => {
      const next = new Set(prev);
      pageEmployeeIds.forEach((employeeId) => {
        if (checked) {
          next.add(employeeId);
        } else {
          next.delete(employeeId);
        }
      });
      return next;
    });
  };

  const handleClearSelection = () => {
    setSelectedEmployeeIds(new Set<string>());
  };

  const handleOpenDialogDeleteUser = (employeeId?: string, runtimeStatus?: string | null) => {
    if (!employeeId) {
      notifications.show("Không thể xác định học viên để gỡ.", {
        severity: "error",
      });
      return;
    }

    if (runtimeStatus) {
      setClassRoomRuntimeStatus(runtimeStatus);
    }

    setDeleteTargetIds([employeeId]);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteSelected = () => {
    if (selectedEmployeeIds.size === 0) {
      return;
    }
    setDeleteTargetIds(Array.from(selectedEmployeeIds));
    setDeleteConfirmOpen(true);
  };

  const handleDeleteUser = async () => {
    if (deleteTargetIds.length === 0) {
      setDeleteConfirmOpen(false);
      return;
    }

    if (isDeleteLocked) {
      setDeleteConfirmOpen(false);
      return;
    }

    const payload = {
      class_room_id: classRoomId,
      employeeIds: deleteTargetIds,
    };

    try {
      await deleteUserInClassRoom(payload);
      queryClient.invalidateQueries({ queryKey: ["class-room-students"] });
      queryClient.invalidateQueries({ queryKey: ["class-rooms-priority"] });
      setSelectedEmployeeIds((prev) => {
        const next = new Set(prev);
        deleteTargetIds.forEach((id) => next.delete(id));
        return next;
      });
      setDeleteTargetIds([]);
      setDeleteConfirmOpen(false);
      notifications.show(
        `Đã gỡ ${payload.employeeIds.length} học viên khỏi lớp học.`,
        {
          severity: "success",
        },
      );
    } catch (error) {
      const fallbackMessage = "Không thể gỡ học viên. Vui lòng thử lại.";
      const message =
        error instanceof Error ? error.message || fallbackMessage : fallbackMessage;
      notifications.show(message, { severity: "error" });
    }
  };

  const deleteConfirmationTitle = isDeleteLocked
    ? "Không thể gỡ học viên khỏi lớp học"
    : deleteTargetIds.length > 1
      ? `Gỡ ${deleteTargetIds.length} học viên khỏi lớp học`
      : "Xác nhận gỡ học viên khỏi lớp học";

  const deleteConfirmationContent = isDeleteLocked
    ? "Khi lớp học đang diễn ra hoặc đã diễn ra, hệ thống tạm khóa chức năng gỡ học viên để đảm bảo ổn định buổi học."
    : `Bạn có chắc muốn gỡ ${deleteTargetIds.length > 1 ? `${deleteTargetIds.length} học viên` : "học viên này"} khỏi lớp học trực tuyến? Sau khi gỡ, học viên sẽ không thể truy cập hoặc tham gia buổi học.`;

  const handleMarkAttendance = async (classSessionId: string, employeeId?: string) => {
    if (!employeeId) {
      notifications.show("Không thể xác định học viên để điểm danh.", {
        severity: "error",
      });
      return;
    }

    try {
      await markAttendance({
        classSessionId,
        classRoomId,
        employeeId,
        attendance_method: "manual",
        attendance_mode: "offline",
      });
      notifications.show("Điểm danh thủ công thành công.", {
        severity: "success",
      });
      queryClient.invalidateQueries({ queryKey: ["class-room-students"] });
    } catch (error) {
      const fallbackMessage = "Điểm danh thủ công thất bại. Vui lòng thử lại.";
      const message =
        error instanceof Error ? error.message || fallbackMessage : fallbackMessage;
      notifications.show(message, {
        severity: "error",
      });
    }
  }

  const handleExport = async () => {
    if (isExporting) {
      return;
    }

    if (!studentsResult) {
      notifications.show(
        "Dữ liệu đang được tải. Vui lòng thử lại trong giây lát.",
        {
          severity: "info",
        },
      );
      return;
    }

    if ((studentsResult.total ?? 0) <= 0) {
      notifications.show("Không có dữ liệu học viên để xuất.", {
        severity: "info",
      });
      return;
    }

    try {
      const { blob, fileName } = await exportStudents({
        classRoomId,
        ...exportFilters,
      });

      const downloadUrl = window.URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = downloadUrl;
      anchor.download = fileName;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.URL.revokeObjectURL(downloadUrl);

      notifications.show("Xuất danh sách học viên thành công.", {
        severity: "success",
      });
    } catch (error) {
      console.error("Export class room students failed:", error);
      const fallbackMessage =
        "Xuất danh sách học viên thất bại. Vui lòng thử lại.";
      let message = fallbackMessage;
      let severity: "info" | "error" = "error";

      if (error instanceof Error) {
        message = error.message || fallbackMessage;
        severity =
          (error as Error & { severity?: "info" | "error" }).severity ??
          "error";
      }

      notifications.show(message, {
        severity,
      });
    }
  };

  return (
    <Stack spacing={2}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          gap: 2,
        }}
      >
        <Box flex={1}>
          <TextField
            placeholder="Tìm kiếm"
            value={search}
            onChange={handleSearchChange}
            size="small"
            sx={{ minWidth: 240 }}
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <SearchIcon />
                  </InputAdornment>
                ),
              },
            }}
          />
        </Box>
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={1}
          flex={1}
        >
          <SelectOption
            inputLabel="Chi nhánh"
            onChange={(value) => handleBranchChange(value)}
            value={branchId}
            options={[
              { display: true, label: "Tất cả", value: "all" },
              ...branchOptions.map((option) => ({
                display: true,
                label: option.name,
                value: option.id,
              })),
            ]}
            size="small"
          />

          <SelectOption
            inputLabel="Phòng ban"
            onChange={(value) => handleDepartmentChange(value)}
            value={departmentId}
            options={[
              { display: true, label: "Tất cả", value: "all" },
              ...departmentOptions.map((option) => ({
                display: true,
                label: option.name,
                value: option.id,
              })),
            ]}
            size="small"
          />

          <SelectOption
            inputLabel="Điểm danh"
            onChange={(value) => handleAttendanceChange(value)}
            value={attendance}
            options={ATTENDANCE_OPTIONS}
            size="small"
          />

          <Button
            variant="outlined"
            color="primary"
            sx={{ minWidth: 200 }}
            onClick={handleExport}
            disabled={isExporting}
            startIcon={<DownloadIcon />}
          >
            {isExporting ? (
              <Stack direction="row" spacing={1} alignItems="center">
                <CircularProgress size={16} color="inherit" />
                <Typography variant="body2" component="span">
                  Đang xuất...
                </Typography>
              </Stack>
            ) : (
              "Xuất danh sách"
            )}
          </Button>
        </Stack>
      </Box>

      {isError ? (
        <Alert
          severity="error"
          sx={{ borderRadius: 2 }}
          action={
            <Button color="inherit" size="small" onClick={() => refetch()}>
              Thử lại
            </Button>
          }
        >
          Không thể tải danh sách học viên. Vui lòng thử lại sau.
        </Alert>
      ) : null}

      <Stack
        direction={{ xs: "column", sm: "row" }}
        alignItems={{ xs: "flex-start", sm: "center" }}
        justifyContent="space-between"
        spacing={1}
      >
        <Typography variant="body2" color="text.secondary">
          {selectedCount > 0
            ? `Đã chọn ${selectedCount} học viên`
            : "Chưa chọn học viên nào"}
        </Typography>
        <Stack direction="row" spacing={1} alignItems="center">
          <Button
            variant="outlined"
            size="small"
            onClick={handleClearSelection}
            disabled={selectedCount === 0}
          >
            Bỏ chọn
          </Button>
          <Button
            variant="contained"
            color="error"
            size="small"
            startIcon={<DeleteOutlineIcon />}
            onClick={handleDeleteSelected}
            disabled={selectedCount === 0 || isDeleteLocked || isDeletingStudents}
          >
            Gỡ học viên đã chọn
          </Button>
        </Stack>
      </Stack>

      {isDeleteLocked ? (
        <Typography variant="body2" color="error">
          Khi lớp học đang diễn ra hoặc đã diễn ra, hệ thống tạm khóa chức năng gỡ học viên.
        </Typography>
      ) : null}

      <Box
        sx={{
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 2,
          overflow: "hidden",
          backgroundColor: "#fff",
        }}
      >
        <TableContainer>
          <Table
            aria-label="Danh sách học viên"
            sx={{
              tableLayout: "fixed",
              "& .MuiTableCell-root": {
                py: 1.5,
                px: 2,
              },
            }}
          >
            <TableHead
              sx={{
                backgroundColor: grey[100],
                "& .MuiTableCell-head": {
                  fontWeight: 600,
                  fontSize: 13,
                  letterSpacing: 0.2,
                  color: grey[700],
                },
              }}
            >
              <TableRow>
                {STUDENT_TABLE_HEAD.map((column) => (
                  <TableCell
                    key={column.id}
                    sx={{
                      width: column.width,
                      whiteSpace: "nowrap",
                    }}
                    align={column.align}
                  >
                    {column.id === "select" ? (
                      <Checkbox
                        checked={isAllCurrentPageSelected && pageEmployeeIds.length > 0}
                        indeterminate={isSomeCurrentPageSelected && !isAllCurrentPageSelected}
                        onChange={(event) =>
                          handleToggleSelectAllCurrentPage(event.target.checked)
                        }
                        disabled={students.length === 0}
                        inputProps={{ "aria-label": "Chọn tất cả học viên trong trang" }}
                      />
                    ) : (
                      column.label
                    )}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody
              sx={{
                "& .MuiTableCell-root": {
                  borderBottomColor: grey[200],
                  verticalAlign: "middle",
                },
              }}
            >
              {isLoading ? (
                <TableRow>
                  <TableCell
                    colSpan={STUDENT_TABLE_HEAD.length}
                    align="center"
                  >
                    <Stack
                      direction="row"
                      alignItems="center"
                      justifyContent="center"
                      spacing={2}
                      sx={{ py: 4 }}
                    >
                      <CircularProgress size={24} />
                      <Typography variant="body2" color="text.secondary">
                        Đang tải dữ liệu học viên...
                      </Typography>
                    </Stack>
                  </TableCell>
                </TableRow>
              ) : students.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={STUDENT_TABLE_HEAD.length}
                    align="center"
                    sx={{ py: 6 }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      Không có học viên phù hợp với tiêu chí lọc hiện tại.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                students.map((student, index) => {
                  const order = (page - 1) * PAGE_SIZE + index + 1;
                  const sessions = student.class_rooms?.sessions ?? [];
                  const hasSessions = sessions.length > 0;
                  const isExpanded = Boolean(expandedStudentRows[student.id]);
                  const employeeId = student.employee?.id;
                  const isSelected = employeeId ? selectedEmployeeIds.has(employeeId) : false;

                  const toggleSessions = () => {
                    if (!hasSessions) {
                      return;
                    }
                    handleToggleStudentSessions(student.id);
                  };

                  return (
                    <Fragment key={`${student.id}-${order}`}>
                      <TableRow
                        sx={{
                          "&:last-child td": { borderBottom: "none" },
                          "&:hover": {
                            backgroundColor: grey[50],
                          },
                        }}
                      >
                        <TableCell align="center">
                          <Checkbox
                            checked={isSelected}
                            disabled={!employeeId}
                            onChange={() => handleToggleStudentSelection(employeeId)}
                            slotProps={
                              {
                                input:{
                                  "aria-label": `Chọn ${student.employee?.profile?.full_name ?? "học viên"}`,
                                }
                              }
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <Stack
                            direction="row"
                            spacing={1.5}
                            alignItems="flex-start"
                          >
                            <IconButton
                              size="small"
                              onClick={toggleSessions}
                              disabled={!hasSessions}
                              sx={{ mt: 0.5 }}
                              aria-label={
                                isExpanded
                                  ? "Ẩn danh sách buổi học"
                                  : "Hiển thị danh sách buổi học"
                              }
                            >
                              {isExpanded ? (
                                <KeyboardArrowUpIcon fontSize="small" />
                              ) : (
                                <KeyboardArrowDownIcon fontSize="small" />
                              )}
                            </IconButton>
                            <Box>
                              <Typography
                                variant="subtitle2"
                                fontWeight={600}
                                noWrap
                              >
                                {student.employee?.profile?.full_name ?? "-"}
                              </Typography>
                              <Chip
                                label={student.employee?.employee_code ?? "-"}
                                variant="filled"
                                color="success"
                                size="small"
                                sx={{ mt: 0.5 }}
                              />
                            </Box>
                          </Stack>
                        </TableCell>
                        <TableCell>
                          {student.employee?.profile?.email ?? "-"}
                        </TableCell>
                        <TableCell>
                          {student.employee?.profile?.phone_number ?? "-"}
                        </TableCell>
                        <TableCell>
                          {resolveOrganizationUnitName(student, "branch")}
                        </TableCell>
                        <TableCell>
                          {resolveOrganizationUnitName(student, "department")}
                        </TableCell>
                        <TableCell align="center">
                          {fDateTime(student.created_at)}
                        </TableCell>
                        <TableCell align="center">
                          <PopupState
                            variant="popover"
                            popupId="demo-popup-menu"
                          >
                            {(popupState) => (
                              <>
                                <IconButton {...bindTrigger(popupState)}>
                                  <MoreVertIcon />
                                </IconButton>
                                <Menu {...bindMenu(popupState)}>
                                  <MenuItem
                                    onClick={() =>
                                      handleOpenDialogDeleteUser(
                                        student.employee?.id,
                                        student?.class_rooms_priority
                                          ?.runtime_status,
                                      )
                                    }
                                  >
                                    Gỡ học viên
                                  </MenuItem>
                                </Menu>
                              </>
                            )}
                          </PopupState>
                        </TableCell>
                      </TableRow>
                      <StudentSessionsCollapseRow
                        student={student}
                        sessions={sessions}
                        colSpan={STUDENT_TABLE_HEAD.length}
                        isExpanded={isExpanded}
                        isMarkingAttendance={isMarkingAttendance}
                        onMarkAttendance={handleMarkAttendance}
                      />
                    </Fragment>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
        {isFetching && !isLoading ? (
          <Box
            sx={{
              borderTop: "1px solid",
              borderColor: "divider",
              px: 2,
              py: 1,
              backgroundColor: grey[50],
            }}
          >
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              justifyContent="center"
            >
              <CircularProgress size={16} />
              <Typography variant="caption" color="text.secondary">
                Đang cập nhật danh sách...
              </Typography>
            </Stack>
          </Box>
        ) : null}
      </Box>
      <Pagination
        onChange={handlePageChange}
        total={totalStudents}
        take={PAGE_SIZE}
        value={page}
        name="Học viên"
      />

      <ConfirmDialog
        open={deleteConfirmOpen}
        onClose={() => {
          if (!isDeletingStudents) {
            setDeleteTargetIds([]);
            setDeleteConfirmOpen(false);
          }
        }}
        title={deleteConfirmationTitle}
        content={deleteConfirmationContent}
        action={
          <Button
            variant="contained"
            color="error"
            onClick={handleDeleteUser}
            disabled={
              isDeleteLocked || isDeletingStudents || deleteTargetIds.length === 0
            }
            startIcon={
              isDeletingStudents ? (
                <CircularProgress size={16} color="inherit" />
              ) : undefined
            }
          >
            {isDeletingStudents ? "Đang gỡ..." : "Gỡ học viên"}
          </Button>
        }
      />
    </Stack>
  );
};

export default StudentsSection;
