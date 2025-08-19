import { useState, useEffect, useCallback, useRef } from 'react';

interface UseImageUploadPollingOptions {
  onComplete?: (finalUrl: string) => void;
  onError?: (error: string) => void;
  maxAttempts?: number;
  pollInterval?: number;
}

interface UseImageUploadPollingReturn {
  isPolling: boolean;
  pollProgress: number; // 0-100
  error: string | null;
  startPolling: (pendingUrl: string) => void;
  stopPolling: () => void;
}

/**
 * Custom hook for polling pending image upload status
 * Handles the async image upload flow where we get a pending URL first
 * and need to poll until the final asset URL is ready
 */
export function useImageUploadPolling({
  onComplete,
  onError,
  maxAttempts = 30,
  pollInterval = 2000
}: UseImageUploadPollingOptions = {}): UseImageUploadPollingReturn {
  const [isPolling, setIsPolling] = useState(false);
  const [pollProgress, setPollProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const attemptsRef = useRef(0);
  const abortControllerRef = useRef<AbortController | null>(null);

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsPolling(false);
    setPollProgress(0);
    attemptsRef.current = 0;
  }, []);

  const startPolling = useCallback((pendingUrl: string) => {
    // Reset state
    setIsPolling(true);
    setError(null);
    setPollProgress(0);
    attemptsRef.current = 0;

    // Extract the base URL (remove any leading /api prefix if going through gateway)
    const fullUrl = pendingUrl.startsWith('http') 
      ? pendingUrl 
      : `${window.location.origin}${pendingUrl}`;

    intervalRef.current = setInterval(async () => {
      attemptsRef.current += 1;
      const progress = Math.min((attemptsRef.current / maxAttempts) * 100, 90);
      setPollProgress(progress);

      try {
        // Create new abort controller for this request
        abortControllerRef.current = new AbortController();

        const response = await fetch(fullUrl, {
          method: 'GET',
          signal: abortControllerRef.current.signal,
          // Don't follow redirects automatically - we want to detect them
          redirect: 'manual'
        });

        // Check if we got redirected (upload complete)
        if (response.type === 'opaqueredirect' || response.status === 302 || response.status === 301) {
          // Try to get the redirect location
          const location = response.headers.get('Location');
          if (location) {
            setPollProgress(100);
            stopPolling();
            onComplete?.(location);
            return;
          }
        }

        // Check response body for status
        if (response.ok) {
          const contentType = response.headers.get('content-type');
          
          // If we get an image back, upload is complete
          if (contentType?.startsWith('image/')) {
            setPollProgress(100);
            stopPolling();
            // The pending URL now serves the actual image
            onComplete?.(fullUrl);
            return;
          }

          // Try to parse JSON status response
          if (contentType?.includes('application/json')) {
            const data = await response.json();
            
            // Check various status fields
            if (data.status === 'COMPLETED' || data.uploadStatus === 'COMPLETED') {
              setPollProgress(100);
              stopPolling();
              onComplete?.(data.publicUrl || data.assetUrl || fullUrl);
              return;
            } else if (data.status === 'FAILED' || data.uploadStatus === 'FAILED') {
              const errorMsg = data.errorMessage || 'Upload failed';
              setError(errorMsg);
              stopPolling();
              onError?.(errorMsg);
              return;
            }
            // Still pending, continue polling
          }
        }

        // Check max attempts
        if (attemptsRef.current >= maxAttempts) {
          const timeoutError = 'Upload timeout - please refresh the page';
          setError(timeoutError);
          stopPolling();
          onError?.(timeoutError);
        }
      } catch (err) {
        // Ignore abort errors
        if (err instanceof Error && err.name === 'AbortError') {
          return;
        }
        
        // For other errors, log but continue polling
        console.error('Polling error:', err);
        
        // Stop on too many errors
        if (attemptsRef.current >= maxAttempts) {
          const errorMsg = 'Failed to check upload status';
          setError(errorMsg);
          stopPolling();
          onError?.(errorMsg);
        }
      }
    }, pollInterval);
  }, [maxAttempts, pollInterval, onComplete, onError, stopPolling]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopPolling();
    };
  }, [stopPolling]);

  return {
    isPolling,
    pollProgress,
    error,
    startPolling,
    stopPolling
  };
}