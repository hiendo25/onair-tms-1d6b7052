"use client";
import React from "react";
import { useRef } from "react";
import { Button, InputAdornment } from "@mui/material";

import DrawerCreateLevelForm, { DrawerCreateLevelFormRef } from "@/modules/ranking/container/DrawerCreateLevelForm";
import PlusIcon from "@/shared/assets/icons/PlusIcon";

interface ButtonCreateLevelProps {}
const ButtonCreateLevel: React.FC<ButtonCreateLevelProps> = () => {
  const drawerRef = useRef<DrawerCreateLevelFormRef>(null);

  return (
    <>
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
      <DrawerCreateLevelForm ref={drawerRef} />
    </>
  );
};
export default ButtonCreateLevel;
