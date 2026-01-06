import { useCallback, useRef } from 'react';

export function useDebouncedCallback<T extends (...args: any[]) => any>(
    callback: T,
    delay: number,
    options: {
        leading?: boolean;
        trailing?: boolean;
        maxWait?: number;
    }): [(...args: Parameters<T>) => void, ()=> void, ()=> void] {
        const {
            leading = false,
            trailing = true,
            maxWait
        } = options;
    
    const callbackRef = useRef(callback);
    const timeoutIdRef = useRef<NodeJS.Timeout | null>(null);
    const maxTimeoutIdRef = useRef<NodeJS.Timeout | null>(null);
    const lastCallTimeRef = useRef<number | null>(null);
    const lastArgsRef = useRef<Parameters<T> | null>(null);
    
    callbackRef.current = callback;

    const clearTimeouts = useCallback(() => {
        if (timeoutIdRef.current) {
            clearTimeout(timeoutIdRef.current);
            timeoutIdRef.current = null;
        }
        if (maxTimeoutIdRef.current) {
            clearTimeout(maxTimeoutIdRef.current);
            maxTimeoutIdRef.current = null;
        }
    }, []);

    const flush = useCallback(() => {
        if (lastArgsRef.current) {
            callbackRef.current(...lastArgsRef.current);
            lastArgsRef.current = null;
        }
        clearTimeouts();
    },[clearTimeouts]);

    const cancel = useCallback(() => {
        lastArgsRef.current = null;
        lastCallTimeRef.current = null;
        clearTimeouts();
    },[clearTimeouts]);

    const debounceFunction = useCallback((...args: Parameters<T>) => {
        const now = Date.now();
        lastArgsRef.current = args;
        lastCallTimeRef.current = now;

        if (leading && !timeoutIdRef.current) {
            callbackRef.current(...args);
        }

        if (timeoutIdRef.current) {
            clearTimeout(timeoutIdRef.current);
        }

        timeoutIdRef.current = setTimeout(() => {
            if (trailing && lastArgsRef.current) {
                callbackRef.current(...lastArgsRef.current);
            }
            lastArgsRef.current = null;
            timeoutIdRef.current = null;
            maxTimeoutIdRef.current = null;
        }, delay);

        if (maxWait && !maxTimeoutIdRef.current) {
            maxTimeoutIdRef.current = setTimeout(() => {
                flush();  
            }, maxWait);
        }
    },[delay, leading, trailing, maxWait, flush]);

    return [debounceFunction, cancel, flush];
}