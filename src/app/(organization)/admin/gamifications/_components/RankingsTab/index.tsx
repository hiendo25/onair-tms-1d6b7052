"use client";

import React, { useRef } from "react";
import { Button, InputAdornment, Typography } from "@mui/material";

import DrawerCreateLevelForm, { DrawerCreateLevelFormRef } from "@/modules/ranking/container/DrawerCreateLevelForm";
import ListManageLevels from "@/modules/ranking/container/ListManageLevels";
import PlusIcon from "@/shared/assets/icons/PlusIcon";

const RankingsTab: React.FC = () => {
  const drawerRef = useRef<DrawerCreateLevelFormRef>(null);

  return (
    <>
      <div>
        <Typography component="p" variant="body2">
          Thiết lập danh hiệu tự động theo thành tích.
        </Typography>
      </div>
      <div className="flex items-center mb-6 mt-4">
        <div className="flex-1"></div>
        <Button
          onClick={() => drawerRef.current?.open()}
          className="ml-auto"
          startIcon={
            <InputAdornment position="start">
              <PlusIcon className="fill-white stroke-white" />
            </InputAdornment>
          }
        >
          Thêm mới
        </Button>
      </div>
      <ListManageLevels />
      <DrawerCreateLevelForm ref={drawerRef} />
    </>
  );
};

export default RankingsTab;
