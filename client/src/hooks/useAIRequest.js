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
  const [errorType, setErrorType] = useState(null);
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
    setErrorType(null);
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
        setErrorType('network');
        setIsLoading(false);
        throw new Error(err);
      }

      if (config.documentReady === false) {
        const err = "Document is not ready for processing.";
        setPreflightState(prev => ({ ...prev, status: 'error', error: err, checks: { ...prev.checks, document_ready: false } }));
        setError(err);
        setErrorType('unknown');
        setIsLoading(false);
        throw new Error(err);
      }

      // Preflight with timeout + one retry on rate-limit
      const runPreflight = async (isRetry = false) => {
        const timeoutMs = 10000;
        const preflightController = new AbortController();
        const timeoutId = setTimeout(() => preflightController.abort(), timeoutMs);
        // Link to parent: if user cancels the outer request, also abort preflight
        const onParentAbort = () => preflightController.abort();
        controller.signal.addEventListener('abort', onParentAbort);

        try {
          const preflightRes = await apiFetch(API_ENDPOINTS.preflight, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ required_capability: config.requiredCapability || null }),
            signal: preflightController.signal
          });
          clearTimeout(timeoutId);
          controller.signal.removeEventListener('abort', onParentAbort);
          return await preflightRes.json();
        } catch (fetchErr) {
          clearTimeout(timeoutId);
          controller.signal.removeEventListener('abort', onParentAbort);
          if (fetchErr.name === 'AbortError') {
            throw new Error('AI service is not responding (preflight timed out).');
          }
          throw fetchErr;
        }
      };

      try {
        let preflightData = await runPreflight();

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

        // Auto-retry once on rate-limit
        if (!preflightData.is_ready && preflightData.rate_limit_ok === false) {
          setPreflightState(prev => ({
            ...prev,
            status: 'checking',
            error: 'Rate limited. Retrying in 3s...'
          }));
          await new Promise(resolve => setTimeout(resolve, 3000));
          preflightData = await runPreflight(true);
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
        }

        if (!preflightData.is_ready) {
          let errorMsg = preflightData.error || "AI Provider is not ready.";
          let eType = 'unknown';
          if (!preflightData.authentication_valid) {
            errorMsg = "Authentication failed. Check your AI Settings.";
            eType = 'auth';
          } else if (!preflightData.rate_limit_ok) {
            errorMsg = "Rate limit exceeded. Please wait a moment.";
            eType = 'rate_limit';
          } else if (!preflightData.provider_healthy) {
            errorMsg = "AI provider is currently unavailable.";
            eType = 'service_down';
          }

          setPreflightState(prev => ({
            ...prev,
            status: 'error',
            error: errorMsg,
            suggestion: eType === 'auth'
              ? "Verify your API key in AI Settings."
              : eType === 'rate_limit'
              ? "Try switching to a different model, or wait a moment."
              : "Check that the AI service is running."
          }));
          setError(errorMsg);
          setErrorType(eType);
          setIsLoading(false);
          throw new Error(errorMsg);
        }

        // Preflight Success
        setPreflightState(prev => ({ ...prev, status: 'success' }));
        // Brief pause so the user sees the green success state before proceeding
        await new Promise(resolve => setTimeout(resolve, 800));
        setPreflightState(prev => ({ ...prev, isVisible: false }));

        // Auto-clear preflight state after 4s
        setTimeout(() => setPreflightState(null), 4000);

      } catch (err) {
        if (err.name === 'AbortError') {
          return null; // aborted
        }
        
        const errStr = err.message === 'PAID_CONSENT_REQUIRED' ? err.message : (err.message || "Failed to reach AI service for preflight check.");
        if (errStr === 'PAID_CONSENT_REQUIRED') {
          setPreflightState(prev => ({ ...prev, status: 'error', error: "Paid model consent required." }));
          setErrorType('rate_limit');
          throw err;
        }

        // Classify the error
        let eType = 'unknown';
        const errLower = errStr.toLowerCase();
        if (errLower.includes('timeout') || errLower.includes('not responding')) {
          eType = 'timeout';
        } else if (errLower.includes('network') || errLower.includes('fetch') || errLower.includes('econnrefused')) {
          eType = 'service_down';
        }

        setPreflightState(prev => ({
          ...prev,
          status: 'error',
          error: errStr,
          checks: { ...prev?.checks, provider_healthy: false }
        }));
        setError(errStr);
        setErrorType(eType);
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
      const errMsg = err.message || 'Network interruption or API failure.';
      setError(errMsg);

      // Classify error type from the HTTP response
      const errLower = errMsg.toLowerCase();
      if (errLower.includes('401') || errLower.includes('unauthorized') || errLower.includes('authentication')) {
        setErrorType('auth');
      } else if (errLower.includes('429') || errLower.includes('rate limit') || errLower.includes('rate_limit')) {
        setErrorType('rate_limit');
      } else if (errLower.includes('503') || errLower.includes('not running') || errLower.includes('econnrefused')) {
        setErrorType('service_down');
      } else if (errLower.includes('timeout')) {
        setErrorType('timeout');
      } else if (errLower.includes('network') || errLower.includes('fetch')) {
        setErrorType('network');
      } else {
        setErrorType('unknown');
      }

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
    errorType,
    data,
    preflightState,
    setError,
    setErrorType,
    setIsLoading // Exposed if manual override is needed
  };
}
