import React from 'react';
import { cn } from '../../lib/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'cosmic' | 'glass' | 'glow';
  hover?: boolean;
  onClick?: () => void;
}

interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

interface CardContentProps {
  children: React.ReactNode;
  className?: string;
}

interface CardTitleProps {
  children: React.ReactNode;
  className?: string;
}

interface CardDescriptionProps {
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({
  children,
  className = '',
  variant = 'default',
  hover = true,
  onClick,
}) => {
  const baseClasses = cn(
    "rounded-xl border backdrop-blur-sm transition-all duration-700 group",
    hover && "cursor-pointer hover:scale-[1.02] hover:shadow-2xl"
  );

  const variantClasses = {
    default: cn(
      "bg-[#0F172A]/90 border-[#64748B]/10",
      "hover:shadow-[0_0_30px_rgba(99,102,241,0.15)] hover:bg-[#0F172A]"
    ),
    cosmic: cn(
      "bg-[#0F172A]/90 border-[#6366F1]/20",
      "hover:shadow-[0_0_30px_rgba(99,102,241,0.25)] hover:border-[#6366F1]/40"
    ),
    glass: cn(
      "bg-white/5 border-white/10 hover:border-white/20",
      "backdrop-blur-md shadow-lg shadow-black/20"
    ),
    glow: cn(
      "bg-[#0F172A]/90 border-[#06B6D4]/20",
      "hover:shadow-[0_0_30px_rgba(6,182,212,0.25)] hover:border-[#06B6D4]/40"
    ),
  };

  return (
    <div
      className={cn(baseClasses, variantClasses[variant], className, "font-sans")}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

const CardHeader: React.FC<CardHeaderProps> = ({
  children,
  className = '',
}) => {
  return (
    <div className={cn("p-6 pb-4", className)}>
      {children}
    </div>
  );
};

const CardContent: React.FC<CardContentProps> = ({
  children,
  className = '',
}) => {
  return (
    <div className={cn("p-6 pt-0", className)}>
      {children}
    </div>
  );
};

const CardTitle: React.FC<CardTitleProps> = ({
  children,
  className = '',
}) => {
  return (
    // 타이틀: Space Grotesk
    <h3 className={cn("text-xl font-semibold text-[#F8FAFC] mb-2 font-space-grotesk", className)}>
      {children}
    </h3>
  );
};

const CardDescription: React.FC<CardDescriptionProps> = ({
  children,
  className = '',
}) => {
  return (
    // 본문: 영어(Poppins) + 한글(SUIT)
    <p className={cn("text-[#64748B] text-sm leading-relaxed font-sans", className)}>
      {children}
    </p>
  );
};

export { Card, CardHeader, CardContent, CardTitle, CardDescription };
