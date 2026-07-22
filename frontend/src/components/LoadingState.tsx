import React from "react";
import { motion } from "framer-motion";

const LoadingState: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center justify-center py-20"
    >
      <div className="relative w-16 h-16 mb-5">
        <div className="absolute inset-0 border-4 border-primary-lighter rounded-full" />
        <div className="absolute inset-0 border-4 border-transparent border-t-primary rounded-full animate-spin" />
      </div>
      <p className="text-primary-dark/40 text-sm font-medium">Searching fashion catalog...</p>
    </motion.div>
  );
};

export default LoadingState;
