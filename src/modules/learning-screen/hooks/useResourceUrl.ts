import { useEffect, useState } from "react";
import type { ResourceRow } from "@/modules/learning-screen/types";
import { getSignedResourceUrl } from "@/modules/learning-screen/utils/resource";

interface UseResourceUrlResult {
  url: string | null;
  isLoading: boolean;
  error: string | null;
}

export const useResourceUrl = (resource: ResourceRow | null | undefined): UseResourceUrlResult => {
  const [state, setState] = useState<UseResourceUrlResult>({
    url: null,
    isLoading: false,
    error: null,
  });

  useEffect(() => {
    let active = true;

    if (!resource) {
      setState({
        url: null,
        isLoading: false,
        error: null,
      });
      return () => {
        active = false;
      };
    }

    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    getSignedResourceUrl(resource)
      .then((url) => {
        if (!active) return;
        setState({
          url,
          isLoading: false,
          error: url ? null : "Không thể tạo liên kết tải tệp",
        });
      })
      .catch((err) => {
        if (!active) return;
        setState({
          url: null,
          isLoading: false,
          error: err instanceof Error ? err.message : "Không thể tạo liên kết tải tệp",
        });
      });

    return () => {
      active = false;
    };
  }, [resource]);

  return state;
};
