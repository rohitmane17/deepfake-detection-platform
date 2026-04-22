import { ReactNode } from 'react';

interface ButtonProps {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  variant?: 'primary' | 'secondary' | 'glass';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
}

export default function Button({ 
  children, 
  onClick, 
  className = '', 
  variant = 'primary',
  size = 'md',
  disabled = false,
  type = 'button'
}: ButtonProps) {
  const baseClasses = 'inline-flex items-center justify-center rounded-lg font-semibold transition-all duration-300';
  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };
  const variantClasses = {
    primary: 'bg-gradient-to-r from-neon-blue to-neon-purple text-primary-dark hover:shadow-large',
    secondary: 'border-2 border-neon-blue text-neon-blue hover:bg-neon-blue hover:text-primary-dark',
    glass: 'bg-glass-bg border-glass-border text-text-primary hover:border-neon-blue hover:shadow-medium',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover-lift'} ${className}`}
    >
      {children}
    </button>
  );
}
