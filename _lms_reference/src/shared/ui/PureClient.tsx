"use client";
import React, { memo, useEffect, useState } from "react";

const PureClient = ({ children }: { children: React.ReactNode }) => {
  const [isMounted, setisMounted] = useState(false);
  useEffect(() => {
    setisMounted(true);
  }, []);
  return isMounted ? children : null;
};
export default memo(PureClient);
