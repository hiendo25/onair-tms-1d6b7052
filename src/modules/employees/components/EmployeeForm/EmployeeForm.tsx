"use client";
import * as React from "react";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  TextField,
  Radio,
  RadioGroup,
  FormControlLabel,
  Grid,
  Card,
  CardContent,
  Typography,
  Select,
  MenuItem,
  Checkbox,
  Autocomplete,
} from "@mui/material";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";
import { EmployeeFormSchema, EmployeeFormData } from "./schema";
import { useGetOrganizationUnitsQuery } from "@/modules/organization-units/operations/query";
import { useGetEmployeesQuery } from "@/modules/employees/operations/query";
import { useGetPositionsQuery } from "@/modules/positions/operations/query";
import { useCreatePositionMutation } from "@/modules/positions/operations/mutation";
import { Constants } from "@/types/supabase.types";
import useNotifications from "@/hooks/useNotifications/useNotifications";
import { EMPLOYEE_TYPE_OPTIONS } from "@/utils/employee-type";
import "dayjs/locale/vi";

export interface EmployeeFormProps {
  onSubmit?: (data: EmployeeFormData) => void | Promise<void>;
  isSubmitting?: boolean;
  defaultValues?: Partial<EmployeeFormData>;
  mode?: "create" | "edit";
}

const EmployeeForm: React.FC<EmployeeFormProps> = ({
  onSubmit,
  isSubmitting = false,
  defaultValues,
  mode = "create",
}) => {
  const notifications = useNotifications();

  const { data: organizationUnits, isLoading: isLoadingOrgUnits } = useGetOrganizationUnitsQuery();
  const { data: employeesResult, isLoading: isLoadingEmployees } = useGetEmployeesQuery();
  const { data: positions, isLoading: isLoadingPositions, refetch: refetchPositions } = useGetPositionsQuery();

  const employees = employeesResult?.data || [];

  const { mutateAsync: createPosition, isPending: isCreatingPosition } = useCreatePositionMutation();

  const branches = React.useMemo(
    () => organizationUnits?.filter((unit) => unit.type === Constants.public.Enums.organization_unit_type[0]),
    [organizationUnits],
  );
  const departments = React.useMemo(
    () => organizationUnits?.filter((unit) => unit.type === Constants.public.Enums.organization_unit_type[1]),
    [organizationUnits],
  );

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<EmployeeFormData>({
    defaultValues: {
      email: defaultValues?.email || "",
      full_name: defaultValues?.full_name || "",
      phone_number: defaultValues?.phone_number || undefined,
      gender: defaultValues?.gender || "male",
      birthday: defaultValues?.birthday || null,
      branch: defaultValues?.branch || "",
      department: defaultValues?.department || "",
      employee_code: defaultValues?.employee_code || "",
      manager_id: defaultValues?.manager_id || "",
      position_id: defaultValues?.position_id || "",
      employee_type: defaultValues?.employee_type || undefined,
      start_date: defaultValues?.start_date || "",
    },
    resolver: zodResolver(EmployeeFormSchema),
  });

  const submitForm: SubmitHandler<EmployeeFormData> = async (formData) => {
    await onSubmit?.(formData);
  };

  return (
    <Box component="form" onSubmit={handleSubmit(submitForm)} sx={{ width: "100%", maxWidth: "1200px" }}>
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
            Thông tin nhân viên
          </Typography>

          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="full_name"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <FormControl fullWidth>
                    <FormLabel htmlFor="full_name" sx={{ mb: 1 }}>
                      Họ và tên <span style={{ color: "red" }}>*</span>
                    </FormLabel>
                    <TextField
                      {...field}
                      id="full_name"
                      placeholder="Nhập họ và tên nhân viên"
                      error={!!error}
                      helperText={error?.message}
                      fullWidth
                    />
                  </FormControl>
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="email"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <FormControl fullWidth>
                    <FormLabel htmlFor="email" sx={{ mb: 1 }}>
                      Email <span style={{ color: "red" }}>*</span>
                    </FormLabel>
                    <TextField
                      {...field}
                      id="email"
                      type="email"
                      placeholder="Nhập email"
                      error={!!error}
                      helperText={error?.message}
                      fullWidth
                    />
                  </FormControl>
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth>
                <FormLabel sx={{ mb: 1 }}>Trạng thái</FormLabel>
                <TextField placeholder="Hoạt động" disabled fullWidth helperText="" />
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="gender"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <FormControl fullWidth error={!!error}>
                    <FormLabel sx={{ mb: 1 }}>
                      Giới tính <span style={{ color: "red" }}>*</span>
                    </FormLabel>
                    <RadioGroup {...field} row sx={{ gap: 2 }}>
                      <FormControlLabel value="male" control={<Radio />} label="Nam" />
                      <FormControlLabel value="female" control={<Radio />} label="Nữ" />
                      <FormControlLabel value="other" control={<Radio />} label="Khác" />
                    </RadioGroup>
                    {error && (
                      <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
                        {error.message}
                      </Typography>
                    )}
                  </FormControl>
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="phone_number"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <FormControl fullWidth>
                    <FormLabel htmlFor="phone_number" sx={{ mb: 1 }}>
                      Số điện thoại
                    </FormLabel>
                    <TextField
                      {...field}
                      id="phone_number"
                      type="tel"
                      placeholder="Nhập số điện thoại"
                      error={!!error}
                      helperText={error?.message}
                      fullWidth
                    />
                  </FormControl>
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="birthday"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <FormControl fullWidth>
                    <FormLabel sx={{ mb: 1 }}>Ngày sinh</FormLabel>
                    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="vi">
                      <DatePicker
                        value={field.value ? dayjs(field.value) : null}
                        onChange={(newValue: Dayjs | null) => {
                          field.onChange(newValue ? newValue.format("YYYY-MM-DD") : null);
                        }}
                        slotProps={{
                          textField: {
                            size: "small",
                            placeholder: "Chọn ngày sinh",
                            error: !!error,
                            helperText: error?.message,
                            fullWidth: true,
                          },
                        }}
                      />
                    </LocalizationProvider>
                  </FormControl>
                )}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
            Thông tin công việc
          </Typography>

          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="branch"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <FormControl fullWidth error={!!error}>
                    <FormLabel htmlFor="branch" sx={{ mb: 1 }}>
                      Chi nhánh
                    </FormLabel>
                    <Select {...field} id="branch" displayEmpty disabled={isLoadingOrgUnits}>
                      <MenuItem value="">
                        <em>Chọn chi nhánh</em>
                      </MenuItem>
                      {branches?.map((branch) => (
                        <MenuItem key={branch.id} value={branch.id}>
                          {branch.name}
                        </MenuItem>
                      ))}
                    </Select>
                    {error && (
                      <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
                        {error.message}
                      </Typography>
                    )}
                  </FormControl>
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="department"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <FormControl fullWidth error={!!error}>
                    <FormLabel htmlFor="department" sx={{ mb: 1 }}>
                      Phòng ban <span style={{ color: "red" }}>*</span>
                    </FormLabel>
                    <Select {...field} id="department" displayEmpty disabled={isLoadingOrgUnits}>
                      <MenuItem value="">
                        <em>Chọn phòng ban</em>
                      </MenuItem>
                      {departments?.map((dept) => (
                        <MenuItem key={dept.id} value={dept.id}>
                          {dept.name}
                        </MenuItem>
                      ))}
                    </Select>
                    {error && (
                      <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
                        {error.message}
                      </Typography>
                    )}
                  </FormControl>
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="employee_code"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <FormControl fullWidth>
                    <FormLabel htmlFor="employee_code">Mã nhân viên</FormLabel>
                    <TextField
                      {...field}
                      id="employee_code"
                      placeholder="Hệ thống tạo hoặc bạn có thể tự nhập"
                      error={!!error}
                      helperText={error?.message}
                      fullWidth
                    />
                  </FormControl>
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="manager_id"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <FormControl fullWidth error={!!error}>
                    <FormLabel htmlFor="manager_id" sx={{ mb: 1 }}>
                      Người quản lý <span style={{ color: "red" }}>*</span>
                    </FormLabel>
                    <Select {...field} id="manager_id" displayEmpty disabled={isLoadingEmployees}>
                      <MenuItem value="">
                        <em>Chọn người quản lý</em>
                      </MenuItem>
                      {employees?.map((employee) => (
                        <MenuItem key={employee.id} value={employee.id}>
                          {employee.profiles?.full_name || employee.employee_code}
                        </MenuItem>
                      ))}
                    </Select>
                    {error && (
                      <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
                        {error.message}
                      </Typography>
                    )}
                  </FormControl>
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="employee_type"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <FormControl fullWidth error={!!error}>
                    <FormLabel htmlFor="employee_type" sx={{ mb: 1 }}>
                      Loại nhân viên <span style={{ color: "red" }}>*</span>
                    </FormLabel>
                    <Select {...field} id="employee_type" displayEmpty value={field.value || ""}>
                      <MenuItem value="">
                        <em>Chọn loại nhân viên</em>
                      </MenuItem>
                      {EMPLOYEE_TYPE_OPTIONS.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                    {error && (
                      <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
                        {error.message}
                      </Typography>
                    )}
                  </FormControl>
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="position_id"
                control={control}
                render={({ field: { onChange, value, ...field }, fieldState: { error } }) => {
                  // Find the selected position object
                  const selectedPosition = positions?.find((p) => p.id === value);

                  // Handler for creating new position
                  const handleCreatePosition = async (positionName: string) => {
                    try {
                      const newPosition = await createPosition(positionName);
                      // Refetch positions to update the list
                      await refetchPositions();
                      // Set the new position's UUID as the value
                      onChange(newPosition.id);
                      notifications.show(`Chức danh "${positionName}" đã được tạo thành công!`, {
                        severity: "success",
                        autoHideDuration: 3000,
                      });
                    } catch (error) {
                      notifications.show(error instanceof Error ? error.message : "Không thể tạo chức danh mới", {
                        severity: "error",
                        autoHideDuration: 5000,
                      });
                    }
                  };

                  return (
                    <FormControl fullWidth error={!!error}>
                      <FormLabel htmlFor="position_id" sx={{ mb: 1 }}>
                        Chức danh
                      </FormLabel>
                      <Autocomplete
                        {...field}
                        id="position_id"
                        options={positions || []}
                        getOptionLabel={(option) => {
                          // Handle both position objects and string values
                          if (typeof option === "string") return option;
                          return option.title;
                        }}
                        value={selectedPosition || null}
                        onChange={async (_, newValue) => {
                          if (newValue === null) {
                            onChange("");
                          } else if (typeof newValue === "string") {
                            await handleCreatePosition(newValue);
                          } else {
                            onChange(newValue.id);
                          }
                        }}
                        freeSolo
                        loading={isLoadingPositions || isCreatingPosition}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            placeholder="Chọn hoặc nhập chức danh mới"
                            error={!!error}
                            helperText={error?.message}
                            onKeyDown={async (e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                e.stopPropagation();

                                const inputValue = (e.target as HTMLInputElement).value?.trim();

                                if (inputValue) {
                                  const existingPosition = positions?.find(
                                    (p) => p.title.toLowerCase() === inputValue.toLowerCase(),
                                  );

                                  if (!existingPosition) {
                                    await handleCreatePosition(inputValue);
                                  } else {
                                    onChange(existingPosition.id);
                                  }
                                }
                              }
                            }}
                          />
                        )}
                        isOptionEqualToValue={(option, value) => {
                          return option.id === value?.id;
                        }}
                      />
                    </FormControl>
                  );
                }}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="start_date"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <FormControl fullWidth error={!!error}>
                    <FormLabel sx={{ mb: 1 }}>
                      Ngày bắt đầu làm việc <span style={{ color: "red" }}>*</span>
                    </FormLabel>
                    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="vi">
                      <DatePicker
                        value={field.value ? dayjs(field.value) : null}
                        onChange={(newValue: Dayjs | null) => {
                          field.onChange(newValue ? newValue.format("YYYY-MM-DD") : "");
                        }}
                        slotProps={{
                          textField: {
                            size: "small",
                            placeholder: "Chọn ngày bắt đầu làm việc",
                            error: !!error,
                            helperText: error?.message,
                            fullWidth: true,
                          },
                        }}
                      />
                    </LocalizationProvider>
                  </FormControl>
                )}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
        <Button
          type="submit"
          variant="contained"
          size="large"
          disabled={isSubmitting}
          loading={isSubmitting}
          sx={{ minWidth: 150 }}
        >
          {mode === "create" ? "Tạo nhân viên" : "Cập nhật"}
        </Button>
      </Box>
    </Box>
  );
};

export default React.memo(EmployeeForm);
