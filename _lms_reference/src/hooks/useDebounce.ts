import { useEffect, useState } from "react";

const useDebounce = <T>(value: T, delay = 3000) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedValue(value);
      clearTimeout(timeoutId);
    }, delay);
    return () => {
      clearTimeout(timeoutId);
    };
  }, [value, delay]);

  return debouncedValue;
};

export default useDebounce;
