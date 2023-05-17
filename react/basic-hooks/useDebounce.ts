import lodash from "lodash";
import { useMemo } from "react";

export function useDebounce<T extends (...args: any) => any>(fn: T, debounceMs?: number): T {
    return useMemo(() => debounceMs > 0 ? lodash.debounce(fn, debounceMs) : fn, [debounceMs]) as T
}