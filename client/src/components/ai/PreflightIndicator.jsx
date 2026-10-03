import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaCheckCircle,
  FaTimesCircle,
  FaSpinner,
  FaWifi,
  FaServer,
  FaKey,
  FaCubes,
  FaTachometerAlt,
  FaFileAlt,
  FaTimes,
  FaShieldAlt,
} from 'react-icons/fa';

/**
 * PreflightIndicator — Industry-standard AI readiness check panel.
 *
 * Features:
 * - Staggered check animation (items appear sequentially)
 * - Color-coded header (blue=checking, green=success, red=error)
 * - Auto-dismiss after 3s on success
 * - Dismiss button (X)
 * - No emojis — premium SVG icons throughout
 */
const PreflightIndicator = ({ preflightState }) => {
  const [dismissed, setDismissed] = useState(false);

  // Reset dismissed state when a new preflight check starts
  useEffect(() => {
    if (preflightState?.isVisible && preflightState?.status === 'checking') {
      setDismissed(false);
    }
  }, [preflightState?.isVisible, preflightState?.status]);

  // Auto-dismiss after success
  useEffect(() => {
    if (preflightState?.status === 'success') {
      const timer = setTimeout(() => setDismissed(true), 3000);
      return () => clearTimeout(timer);
    }
  }, [preflightState?.status]);

  if (!preflightState || !preflightState.isVisible || dismissed) return null;

  const { status, checks, error, suggestion } = preflightState;

  // Header color scheme
  const headerStyles = {
    checking: 'bg-blue-600',
    success: 'bg-emerald-600',
    error: 'bg-red-600',
  };

  const headerLabels = {
    checking: 'Validating AI Readiness',
    success: 'System Ready',
    error: 'Readiness Check Failed',
  };

  const checkItems = [
    { key: 'network', label: 'Network Connection', icon: FaWifi, status: checks?.network },
    { key: 'provider_healthy', label: 'Provider Status', icon: FaServer, status: checks?.provider_healthy },
    { key: 'authentication_valid', label: 'Authentication', icon: FaKey, status: checks?.authentication_valid },
    { key: 'model_available', label: 'Model Availability', icon: FaCubes, status: checks?.model_available },
    { key: 'rate_limit_ok', label: 'Rate Limit', icon: FaTachometerAlt, status: checks?.rate_limit_ok },
    { key: 'document_ready', label: 'Document Ready', icon: FaFileAlt, status: checks?.document_ready },
  ];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="fixed bottom-6 right-6 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50 font-sans"
      >
        {/* Header */}
        <div className={`px-4 py-3 flex items-center justify-between text-white transition-colors duration-300 ${headerStyles[status] || headerStyles.checking}`}>
          <div className="flex items-center gap-2">
            {status === 'checking' && (
              <FaSpinner className="h-4 w-4 animate-spin" />
            )}
            {status === 'success' && (
              <FaShieldAlt className="h-4 w-4" />
            )}
            {status === 'error' && (
              <FaTimesCircle className="h-4 w-4" />
            )}
            <span className="font-semibold text-sm">{headerLabels[status] || 'Checking'}</span>
          </div>
          <button
            onClick={() => setDismissed(true)}
            className="text-white/60 hover:text-white transition-colors p-0.5"
            aria-label="Dismiss readiness check"
          >
            <FaTimes className="h-3 w-3" />
          </button>
        </div>

        {/* Check Items */}
        <div className="p-3 space-y-1.5">
          {checkItems.map((item, index) => (
            <motion.div
              key={item.key}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: status === 'checking' ? index * 0.1 : 0, duration: 0.2 }}
            >
              <CheckItem
                label={item.label}
                icon={item.icon}
                status={item.status}
              />
            </motion.div>
          ))}

          {/* Error message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-2 p-2.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-xs break-words border border-red-100 dark:border-red-800"
            >
              <div className="flex items-start gap-1.5">
                <FaTimesCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            </motion.div>
          )}

          {/* Suggestion */}
          {suggestion && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mt-1.5 p-2.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg text-xs break-words border border-blue-100 dark:border-blue-800"
            >
              {suggestion}
            </motion.div>
          )}
        </div>

        {/* Compact success footer */}
        {status === 'success' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="px-3 py-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 text-center text-xs font-medium flex items-center justify-center gap-1.5 border-t border-emerald-100 dark:border-emerald-800"
          >
            <FaCheckCircle className="h-3 w-3" />
            All systems operational
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

/**
 * CheckItem — Single check row with icon, label, and status indicator.
 */
const CheckItem = ({ label, icon: Icon, status }) => {
  return (
    <div className="flex items-center gap-2.5 py-1 px-1">
      {/* Status indicator */}
      <div className="w-4 flex items-center justify-center flex-shrink-0">
        {status === true && (
          <FaCheckCircle className="h-3.5 w-3.5 text-emerald-500" />
        )}
        {status === false && (
          <FaTimesCircle className="h-3.5 w-3.5 text-red-500" />
        )}
        {status == null && (
          <div className="h-3 w-3 border-2 border-gray-300 dark:border-gray-600 border-t-transparent rounded-full animate-spin" />
        )}
      </div>

      {/* Icon + Label */}
      <Icon className={`h-3 w-3 flex-shrink-0 ${
        status === true ? 'text-emerald-500' :
        status === false ? 'text-red-500' : 'text-gray-400'
      }`} />
      <span className={`text-sm ${
        status === false
          ? 'text-red-600 dark:text-red-400 font-medium'
          : 'text-gray-600 dark:text-gray-300'
      }`}>
        {label}
      </span>
    </div>
  );
};

export default PreflightIndicator;
