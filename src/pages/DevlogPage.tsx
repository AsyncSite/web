import React, { useEffect } from 'react';
import { EnhancedHeader } from '../components/layout';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import { 
  Calendar, 
  Clock, 
  Users, 
  MapPin, 
  Target, 
  BookOpen, 
  Award, 
  MessageSquare,
  Github,
  ExternalLink,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

const DevlogPage: React.FC = () => {
  // 페이지 로드 시 애니메이션 없이 스크롤 상단으로 순간이동
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, []);

  return (
    <div className="min-h-screen bg-[#0B0F19]">
      <EnhancedHeader />
      
      <main className="pt-20 pb-20 px-4">
        <div className="max-w-6xl mx-auto">
          {/* 헤더 섹션 */}
          <div className="text-center mb-16">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-[#10B981] to-[#06B6D4] rounded-full flex items-center justify-center">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
            </div>
            {/* 타이틀: Space Grotesk */}
            <h1 className="text-4xl md:text-5xl font-bold text-[#F8FAFC] mb-4 font-space-grotesk">
              DEVLOG-14
            </h1>
            {/* 한글 본문: SUIT */}
            <p className="text-[#64748B] text-lg max-w-2xl mx-auto font-suit">
              격주에 한 번, 개발자 블로그 포스팅 챌린지
            </p>
            
            {/* 상태 배지 */}
            <div className="flex justify-center gap-3 mt-6">
              <Badge className="bg-[#10B981]/20 text-[#10B981] border-[#10B981]/30">
                <CheckCircle className="w-4 h-4 mr-2" />
                모집 중
              </Badge>
              <Badge className="bg-[#F59E0B]/20 text-[#F59E0B] border-[#F59E0B]/30">
                <Users className="w-4 h-4 mr-2" />
                8/12명
              </Badge>
            </div>
          </div>

          {/* 메인 컨텐츠 그리드 */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* 왼쪽: 스터디 정보 */}
            <div className="lg:col-span-2 space-y-8">
              {/* 스터디 소개 */}
              <Card variant="cosmic">
                <CardHeader>
                  <CardTitle className="font-space-grotesk">스터디 소개</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 font-suit">
                    <p className="text-[#F8FAFC] leading-relaxed">
                      개발자로서 성장하는 가장 좋은 방법 중 하나는 자신의 경험과 지식을 글로 정리하는 것입니다. 
                      DEVLOG-14는 격주마다 개발 관련 포스팅을 작성하며 서로의 성장을 응원하는 스터디입니다.
                    </p>
                    <p className="text-[#64748B] leading-relaxed">
                      단순히 글을 쓰는 것을 넘어서, 서로의 포스팅을 리뷰하고 피드백을 주고받으며 
                      더 나은 개발자로 성장해나가는 것이 목표입니다.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* 진행 방식 */}
              <Card variant="cosmic">
                <CardHeader>
                  <CardTitle className="font-space-grotesk">진행 방식</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 bg-[#6366F1]/20 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-[#6366F1] font-bold font-poppins">1</span>
                      </div>
                      <div>
                        <h4 className="text-[#F8FAFC] font-semibold mb-2 font-suit">주제 선정 (매 격주 월요일)</h4>
                        <p className="text-[#64748B] text-sm font-suit">
                          자유 주제 또는 공통 주제 중 선택하여 포스팅 계획 공유
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 bg-[#10B981]/20 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-[#10B981] font-bold font-poppins">2</span>
                      </div>
                      <div>
                        <h4 className="text-[#F8FAFC] font-semibold mb-2 font-suit">포스팅 작성 (2주간)</h4>
                        <p className="text-[#64748B] text-sm font-suit">
                          개인 블로그에 포스팅 작성 및 진행 상황 공유
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 bg-[#EC4899]/20 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-[#EC4899] font-bold font-poppins">3</span>
                      </div>
                      <div>
                        <h4 className="text-[#F8FAFC] font-semibold mb-2 font-suit">리뷰 및 피드백 (격주 일요일)</h4>
                        <p className="text-[#64748B] text-sm font-suit">
                          서로의 포스팅을 읽고 피드백 공유, 다음 주제 논의
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 예상 효과 */}
              <Card variant="cosmic">
                <CardHeader>
                  <CardTitle className="font-space-grotesk">예상 효과</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 p-3 bg-[#6366F1]/10 rounded-lg border border-[#6366F1]/20">
                      <Target className="w-5 h-5 text-[#6366F1]" />
                      <span className="text-[#F8FAFC] text-sm font-suit">체계적인 학습 습관</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-[#10B981]/10 rounded-lg border border-[#10B981]/20">
                      <BookOpen className="w-5 h-5 text-[#10B981]" />
                      <span className="text-[#F8FAFC] text-sm font-suit">지식 정리 능력 향상</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-[#EC4899]/10 rounded-lg border border-[#EC4899]/20">
                      <MessageSquare className="w-5 h-5 text-[#EC4899]" />
                      <span className="text-[#F8FAFC] text-sm font-suit">커뮤니케이션 스킬</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-[#F59E0B]/10 rounded-lg border border-[#F59E0B]/20">
                      <Award className="w-5 h-5 text-[#F59E0B]" />
                      <span className="text-[#F8FAFC] text-sm font-suit">개인 브랜딩</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* 오른쪽: 사이드바 */}
            <div className="space-y-6">
              {/* 스터디 정보 */}
              <Card variant="cosmic">
                <CardHeader>
                  <CardTitle className="font-space-grotesk">스터디 정보</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-[#6366F1]" />
                    <div>
                      <p className="text-[#F8FAFC] text-sm font-suit">격주 일요일</p>
                      <p className="text-[#64748B] text-xs font-poppins">매월 2, 4주차</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-[#10B981]" />
                    <div>
                      <p className="text-[#F8FAFC] text-sm font-suit">오후 2시 - 4시</p>
                      <p className="text-[#64748B] text-xs font-poppins">2시간</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-[#EC4899]" />
                    <div>
                      <p className="text-[#F8FAFC] text-sm font-suit">온라인 (Discord)</p>
                      <p className="text-[#64748B] text-xs font-poppins">화상 + 채팅</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-[#F59E0B]" />
                    <div>
                      <p className="text-[#F8FAFC] text-sm font-suit">8명 / 12명</p>
                      <p className="text-[#64748B] text-xs font-poppins">4명 더 모집</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 참여 조건 */}
              <Card variant="cosmic">
                <CardHeader>
                  <CardTitle className="font-space-grotesk">참여 조건</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-[#10B981] mt-0.5" />
                    <p className="text-[#F8FAFC] text-sm font-suit">개인 블로그 보유 (필수)</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-[#10B981] mt-0.5" />
                    <p className="text-[#F8FAFC] text-sm font-suit">격주 1회 포스팅 가능</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-[#10B981] mt-0.5" />
                    <p className="text-[#F8FAFC] text-sm font-suit">피드백 참여 의지</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-[#F59E0B] mt-0.5" />
                    <p className="text-[#64748B] text-sm font-suit">개발 경력 무관</p>
                  </div>
                </CardContent>
              </Card>

              {/* 신청하기 */}
              <Card variant="cosmic">
                <CardContent className="p-6">
                  <button className="w-full bg-gradient-to-r from-[#10B981] to-[#06B6D4] text-white py-3 px-6 rounded-lg font-semibold transition-all duration-200 hover:shadow-lg hover:scale-105 font-suit">
                    스터디 신청하기
                  </button>
                  <p className="text-[#64748B] text-xs text-center mt-3 font-suit">
                    신청 후 간단한 면담이 있습니다
                  </p>
                </CardContent>
              </Card>

              {/* 관련 링크 */}
              <Card variant="cosmic">
                <CardHeader>
                  <CardTitle className="font-space-grotesk">관련 링크</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <a 
                    href="#" 
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-[#64748B]/10 transition-colors"
                  >
                    <Github className="w-5 h-5 text-[#64748B]" />
                    <span className="text-[#F8FAFC] text-sm font-suit">GitHub 저장소</span>
                    <ExternalLink className="w-4 h-4 text-[#64748B] ml-auto" />
                  </a>
                  <a 
                    href="#" 
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-[#64748B]/10 transition-colors"
                  >
                    <MessageSquare className="w-5 h-5 text-[#64748B]" />
                    <span className="text-[#F8FAFC] text-sm font-suit">Discord 채널</span>
                    <ExternalLink className="w-4 h-4 text-[#64748B] ml-auto" />
                  </a>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DevlogPage;
