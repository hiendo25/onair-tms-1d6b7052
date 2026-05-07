import { useCallback, useEffect, useState } from "react";

import { LocalStorageKey, LocalStorageValue } from "@/constants/localStorage.constant";

type IsObject<T> = T extends object ? (T extends Function ? false : true) : false;

export function useLocalStorage<K extends LocalStorageKey>(storageKey: K, defaultValue?: LocalStorageValue<K>) {
  const readValue = (): LocalStorageValue<K> => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) return defaultValue as LocalStorageValue<K>;
      return JSON.parse(raw) as LocalStorageValue<K>;
    } catch {
      return defaultValue as LocalStorageValue<K>;
    }
  };

  const [value, setValue] = useState<LocalStorageValue<K>>(readValue);

  useEffect(() => {
    setValue(readValue());
  }, [storageKey]);

  const set = useCallback(
    (newValue: LocalStorageValue<K>) => {
      setValue(newValue);
      localStorage.setItem(storageKey, JSON.stringify(newValue));
    },
    [storageKey],
  );

  const setField = useCallback(
    <P extends keyof LocalStorageValue<K>>(
      key: IsObject<LocalStorageValue<K>> extends true ? P : never,
      fieldValue: LocalStorageValue<K>[P],
    ) => {
      setValue((prev) => {
        if (typeof prev !== "object" || prev === null) {
          return prev;
        }

        const updated = {
          ...(prev as Record<string, unknown>),
          [key as string]: fieldValue,
        } as LocalStorageValue<K>;

        localStorage.setItem(storageKey, JSON.stringify(updated));
        return updated;
      });
    },
    [storageKey],
  );

  return {
    value,
    set,
    setField,
  };
}
