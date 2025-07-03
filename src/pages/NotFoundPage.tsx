import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { EnhancedHeader } from '../components/layout';
import Button from '../components/ui/Button';
import { Home, ArrowLeft, Search, Compass } from 'lucide-react';

const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  // 페이지 로드 시 애니메이션 없이 스크롤 상단으로 순간이동
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, []);

  return (
    <div className="min-h-screen bg-[#0B0F19] flex flex-col">
      <EnhancedHeader />
      
      <main className="flex-1 flex items-center justify-center px-4 pt-20">
        <div className="max-w-2xl mx-auto text-center">
          {/* 404 애니메이션 */}
          <div className="relative mb-12">
            <div className="text-[12rem] md:text-[16rem] font-bold text-transparent bg-gradient-to-r from-[#6366F1] via-[#06B6D4] to-[#A855F7] bg-clip-text leading-none font-space-grotesk">
              404
            </div>
            <div className="absolute inset-0 text-[12rem] md:text-[16rem] font-bold text-[#6366F1]/10 leading-none font-space-grotesk animate-pulse">
              404
            </div>
          </div>

          {/* 메시지 */}
          <div className="mb-12">
            <h1 className="text-3xl md:text-4xl font-bold text-[#F8FAFC] mb-4 font-space-grotesk">
              페이지를 찾을 수 없습니다
            </h1>
            <p className="text-[#64748B] text-lg mb-2 font-suit">
              요청하신 페이지가 존재하지 않거나 이동되었을 수 있습니다.
            </p>
            <p className="text-[#64748B] font-suit">
              아래 버튼을 통해 다른 페이지로 이동해보세요.
            </p>
          </div>

          {/* 액션 버튼들 */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button
              variant="cosmic"
              size="lg"
              onClick={() => navigate('/web')}
              className="flex items-center gap-2"
            >
              <Home className="w-5 h-5" />
              홈으로 돌아가기
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate(-1)}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-5 h-5" />
              이전 페이지
            </Button>
          </div>

          {/* 추천 링크 */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-lg mx-auto">
            <button
              onClick={() => navigate('/web/wave')}
              className="p-4 rounded-xl bg-[#0F172A]/50 border border-[#64748B]/10 hover:border-[#6366F1]/40 hover:bg-[#0F172A]/80 transition-all duration-300 group"
            >
              <div className="w-12 h-12 bg-gradient-to-r from-[#06B6D4] to-[#6366F1] rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                <Compass className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-[#F8FAFC] font-medium mb-1 font-space-grotesk">Wave</h3>
              <p className="text-[#64748B] text-sm font-suit">활동 둘러보기</p>
            </button>

            <button
              onClick={() => navigate('/web/lab')}
              className="p-4 rounded-xl bg-[#0F172A]/50 border border-[#64748B]/10 hover:border-[#10B981]/40 hover:bg-[#0F172A]/80 transition-all duration-300 group"
            >
              <div className="w-12 h-12 bg-gradient-to-r from-[#10B981] to-[#06B6D4] rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                <Search className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-[#F8FAFC] font-medium mb-1 font-space-grotesk">Lab</h3>
              <p className="text-[#64748B] text-sm font-suit">실험실 탐방</p>
            </button>

            <button
              onClick={() => navigate('/web/ranking')}
              className="p-4 rounded-xl bg-[#0F172A]/50 border border-[#64748B]/10 hover:border-[#F59E0B]/40 hover:bg-[#0F172A]/80 transition-all duration-300 group"
            >
              <div className="w-12 h-12 bg-gradient-to-r from-[#F59E0B] to-[#EF4444] rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                <div className="text-white text-lg">🏆</div>
              </div>
              <h3 className="text-[#F8FAFC] font-medium mb-1 font-space-grotesk">Ranking</h3>
              <p className="text-[#64748B] text-sm font-suit">순위 확인</p>
            </button>
          </div>

          {/* 장식 요소 */}
          <div className="mt-16 relative">
            <div className="absolute inset-0 flex items-center justify-center opacity-5">
              <div className="w-64 h-64 bg-gradient-to-r from-[#6366F1] to-[#A855F7] rounded-full blur-3xl"></div>
            </div>
            <p className="text-[#64748B]/60 text-sm font-suit relative z-10">
              "길을 잃는 것도 때로는 새로운 발견의 시작입니다" ✨
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default NotFoundPage;
