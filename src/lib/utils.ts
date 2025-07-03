import { type ClassValue, clsx } from 'clsx';

/**
 * Utility function to merge Tailwind CSS classes
 * Similar to shadcn/ui's cn function
 */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

/**
 * Generate random cosmic colors for dynamic elements
 */
export const cosmicColors = [
  'cosmic-blue',
  'cosmic-cyan', 
  'cosmic-purple',
  'cosmic-gold',
] as const;

export function getRandomCosmicColor() {
  return cosmicColors[Math.floor(Math.random() * cosmicColors.length)];
}

/**
 * Instant scroll to element with offset (no animation)
 */
export function scrollToElement(elementId: string, offset: number = 80) {
  const element = document.getElementById(elementId);
  if (element) {
    const elementPosition = element.offsetTop - offset;
    window.scrollTo({
      top: elementPosition,
      behavior: 'auto'  // 애니메이션 없이 순간이동
    });
  }
}

/**
 * Format animation delay for staggered animations
 */
export function getStaggerDelay(index: number, baseDelay: number = 100) {
  return `${index * baseDelay}ms`;
}

/**
 * Check if element is in viewport
 */
export function isInViewport(element: HTMLElement) {
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}
