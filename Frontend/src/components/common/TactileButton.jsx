import React from 'react';

export default function TactileButton({ children, className = '', ...props }) {
  return (
    <button
      className={`transition-all active:scale-[0.97] active:-translate-y-[0.5px] cursor-pointer ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
