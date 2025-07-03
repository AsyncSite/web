import React from 'react';
import { cn } from '../../lib/utils';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'secondary' | 'outline' | 'destructive';
  className?: string;
}

const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  className = '',
}) => {
  const baseClasses = cn(
    "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors font-sans",
    "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
  );

  const variantClasses = {
    default: "bg-[#6366F1]/20 text-[#6366F1] border-[#6366F1]/30 border",
    secondary: "bg-[#64748B]/20 text-[#64748B] border-[#64748B]/30 border",
    outline: "text-[#F8FAFC] border-[#64748B]/30 border",
    destructive: "bg-[#EF4444]/20 text-[#EF4444] border-[#EF4444]/30 border",
  };

  return (
    <div className={cn(baseClasses, variantClasses[variant], className)}>
      {children}
    </div>
  );
};

export default Badge;
