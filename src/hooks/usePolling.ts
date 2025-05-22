import { useEffect, useRef } from 'react';

interface PollingOptions {
  enabled?: boolean;
  interval?: number; // milliseconds
  onError?: (error: any) => void;
}

// A hook for polling data at regular intervals
export const usePolling = <T>(
  fetchFunction: () => Promise<T>,
  options: PollingOptions = {}
) => {
  const {
    enabled = true,
    interval = 10000, // Default polling interval: 10 seconds
    onError
  } = options;
  
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  useEffect(() => {
    const poll = async () => {
      try {
        await fetchFunction();
      } catch (error) {
        if (onError) {
          onError(error);
        }
      } finally {
        // Set up the next poll if still enabled
        if (enabled) {
          timeoutRef.current = setTimeout(poll, interval);
        }
      }
    };
    
    // Start polling if enabled
    if (enabled) {
      poll();
    }
    
    // Clean up: cancel any pending timeout when component unmounts
    // or when enabled or interval changes
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [fetchFunction, enabled, interval, onError]);
  
  // Function to manually trigger a fetch
  const refetch = async () => {
    try {
      return await fetchFunction();
    } catch (error) {
      if (onError) {
        onError(error);
      }
      throw error;
    }
  };
  
  return { refetch };
};

export default usePolling; 