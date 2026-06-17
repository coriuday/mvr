"use client";

import { useState, useEffect } from "react";

/**
 * Debounces a value by the specified delay.
 * Useful for search inputs — prevents firing on every keystroke.
 *
 * @example
 *   const search = useDebounce(searchRaw, 300)
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);

  return debounced;
}
