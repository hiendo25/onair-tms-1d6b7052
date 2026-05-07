"use client";
import { useCallback, useMemo, useState } from "react";

export type UseCopyToClipboardReturn = {
  copy: (text: string) => Promise<boolean>;
  copiedText: string | null;
  status: "idle" | "success" | "error";
};

export function useCopyToClipboard(): UseCopyToClipboardReturn {
  const [copiedText, setCopiedText] = useState<UseCopyToClipboardReturn["copiedText"]>(null);
  const [status, setStatus] = useState<UseCopyToClipboardReturn["status"]>("idle");

  const copy: UseCopyToClipboardReturn["copy"] = useCallback(
    async (text) => {
      if (typeof window === "undefined") return false;

      if (!navigator?.clipboard) {
        console.warn("Clipboard not supported");
        setStatus("error");
        return false;
      }

      try {
        await navigator.clipboard.writeText(text);
        setCopiedText(text);
        setStatus("success");
        return true;
      } catch (error) {
        console.warn("Copy failed", error);
        setCopiedText(null);
        setStatus("error");
        return false;
      }
    },
    [setCopiedText, setStatus],
  );

  const memoizedValue = useMemo(() => ({ copy, copiedText, status }), [copy, copiedText, status]);

  return memoizedValue;
}
