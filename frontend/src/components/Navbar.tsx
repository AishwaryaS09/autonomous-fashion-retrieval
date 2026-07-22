import React from "react";
import { motion } from "framer-motion";

const Navbar: React.FC = () => {
  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="bg-primary-dark fixed top-0 left-0 right-0 z-50 h-[72px] shadow-lg"
    >
      <div className="max-w-[1200px] mx-auto px-8 h-full flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-glow">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <h1 className="text-xl font-semibold text-white tracking-tight">
            FashionAI
          </h1>
        </div>
        <div className="text-xs font-medium text-primary-light tracking-[0.2em] uppercase">
          Cross-Modal Search
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
