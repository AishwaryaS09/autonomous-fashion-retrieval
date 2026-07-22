import React from "react";
import { motion } from "framer-motion";
import type { SearchTab } from "../types/search";

interface SearchTabsProps {
  activeTab: SearchTab;
  onTabChange: (tab: SearchTab) => void;
}

const tabs: { id: SearchTab; label: string; icon: JSX.Element }[] = [
  {
    id: "text",
    label: "Text Search",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    ),
  },
  {
    id: "image",
    label: "Image Search",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    id: "sketch",
    label: "Sketch Search",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
      </svg>
    ),
  },
];

const SearchTabs: React.FC<SearchTabsProps> = ({ activeTab, onTabChange }) => {
  return (
    <div className="grid grid-cols-3 gap-4 mb-8">
      {tabs.map((tab) => (
        <motion.button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={`relative flex flex-col items-center justify-center gap-2.5 py-6 rounded-2xl font-medium text-sm transition-all duration-300 ${
            activeTab === tab.id
              ? "bg-primary text-white shadow-glow"
              : "bg-surface text-primary-dark/50 border-2 border-gray-100 hover:border-primary-lighter hover:text-primary-dark/80"
          }`}
        >
          <span className={`${activeTab === tab.id ? "text-white" : "text-primary-light"}`}>
            {tab.icon}
          </span>
          {tab.label}
        </motion.button>
      ))}
    </div>
  );
};

export default SearchTabs;
