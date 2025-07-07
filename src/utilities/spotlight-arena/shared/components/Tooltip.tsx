import { ReactNode, useState } from 'react';
import './Tooltip.css';

interface TooltipProps {
  children: ReactNode;
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

const Tooltip: React.FC<TooltipProps> = ({ 
  children, 
  content, 
  position = 'top' 
}) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div 
      className="sa-tooltip-wrapper"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div className={`sa-tooltip sa-tooltip-${position}`}>
          {content}
        </div>
      )}
    </div>
  );
};

export default Tooltip;