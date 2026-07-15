import React from "react";

const LoadingState: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="w-12 h-12 border-4 border-fashion-200 border-t-fashion-600 rounded-full animate-spin mb-4" />
      <p className="text-gray-500 text-sm">Searching fashion catalog...</p>
    </div>
  );
};

export default LoadingState;
