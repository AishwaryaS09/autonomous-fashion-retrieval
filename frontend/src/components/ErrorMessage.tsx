import React from "react";
import { motion } from "framer-motion";

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, onRetry }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="bg-red-50 border border-red-200/60 rounded-2xl p-6 text-center max-w-[80%] mx-auto"
    >
      <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
        <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <p className="text-primary-dark text-sm font-medium">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="mt-4 btn-primary text-xs px-5 py-2.5">
          Try Again
        </button>
      )}
    </motion.div>
  );
};

export default ErrorMessage;
