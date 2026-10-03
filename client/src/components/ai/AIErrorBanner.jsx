import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaExclamationCircle,
  FaWifi,
  FaKey,
  FaTachometerAlt,
  FaServer,
  FaClock,
  FaRedoAlt,
  FaCog,
  FaTimes,
} from 'react-icons/fa';

/**
 * AIErrorBanner — Premium, context-aware error display for AI operations.
 *
 * Props:
 *   error       (string)   — Error message to display
 *   errorType   (string)   — 'network' | 'auth' | 'rate_limit' | 'service_down' | 'timeout' | 'unknown'
 *   onRetry     (function) — Called when user clicks Retry
 *   onSettings  (function) — Called when user clicks Settings (for auth errors)
 *   onDismiss   (function) — Called when user dismisses the banner
 */
const AIErrorBanner = ({ error, errorType, onRetry, onSettings, onDismiss }) => {
  const [countdown, setCountdown] = useState(0);

  // Countdown timer for rate-limit errors
  useEffect(() => {
    if (errorType === 'rate_limit') {
      setCountdown(30);
    } else {
      setCountdown(0);
    }
  }, [errorType]);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown > 0]);

  if (!error) return null;

  const config = ERROR_CONFIGS[errorType] || ERROR_CONFIGS.unknown;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className={`rounded-xl border px-4 py-3.5 mb-4 ${config.containerClass}`}
        role="alert"
      >
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className={`flex-shrink-0 mt-0.5 ${config.iconClass}`}>
            <config.icon className="h-5 w-5" />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <p className={`text-sm font-semibold ${config.titleClass}`}>
              {config.title}
            </p>
            <p className={`text-sm mt-0.5 ${config.messageClass}`}>
              {error}
            </p>

            {/* Rate-limit countdown */}
            {errorType === 'rate_limit' && countdown > 0 && (
              <p className="text-xs mt-1.5 text-amber-600 flex items-center gap-1.5">
                <FaClock className="h-3 w-3" />
                Auto-retry available in {countdown}s
              </p>
            )}

            {/* Action buttons */}
            <div className="flex items-center gap-2 mt-2.5">
              {onRetry && (
                <button
                  onClick={onRetry}
                  disabled={errorType === 'rate_limit' && countdown > 0}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
                >
                  <FaRedoAlt className="h-2.5 w-2.5" />
                  Retry
                </button>
              )}
              {errorType === 'auth' && onSettings && (
                <button
                  onClick={onSettings}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-blue-50 border border-blue-200 text-blue-700 hover:bg-blue-100 transition-colors shadow-sm"
                >
                  <FaCog className="h-2.5 w-2.5" />
                  AI Settings
                </button>
              )}
            </div>
          </div>

          {/* Dismiss */}
          {onDismiss && (
            <button
              onClick={onDismiss}
              className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors p-0.5"
              aria-label="Dismiss error"
            >
              <FaTimes className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

/**
 * Error type configurations — no emojis, all premium SVG icons.
 */
const ERROR_CONFIGS = {
  network: {
    icon: FaWifi,
    title: 'Network Error',
    containerClass: 'bg-slate-50 border-slate-200',
    iconClass: 'text-slate-500',
    titleClass: 'text-slate-800',
    messageClass: 'text-slate-600',
  },
  auth: {
    icon: FaKey,
    title: 'Authentication Failed',
    containerClass: 'bg-red-50 border-red-200',
    iconClass: 'text-red-500',
    titleClass: 'text-red-800',
    messageClass: 'text-red-600',
  },
  rate_limit: {
    icon: FaTachometerAlt,
    title: 'Rate Limited',
    containerClass: 'bg-amber-50 border-amber-200',
    iconClass: 'text-amber-500',
    titleClass: 'text-amber-800',
    messageClass: 'text-amber-600',
  },
  service_down: {
    icon: FaServer,
    title: 'Service Unavailable',
    containerClass: 'bg-orange-50 border-orange-200',
    iconClass: 'text-orange-500',
    titleClass: 'text-orange-800',
    messageClass: 'text-orange-600',
  },
  timeout: {
    icon: FaClock,
    title: 'Request Timed Out',
    containerClass: 'bg-blue-50 border-blue-200',
    iconClass: 'text-blue-500',
    titleClass: 'text-blue-800',
    messageClass: 'text-blue-600',
  },
  unknown: {
    icon: FaExclamationCircle,
    title: 'Something Went Wrong',
    containerClass: 'bg-gray-50 border-gray-200',
    iconClass: 'text-gray-500',
    titleClass: 'text-gray-800',
    messageClass: 'text-gray-600',
  },
};

export default AIErrorBanner;
