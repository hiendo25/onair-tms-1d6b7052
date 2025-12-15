"use client";

import { useEffect } from "react";
import { Button } from "@mui/material";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <div className="mb-3">
          <h2>Có lỗi xảy ra!</h2>
        </div>
        <div>
          <Button onClick={() => reset()}>Thử lại</Button>
        </div>
      </div>
    </div>
  );
}
