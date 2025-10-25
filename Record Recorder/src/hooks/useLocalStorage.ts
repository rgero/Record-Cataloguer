import { useEffect, useState } from "react";

export const useLocalStorage = <T,>(key: string, initialState: T): [T, (value: T | ((prev: T) => T)) => void] => {
  const [value, setValue] = useState<T>(() => {
    const storedValue = localStorage.getItem(key);
    return storedValue ? JSON.parse(storedValue) : initialState;
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [value, key]);

  return [value, setValue];
};
