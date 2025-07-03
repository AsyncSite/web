import React from 'react';
import { cn } from '../../lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'cosmic';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  className?: string;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  className = '',
  ...props
}) => {
  const baseClasses = `
    inline-flex items-center justify-center gap-2
    font-semibold rounded-lg transition-all duration-300
    focus:outline-none focus:ring-2 focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed
    transform hover:scale-105 active:scale-95
    font-sans
  `;

  const variantClasses = {
    primary: `
      bg-gradient-to-r from-cosmic-blue to-cosmic-cyan 
      hover:from-blue-600 hover:to-cyan-500 
      text-white shadow-lg hover:shadow-xl
      shadow-cosmic-blue/25 hover:shadow-cosmic-blue/40
      focus:ring-cosmic-blue/50
    `,
    secondary: `
      bg-gray-800 hover:bg-gray-700 
      text-white border border-gray-600 hover:border-gray-500
      focus:ring-gray-500/50
    `,
    outline: `
      border-2 border-cosmic-blue text-cosmic-blue 
      hover:bg-cosmic-blue hover:text-white
      bg-transparent focus:ring-cosmic-blue/50
    `,
    ghost: `
      text-gray-300 hover:text-white hover:bg-gray-800/50
      bg-transparent focus:ring-gray-500/50
    `,
    cosmic: `
      bg-gradient-to-r from-cosmic-purple via-cosmic-blue to-cosmic-cyan
      hover:from-purple-600 hover:via-blue-600 hover:to-cyan-500
      text-white shadow-lg hover:shadow-xl
      shadow-cosmic-purple/25 hover:shadow-cosmic-purple/40
      focus:ring-cosmic-purple/50
      animate-pulse-glow
    `,
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  const combinedClasses = cn(
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    className
  );

  return (
    <button className={combinedClasses} {...props}>
      {children}
    </button>
  );
};

export default Button;
