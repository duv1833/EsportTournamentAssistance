import React from 'react';

const variants = {
  primary: 'bg-primary-red text-off-white hover:bg-primary-red/90 glow-active',
  secondary: 'bg-surface-bright text-off-white hover:bg-surface-bright/80',
  danger: 'bg-red-500 text-off-white hover:bg-red-600',
  ghost: 'bg-transparent text-tactical-gray hover:text-off-white hover:bg-white/5 border border-transparent hover:border-outline-variant',
  cyan: 'bg-success-cyan text-background hover:brightness-110 shadow-[0_0_10px_rgba(0,255,209,0.3)]',
  outline: 'bg-transparent border border-outline-variant text-off-white hover:border-primary-red hover:bg-primary-red/10',
};

const sizes = {
  sm: 'text-xs px-3 py-1.5',
  md: 'text-sm px-6 py-2.5',
  lg: 'text-lg px-8 py-3.5',
};

export default function TactileButton({ 
  children, 
  className = '', 
  variant, 
  size, 
  ...props 
}) {
  const baseClasses = "transition-all active:scale-[0.97] active:-translate-y-[0.5px] cursor-pointer font-display uppercase tracking-wider font-bold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variantClass = variant ? variants[variant] : '';
  const sizeClass = size ? sizes[size] : '';
  
  const finalClassName = variant || size 
    ? `${baseClasses} ${variantClass} ${sizeClass} clip-corner ${className}`
    : `transition-all active:scale-[0.97] active:-translate-y-[0.5px] cursor-pointer ${className}`;

  return (
    <button
      className={finalClassName}
      {...props}
    >
      {children}
    </button>
  );
}
