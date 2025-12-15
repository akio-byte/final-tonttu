import React from 'react';

export const EduroBadge: React.FC = () => (
  // The badge is treated as a protected asset and loaded directly from disk.
  // Using the new Joulu-osaaja badge.
  <img 
    src="/assets/joulu-osaaja.png" 
    alt="Eduro Joulu-osaaja Badge" 
    className="w-full h-full object-contain drop-shadow-md"
  />
);