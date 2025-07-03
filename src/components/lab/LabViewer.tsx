import React, { useEffect } from 'react';
import { X, Maximize2, Minimize2, FlaskRound } from 'lucide-react';
import { Tetris, DeductionGame } from '../lab/subject';

interface LabViewerProps {
  title: string;
  url: string;
  onClose: () => void;
}

// 프로젝트별 컴포넌트 매핑
const getProjectComponent = (title: string) => {
  switch (title) {
    case '테트리스':
      return <Tetris />;
    case '추론 게임':
      return <DeductionGame />;
    case 'Async Site':
      return (
        <div className="w-full h-full flex items-center justify-center bg-[#0F172A]">
          <div className="text-center">
            <div className="text-6xl mb-4">🚀</div>
            <h2 className="text-2xl font-bold text-[#F8FAFC] mb-4 font-space-grotesk">Async Site</h2>
            <p className="text-[#64748B] mb-6 font-suit">이 사이트 자체가 Async Site 프로젝트입니다!</p>
            <a
              href="https://github.com/AsyncSite/async-site-web"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#6366F1] text-white rounded-lg hover:bg-[#5B5BD6] transition-colors font-poppins"
            >
              GitHub에서 보기
            </a>
          </div>
        </div>
      );
    default:
      return (
        <div className="w-full h-full flex items-center justify-center bg-[#0F172A]">
          <div className="text-center">
            <div className="text-6xl mb-4">🚧</div>
            <h2 className="text-2xl font-bold text-[#F8FAFC] mb-4 font-space-grotesk">준비 중</h2>
            <p className="text-[#64748B] font-suit">이 프로젝트는 아직 준비 중입니다.</p>
          </div>
        </div>
      );
  }
};

const LabViewer: React.FC<LabViewerProps> = ({ title, url, onClose }) => {
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);

  // 페이지 로드 시 스크롤 방지
  useEffect(() => {
    document.body.style.overflow = 'hidden';

    // 로딩 시뮬레이션 (실제로는 컴포넌트 마운트 시간)
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);

    return () => {
      document.body.style.overflow = 'unset';
      clearTimeout(timer);
    };
  }, []);

  // ESC 키로 닫기
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // 전체화면 시 마우스 이동 감지
  const [showControls, setShowControls] = React.useState(true);
  const [mouseTimer, setMouseTimer] = React.useState<NodeJS.Timeout | null>(null);

  const handleMouseMove = () => {
    if (isFullscreen) {
      setShowControls(true);
      if (mouseTimer) clearTimeout(mouseTimer);
      const timer = setTimeout(() => setShowControls(false), 3000);
      setMouseTimer(timer);
    }
  };

  React.useEffect(() => {
    if (isFullscreen) {
      const timer = setTimeout(() => setShowControls(false), 3000);
      setMouseTimer(timer);
      return () => {
        if (timer) clearTimeout(timer);
      };
    } else {
      setShowControls(true);
    }
  }, [isFullscreen]);

  return (
    <div className="fixed inset-0 z-50 bg-[#0B0F19] flex flex-col">
      {/* 헤더 */}
      <div className="flex items-center justify-between p-4 bg-[#0F172A]/80 border-b border-[#64748B]/20 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <FlaskRound className="w-6 h-6 text-[#10B981]" strokeWidth={1.5} />
          {/* 타이틀: Space Grotesk */}
          <h1 className="text-xl font-bold text-[#F8FAFC] font-space-grotesk">
            {title}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          {/* 전체화면 토글 */}
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-lg hover:bg-[#64748B]/10 text-[#64748B] hover:text-[#F8FAFC] transition-colors"
            title={isFullscreen ? "창 모드" : "전체화면"}
          >
            {isFullscreen ? (
              <Minimize2 className="w-5 h-5" />
            ) : (
              <Maximize2 className="w-5 h-5" />
            )}
          </button>

          {/* 닫기 버튼 */}
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-[#EF4444]/10 text-[#64748B] hover:text-[#EF4444] transition-colors"
            title="닫기 (ESC)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* 컨텐츠 영역 */}
      <div className={`flex-1 ${isFullscreen ? 'p-0' : 'p-4'}`}>
        <div className={`w-full h-full bg-[#0B0F19] shadow-2xl overflow-hidden ${isFullscreen ? 'rounded-none' : 'rounded-xl'}`}>
          {/* 실제 컴포넌트 렌더링 - 스크롤 가능한 영역 */}
          <div className="w-full h-full overflow-auto">
            <div className="min-h-full">
              {getProjectComponent(title)}
            </div>
          </div>
        </div>
      </div>

      {/* 하단 정보 (전체화면이 아닐 때만) */}
      {!isFullscreen && (
        <div className="p-4 bg-[#0F172A]/50 border-t border-[#64748B]/20">
          <div className="flex items-center justify-between text-sm text-[#64748B]">
            <div className="flex items-center gap-4">
              {/* 한글 텍스트: SUIT */}
              <span className="font-suit">실험실 프로젝트</span>
              {/* 영어 텍스트: Poppins */}
              <span className="font-poppins">Lab Project</span>
            </div>
            <div className="flex items-center gap-4">
              {/* 영어 텍스트: Poppins */}
              <span className="font-poppins">ESC to close</span>
              {/* 한글 텍스트: SUIT */}
              <span className="font-suit">ESC로 닫기</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LabViewer;
