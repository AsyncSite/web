import React, { useState } from 'react';
import { EnhancedHeader } from '../components/layout';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import { Trophy, Medal, Award, TrendingUp, Calendar, Target, Star, Crown } from 'lucide-react';
import { RankingUser, rankingUsers } from '../data';
import { usePageTransition, useScrollOnChange } from '../hooks/usePageTransition';

interface RankingPageProps {
  users?: RankingUser[];
}

interface CategoryRanking {
  category: string;
  icon: React.ComponentType<{ className?: string }>;
  users: RankingUser[];
}

const RankingPage: React.FC<RankingPageProps> = ({ users = rankingUsers }) => {
  const [selectedCategory, setSelectedCategory] = useState('overall');

  // 페이지 전환 훅 사용
  const { isReady } = usePageTransition({
    enableLoading: true,
    loadingTime: 400
  });

  // 카테고리 변경 시 스크롤
  useScrollOnChange(selectedCategory);

  // 전달받은 사용자 데이터 사용 (빈 배열이면 빈 랭킹 표시)

  const categories: CategoryRanking[] = [
    {
      category: 'overall',
      icon: Trophy,
      users: users
    },
    {
      category: 'commits',
      icon: TrendingUp,
      users: [...users].sort((a, b) => b.activities.commits - a.activities.commits)
    },
    {
      category: 'studies',
      icon: Target,
      users: [...users].sort((a, b) => b.activities.studies - a.activities.studies)
    },
    {
      category: 'projects',
      icon: Star,
      users: [...users].sort((a, b) => b.activities.projects - a.activities.projects)
    }
  ];

  const getCurrentRanking = () => {
    return categories.find(cat => cat.category === selectedCategory)?.users || users;
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-6 h-6 text-[#FFD700]" />;
      case 2:
        return <Medal className="w-6 h-6 text-[#C0C0C0]" />;
      case 3:
        return <Award className="w-6 h-6 text-[#CD7F32]" />;
      default:
        return <span className="w-6 h-6 flex items-center justify-center text-[#64748B] font-bold">#{rank}</span>;
    }
  };

  const getChangeIndicator = (change: number) => {
    if (change > 0) {
      return <span className="text-[#10B981] text-sm">↑{change}</span>;
    } else if (change < 0) {
      return <span className="text-[#EF4444] text-sm">↓{Math.abs(change)}</span>;
    }
    return <span className="text-[#64748B] text-sm">-</span>;
  };

  return (
    <div className={`page-container min-h-screen bg-[#0B0F19] transition-opacity duration-300 ${isReady ? 'opacity-100' : 'opacity-0'}`}>
      <EnhancedHeader />
      
      <main className="pt-20 pb-20 px-4">
        <div className="max-w-6xl mx-auto">
          {/* 페이지 헤더 */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-[#FFD700] to-[#FFA500] rounded-full flex items-center justify-center">
                <Trophy className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-[#F8FAFC] mb-4 font-space-grotesk">
              Ranking
            </h1>
            <p className="text-[#64748B] text-lg max-w-2xl mx-auto font-suit">
              커뮤니티 활동을 통해 성장하고 경쟁하며 함께 발전해나가요
            </p>
          </div>

          {/* 카테고리 선택 */}
          <div className="flex justify-center mb-8">
            <div className="bg-[#0F172A]/50 rounded-lg p-1 border border-[#64748B]/10 flex flex-wrap gap-1">
              {categories.map(category => (
                <button
                  key={category.category}
                  onClick={() => setSelectedCategory(category.category)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all duration-200 ${
                    selectedCategory === category.category
                      ? 'bg-[#6366F1] text-white'
                      : 'text-[#64748B] hover:text-[#F8FAFC]'
                  }`}
                >
                  <category.icon className="w-4 h-4" />
                  <span className="font-medium capitalize">
                    {category.category === 'overall' ? '종합' : 
                     category.category === 'commits' ? '커밋' :
                     category.category === 'studies' ? '스터디' : '프로젝트'}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* 상위 3명 포디움 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {getCurrentRanking().slice(0, 3).map((user, index) => (
              <Card 
                key={user.id} 
                variant="cosmic" 
                className={`text-center ${index === 0 ? 'md:order-2 transform md:scale-110' : index === 1 ? 'md:order-1' : 'md:order-3'}`}
              >
                <CardHeader className="pb-4">
                  <div className="flex justify-center mb-4">
                    {getRankIcon(user.rank)}
                  </div>
                  <div className="text-4xl mb-2">{user.avatar}</div>
                  <CardTitle className="text-lg">{user.name}</CardTitle>
                  <div className="flex justify-center gap-1 mb-2">
                    {user.badges.map((badge, idx) => (
                      <span key={idx} className="text-lg">{badge}</span>
                    ))}
                  </div>
                  <Badge className="bg-[#6366F1]/20 text-[#6366F1] border-[#6366F1]/30">
                    Level {user.level}
                  </Badge>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-2xl font-bold text-[#F8FAFC] mb-2">{user.score.toLocaleString()}</div>
                  <div className="text-sm text-[#64748B]">포인트</div>
                  <div className="flex justify-center items-center gap-2 mt-2">
                    <Calendar className="w-4 h-4 text-[#64748B]" />
                    <span className="text-sm text-[#64748B]">{user.streak}일 연속</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* 전체 랭킹 리스트 */}
          <Card variant="cosmic">
            <CardHeader>
              <CardTitle className="text-xl">전체 랭킹</CardTitle>
              <CardDescription>
                {selectedCategory === 'overall' ? '종합 점수' : 
                 selectedCategory === 'commits' ? '커밋 수' :
                 selectedCategory === 'studies' ? '스터디 참여' : '프로젝트 기여'} 기준
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3">
                {getCurrentRanking().map((user, index) => (
                  <div 
                    key={user.id}
                    className="flex items-center gap-4 p-4 rounded-lg bg-[#0F172A]/30 hover:bg-[#0F172A]/50 transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <div className="flex items-center justify-center w-8">
                        {getRankIcon(user.rank)}
                      </div>
                      <div className="text-2xl">{user.avatar}</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-[#F8FAFC]">{user.name}</span>
                          <Badge className="bg-[#6366F1]/20 text-[#6366F1] border-[#6366F1]/30 text-xs">
                            Lv.{user.level}
                          </Badge>
                          {getChangeIndicator(user.change)}
                        </div>
                        <div className="flex gap-1 mt-1">
                          {user.badges.map((badge, idx) => (
                            <span key={idx} className="text-sm">{badge}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-lg font-bold text-[#F8FAFC]">
                        {selectedCategory === 'overall' ? user.score.toLocaleString() :
                         selectedCategory === 'commits' ? user.activities.commits :
                         selectedCategory === 'studies' ? user.activities.studies :
                         user.activities.projects}
                      </div>
                      <div className="text-sm text-[#64748B]">
                        {selectedCategory === 'overall' ? '포인트' :
                         selectedCategory === 'commits' ? '커밋' :
                         selectedCategory === 'studies' ? '스터디' : '프로젝트'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default RankingPage;
