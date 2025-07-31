import { useRef, useCallback } from 'react';

export const useCallbackRef = <T extends (...args: any[]) => any>(fn: T) => {
  const ref = useRef(fn);
  ref.current = fn;

  return useCallback<T>(((...args) => ref.current(...args)) as T, []);
};
