import React from 'react';

export const EduroBadge: React.FC = () => (
  // The badge is treated as a protected asset and loaded directly from disk.
  // Ensure 'badge.png' exists in your public folder.
  <img 
    src="/badge.png" 
    alt="Eduro Joulu-osaaja Badge" 
    className="w-full h-full object-contain drop-shadow-md"
  />
);
