import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const PreflightIndicator = ({ preflightState }) => {
  if (!preflightState || !preflightState.isVisible) return null;

  const { status, checks, error, suggestion } = preflightState;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="fixed bottom-6 right-6 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50 font-sans"
      >
        <div className="p-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex justify-between items-center">
          <h3 className="font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2">
            <span className="text-blue-500">
              {status === 'checking' && (
                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              {status === 'success' && '✅'}
              {status === 'error' && '❌'}
            </span>
            AI Readiness Check
          </h3>
        </div>
        
        <div className="p-4 space-y-2 text-sm text-gray-600 dark:text-gray-300">
          <CheckItem label="Internet Connected" status={checks?.network} />
          <CheckItem label="Provider Healthy" status={checks?.provider_healthy} />
          <CheckItem label="Authentication Valid" status={checks?.authentication_valid} />
          <CheckItem label="Model Available" status={checks?.model_available} />
          <CheckItem label="Rate Limit OK" status={checks?.rate_limit_ok} />
          <CheckItem label="Document Ready" status={checks?.document_ready} />
          
          {error && (
            <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-xs break-words">
              <strong>Error:</strong> {error}
            </div>
          )}
          
          {suggestion && (
            <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg text-xs break-words">
              <strong>Suggestion:</strong> {suggestion}
            </div>
          )}
        </div>
        
        {status === 'success' && (
          <div className="p-2 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-center text-xs font-medium">
            Ready to Process
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

const CheckItem = ({ label, status }) => {
  let icon = '⏳';
  if (status === true) icon = '✓';
  if (status === false) icon = '✗';
  
  return (
    <div className="flex items-center gap-2">
      <span className={`w-4 text-center font-bold ${
        status === true ? 'text-green-500' : 
        status === false ? 'text-red-500' : 'text-gray-400'
      }`}>
        {icon}
      </span>
      <span className={status === false ? 'text-red-600 dark:text-red-400 font-medium' : ''}>
        {label}
      </span>
    </div>
  );
};

export default PreflightIndicator;
