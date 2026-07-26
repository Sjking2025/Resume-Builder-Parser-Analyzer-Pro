import { useState, useRef, useCallback, useEffect } from 'react';
import { apiFetch, API_ENDPOINTS } from '../config/api';

/**
 * useAIRequest - A custom hook for reliable AI API requests.
 * Features:
 * - Prevents overlapping duplicate requests via AbortController.
 * - Manages loading, success, and error states.
 * - Handles JSON parsing safely.
 * - Normalizes error extraction.
 */
export function useAIRequest() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [preflightState, setPreflightState] = useState(null);
  const abortControllerRef = useRef(null);

  const cancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsLoading(false);
    }
  }, []);

  const execute = useCallback(async (url, options = {}, config = {}) => {
    // 1. Cancel any previous overlapping request
    cancel();

    // 2. Setup AbortController for current request
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setIsLoading(true);
    setError(null);
    setPreflightState(null);

    const returnRaw = config.returnRaw ?? false;
    const skipPreflight = config.skipPreflight ?? false;

    // --- PREFLIGHT VALIDATION LAYER ---
    if (!skipPreflight) {
      setPreflightState({
        isVisible: true,
        status: 'checking',
        checks: {
          network: navigator.onLine,
          document_ready: config.documentReady !== false
        },
        error: null
      });

      if (!navigator.onLine) {
        const err = "No internet connection detected.";
        setPreflightState(prev => ({ ...prev, status: 'error', error: err, checks: { ...prev.checks, network: false } }));
        setError(err);
        setIsLoading(false);
        throw new Error(err);
      }

      if (config.documentReady === false) {
        const err = "Document is not ready for processing.";
        setPreflightState(prev => ({ ...prev, status: 'error', error: err, checks: { ...prev.checks, document_ready: false } }));
        setError(err);
        setIsLoading(false);
        throw new Error(err);
      }

      try {
        const preflightRes = await apiFetch(API_ENDPOINTS.preflight, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ required_capability: config.requiredCapability || null }),
          signal: controller.signal
        });

        const preflightData = await preflightRes.json();

        setPreflightState(prev => ({
          ...prev,
          checks: {
            ...prev.checks,
            provider_healthy: preflightData.provider_healthy,
            model_available: preflightData.model_available,
            rate_limit_ok: preflightData.rate_limit_ok,
            authentication_valid: preflightData.authentication_valid
          }
        }));

        if (!preflightData.is_ready) {
          let errorMsg = preflightData.error || "AI Provider is not ready.";
          if (!preflightData.authentication_valid) {
            errorMsg = "Authentication failed. Check your AI Settings.";
          } else if (!preflightData.rate_limit_ok) {
            errorMsg = "Rate limit exceeded for the selected model.";
          }

          setPreflightState(prev => ({
            ...prev,
            status: 'error',
            error: errorMsg,
            suggestion: "Try switching to a different AI provider/model in Settings, or wait a moment."
          }));
          setError(errorMsg);
          setIsLoading(false);
          throw new Error(errorMsg);
        }

        // Preflight Success
        setPreflightState(prev => ({ ...prev, status: 'success' }));
        // Brief pause so the user sees the green success state before proceeding
        await new Promise(resolve => setTimeout(resolve, 800));
        setPreflightState(prev => ({ ...prev, isVisible: false }));

      } catch (err) {
        if (err.name === 'AbortError') {
          return null; // aborted
        }
        
        const errStr = err.message === 'PAID_CONSENT_REQUIRED' ? err.message : "Failed to reach AI service for preflight check.";
        if (errStr === 'PAID_CONSENT_REQUIRED') {
          setPreflightState(prev => ({ ...prev, status: 'error', error: "Paid models consent required to continue." }));
          throw err;
        }

        setPreflightState(prev => ({
          ...prev,
          status: 'error',
          error: errStr,
          checks: { ...prev.checks, provider_healthy: false }
        }));
        setError(errStr);
        setIsLoading(false);
        throw err;
      }
    }
    // --- END PREFLIGHT ---

    try {
      const response = await apiFetch(url, {
        ...options,
        signal: controller.signal,
      });

      if (!response.ok) {
        // Attempt to parse JSON error message safely
        let errorMsg = 'An unknown error occurred.';
        try {
          const errorData = await response.json();
          errorMsg = errorData.error || errorData.detail || errorData.message || `HTTP Error ${response.status}`;
        } catch {
          errorMsg = `HTTP Error ${response.status}: ${response.statusText}`;
        }
        throw new Error(errorMsg);
      }

      // If returning the raw response (e.g. for streaming via body.getReader())
      if (returnRaw) {
        setIsLoading(false);
        return response;
      }

      // Parse JSON safely
      let resultData;
      try {
        resultData = await response.json();
      } catch {
        throw new Error('Failed to parse AI response. The data might be corrupted.');
      }

      setData(resultData);
      return resultData;
    } catch (err) {
      if (err.name === 'AbortError') {
        console.log('AI Request cancelled.');
        // Don't set error state if intentionally aborted
        return null;
      }
      console.error('AI Request Error:', err);
      setError(err.message || 'Network interruption or API failure.');
      throw err; // Re-throw to allow component-level handling if needed
    } finally {
      // Ensure we don't clear loading state if another request was just fired
      if (abortControllerRef.current === controller) {
        setIsLoading(false);
        abortControllerRef.current = null;
      }
    }
  }, [cancel]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cancel();
    };
  }, [cancel]);

  return {
    execute,
    cancel,
    isLoading,
    error,
    data,
    preflightState,
    setError,
    setIsLoading // Exposed if manual override is needed
  };
}
