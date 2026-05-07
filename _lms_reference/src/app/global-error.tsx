"use client";

import { Button } from "@mui/material";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <div className="mb-3">
          <h2>Something went wrong!</h2>
        </div>
        <div>
          <Button onClick={() => reset()}>Try again</Button>
        </div>
      </div>
    </div>
  );
}
