import React from 'react';

interface LoadingScreenProps {
  title?: string;
  subtitle?: string;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ 
  title = "로딩 중...", 
  subtitle = "데이터를 불러오고 있습니다" 
}) => {
  return (
    <div className="min-h-screen bg-[#0B0F19] flex items-center justify-center">
      <div className="text-center">
        {/* 로딩 애니메이션 */}
        <div className="relative mb-8">
          <div className="w-16 h-16 border-4 border-[#64748B]/20 border-t-[#6366F1] rounded-full animate-spin mx-auto"></div>
          <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-r-[#10B981] rounded-full animate-spin mx-auto" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
        </div>

        {/* 로딩 텍스트 */}
        <h2 className="text-xl font-bold text-[#F8FAFC] mb-2 font-space-grotesk">
          {title}
        </h2>
        <p className="text-[#64748B] font-suit">
          {subtitle}
        </p>

        {/* 점 애니메이션 */}
        <div className="flex justify-center mt-4 space-x-1">
          <div className="w-2 h-2 bg-[#6366F1] rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-[#10B981] rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-2 h-2 bg-[#F59E0B] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
