import { useState, useMemo } from 'react';
import { useDebounce } from './useDebounce';

interface UseDebouncedSearchOptions {
  delay?: number;
  minLength?: number;
}

export function useDebouncedSearch(
  initialValue: string = '',
  options: UseDebouncedSearchOptions = {}
) {
  const { delay = 300, minLength = 0 } = options;
  const [searchTerm, setSearchTerm] = useState(initialValue);
  const debouncedSearchTerm = useDebounce(searchTerm, delay);

  const isSearchValid = useMemo(() => 
    debouncedSearchTerm.length >= minLength,
    [debouncedSearchTerm, minLength]
  );

  const reset = () => {
    setSearchTerm('');
  };

  return {
    searchTerm,
    setSearchTerm,
    debouncedSearchTerm,
    isSearchValid,
    reset
  };
}