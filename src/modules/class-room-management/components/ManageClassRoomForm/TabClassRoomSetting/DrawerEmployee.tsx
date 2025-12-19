import * as React from "react";
import {
  Checkbox,
  Chip,
  FilledInput,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Toolbar,
  Typography,
} from "@mui/material";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import SwipeableDrawer, { SwipeableDrawerProps } from "@mui/material/SwipeableDrawer";

import useGetEmployeeQuery from "@/modules/class-room-management/operation/query";
import { useUserOrganization } from "@/modules/organization";
import { CloseIcon, SearchIcon } from "@/shared/assets/icons";
import Avatar from "@/shared/ui/Avatar";
type Anchor = "top" | "left" | "bottom" | "right";

interface DrawerEmployeeProps {
  open?: boolean;
  onClose?: () => void;
  onOpenChange: () => void;
  onOk?: () => void;
}
const DrawerEmployee: React.FC<DrawerEmployeeProps> = ({ open, onClose, onOk, onOpenChange }) => {
  const currentOrg = useUserOrganization((state) => state.currentOrganization);
  const { data: employeeData, error } = useGetEmployeeQuery({
    enabled: true,
    queryParams: { page: 1, pageSize: 20, organizationId: currentOrg.orgId },
  });

  const employeeList = React.useMemo(() => employeeData?.data || [], [employeeData]);
  const handleClose: SwipeableDrawerProps["onClose"] = () => {
    onClose?.();
  };
  const handleOpen: SwipeableDrawerProps["onOpen"] = () => {
    onOpenChange?.();
  };

  const list = (anchor: Anchor) => (
    <Box
      sx={{ width: anchor === "top" || anchor === "bottom" ? "auto" : 860 }}
      role="presentation"
      onClick={handleClose}
      onKeyDown={handleClose}
    >
      <List>
        {employeeList.map((emp) => (
          <EmployeeItem
            key={emp.id}
            fullName={emp.profiles.full_name}
            code={emp.employee_code}
            email={emp.profiles.email}
            avatar={emp.profiles.avatar}
          />
        ))}
      </List>
    </Box>
  );
  return (
    <SwipeableDrawer className="drawer-employee" anchor="right" open={open} onClose={handleClose} onOpen={handleOpen}>
      <div className="relative h-screen overflow-hidden">
        <div className="drawer-employee-header">
          <Toolbar sx={{ justifyContent: "space-between", borderBottom: "1px solid", borderColor: "#f1f1f1" }}>
            <Typography sx={{ fontWeight: "bold" }}>Thêm học viên</Typography>
            <IconButton>
              <CloseIcon />
            </IconButton>
          </Toolbar>
          <Toolbar>
            <form className="w-full">
              <div className="flex justify-between">
                <div className="flex-1">
                  <FilledInput
                    placeholder="Tìm kiếm..."
                    endAdornment={<SearchIcon />}
                    size="small"
                    sx={{ minWidth: 280 }}
                  />
                </div>
                <div className="flex items-center gap-3 w-fit">
                  <FormControl sx={{ minWidth: "140px" }} variant="filled" size="small">
                    <InputLabel id="demo-simple-select-label">Chi nhánh</InputLabel>
                    <Select
                    // onChange={handleChange}
                    >
                      <MenuItem value={10}>Ten</MenuItem>
                      <MenuItem value={20}>Twenty</MenuItem>
                      <MenuItem value={30}>Thirty</MenuItem>
                    </Select>
                  </FormControl>
                  <FormControl sx={{ minWidth: "140px" }} variant="filled" size="small">
                    <InputLabel id="demo-simple-select-label">Chi nhánh</InputLabel>
                    <Select

                    // onChange={handleChange}
                    >
                      <MenuItem value={10}>Ten</MenuItem>
                      <MenuItem value={20}>Twenty</MenuItem>
                      <MenuItem value={30}>Thirty</MenuItem>
                    </Select>
                  </FormControl>
                  <FormControl sx={{ minWidth: "140px" }} variant="filled" size="small">
                    <InputLabel id="demo-simple-select-label">Vai trò</InputLabel>
                    <Select

                    // onChange={handleChange}
                    >
                      <MenuItem value={10}>Ten</MenuItem>
                      <MenuItem value={20}>Twenty</MenuItem>
                      <MenuItem value={30}>Thirty</MenuItem>
                    </Select>
                  </FormControl>
                </div>
              </div>
            </form>
          </Toolbar>
        </div>
        <Box className="drawer-employee-list" sx={{ height: "calc(100vh - 192px)", overflowY: "auto" }}>
          {list("right")}
        </Box>
        <Toolbar
          sx={(theme) => ({
            borderTop: "1px solid",
            borderColor: theme.palette.grey[300],
            boxShadow: "10px 10px 10px 10px rgb(255,255,255,30%)",
          })}
        >
          <div className="buttons inline-flex items-center gap-2 ml-auto w-fit">
            <Button variant="outlined" sx={{ width: 120 }}>
              Huỷ
            </Button>
            <Button sx={{ width: 120 }}>Xác nhận</Button>
          </div>
        </Toolbar>
      </div>
    </SwipeableDrawer>
  );
};

export default DrawerEmployee;

interface EmployeeItemProps {
  fullName: string;
  email: string;
  avatar?: string | null;
  code?: string;
  onClick?: () => void;
  isSelected?: boolean;
}
const EmployeeItem: React.FC<EmployeeItemProps> = ({ fullName, email, avatar, code, onClick, isSelected }) => {
  return (
    <ListItemButton role="listitem" onClick={onClick} sx={{ paddingInline: 1, borderRadius: 1 }}>
      <div className="flex items-center gap-2 flex-1">
        <div className="avatar w-8 h-8 rounded-full overflow-hidden bg-gray-50">
          <Avatar src={avatar} alt={fullName} />
        </div>
        <div>
          <Typography sx={{ fontWeight: 600 }}>{fullName}</Typography>
        </div>
        <Typography sx={{ fontSize: "0.875rem", color: "text.secondary" }}>{email}</Typography>
        <Chip label={code} color="primary" variant="outlined" />
      </div>
      <ListItemIcon>
        <Checkbox checked={isSelected} tabIndex={-1} disableRipple />
      </ListItemIcon>
    </ListItemButton>
  );
};
