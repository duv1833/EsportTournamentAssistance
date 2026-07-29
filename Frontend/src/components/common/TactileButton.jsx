import React from 'react';

export default function TactileButton({
  children,
  className = '',
  variant = 'default',
  size = 'md',
  disabled = false,
  ...props
}) {
  const variantStyles = {
    default: '',
    primary: 'bg-primary-red text-off-white hover:brightness-110 font-display uppercase font-bold clip-corner glow-active',
    secondary: 'bg-surface-bright text-off-white hover:bg-surface-bright/80 font-display uppercase',
    cyan: 'bg-success-cyan text-background hover:brightness-110 font-display uppercase font-bold',
    amber: 'bg-warning-amber text-background hover:brightness-110 font-display uppercase font-bold',
    outline: 'border border-outline-variant text-off-white hover:border-primary-red hover:text-off-white',
    ghost: 'text-off-white/70 hover:text-off-white hover:bg-surface-bright/20',
    danger: 'bg-primary-red/10 border border-primary-red text-primary-red hover:bg-primary-red hover:text-off-white font-mono text-xs uppercase'
  };

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-7 py-3.5 text-base'
  };

  const selectedVariant = variant !== 'default' ? variantStyles[variant] || '' : '';
  const selectedSize = variant !== 'default' ? sizeStyles[size] || '' : '';

  return (
    <button
      disabled={disabled}
      className={`transition-all active:scale-[0.97] active:-translate-y-[0.5px] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 ${selectedVariant} ${selectedSize} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
