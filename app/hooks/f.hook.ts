import { DependencyList, useCallback } from "react";

/**
 * Alias for `useCallback` hook.
 *
 * @param callback - The callback function.
 * @param deps - The dependencies array.
 * @returns The memoized callback function.
 */
export function f<T extends Function>(
  callback: T,
  deps: DependencyList = []
): T {
  return useCallback(callback, deps);
}
