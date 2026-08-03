import React from 'react';

const variants = {
  default: '',
  primary: 'bg-primary-red text-off-white hover:brightness-110 font-display uppercase font-bold clip-corner glow-active',
  secondary: 'bg-surface-bright text-off-white hover:bg-surface-bright/80 font-display uppercase',
  cyan: 'bg-success-cyan text-background hover:brightness-110 font-display uppercase font-bold shadow-[0_0_10px_rgba(0,255,209,0.3)]',
  amber: 'bg-warning-amber text-background hover:brightness-110 font-display uppercase font-bold',
  outline: 'bg-transparent border border-outline-variant text-off-white hover:border-primary-red hover:bg-primary-red/10',
  ghost: 'bg-transparent text-tactical-gray hover:text-off-white hover:bg-white/5 border border-transparent hover:border-outline-variant',
  danger: 'bg-primary-red/10 border border-primary-red text-primary-red hover:bg-primary-red hover:text-off-white font-mono text-xs uppercase'
};

const sizes = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-7 py-3.5 text-base'
};

export default function TactileButton({
  children,
  className = '',
  variant = 'default',
  size = 'md',
  disabled = false,
  ...props
}) {
  const baseClasses = "transition-all active:scale-[0.97] active:-translate-y-[0.5px] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 flex items-center justify-center gap-2";
  
  const variantClass = variant !== 'default' ? variants[variant] || '' : '';
  const sizeClass = variant !== 'default' ? sizes[size] || '' : '';

  const finalClassName = `${baseClasses} ${variantClass} ${sizeClass} ${className}`;

  return (
    <button
      disabled={disabled}
      className={finalClassName}
      {...props}
    >
      {children}
    </button>
  );
}
