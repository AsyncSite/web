import React from 'react';
import { EnhancedHeader } from '../components/layout';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import { ExternalLink, Users, Calendar, Star, Waves } from 'lucide-react';
import { WaveProject, waveProjects } from '../data';
import { usePageTransition } from '../hooks/usePageTransition';

interface WavePageProps {
  projects?: WaveProject[];
}

const WavePage: React.FC<WavePageProps> = ({ projects = waveProjects }) => {
  // 페이지 전환 훅 사용 (빠른 페이드인)
  usePageTransition({ enableLoading: false, fadeInDelay: 100 });
  // 전달받은 프로젝트 데이터 사용 (빈 배열이면 빈 페이지 표시)

  const getStatusColor = (status: string) => {
    const colors = {
      'Active': 'bg-[#06B6D4]/20 text-[#06B6D4] border-[#06B6D4]/30',
      'In Progress': 'bg-[#F59E0B]/20 text-[#F59E0B] border-[#F59E0B]/30',
      'Planning': 'bg-[#A855F7]/20 text-[#A855F7] border-[#A855F7]/30',
      'Coming Soon': 'bg-[#64748B]/20 text-[#64748B] border-[#64748B]/30',
    };
    return colors[status as keyof typeof colors] || 'bg-[#64748B]/20 text-[#64748B] border-[#64748B]/30';
  };

  const handleProjectClick = (project: WaveProject) => {
    if (project.link && project.link !== '#') {
      if (project.link.startsWith('/')) {
        // 내부 링크
        window.location.href = project.link;
      } else {
        // 외부 링크
        window.open(project.link, '_blank');
      }
    }
  };

  return (
    <div className="page-container min-h-screen bg-[#0B0F19] opacity-0 transition-opacity duration-300 ease-in-out">
      <EnhancedHeader />
      
      <main className="pt-20 pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          {/* 페이지 헤더 */}
          <div className="text-center mb-16">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-[#06B6D4] to-[#6366F1] rounded-full flex items-center justify-center">
                <Waves className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-[#F8FAFC] mb-4 font-space-grotesk">
              Wave
            </h1>
            <p className="text-[#64748B] text-lg max-w-2xl mx-auto font-suit">
              함께 성장하고 배우며 꿈을 실현해나가는 다양한 활동들
            </p>
          </div>

          {/* 프로젝트 그리드 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <Card
                key={project.id}
                variant="cosmic"
                className="group cursor-pointer h-full"
                onClick={() => handleProjectClick(project)}
                hover={true}
              >
                {/* 이미지 영역 */}
                <div className="relative w-full h-48 overflow-hidden rounded-t-xl bg-[#1E293B]/50 flex-shrink-0">
                  {project.image ? (
                    <img
                      src={process.env.PUBLIC_URL + project.image}
                      alt={project.title}
                      className="w-full h-full object-cover object-center transition-transform duration-300 group-hover:scale-105 block"
                      style={{ minHeight: '192px', maxHeight: '192px' }}
                      onError={(e) => {
                        console.log('이미지 로드 실패:', process.env.PUBLIC_URL + project.image);
                        const target = e.currentTarget as HTMLImageElement;
                        target.style.display = 'none';
                      }}
                      onLoad={() => {
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[#64748B]">
                      <div className="text-center">
                        <Star className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm font-suit">Coming Soon</p>
                      </div>
                    </div>
                  )}
                  
                  {/* 상태 배지 */}
                  <div className="absolute top-3 right-3">
                    <Badge className={getStatusColor(project.status)}>
                      {project.status}
                    </Badge>
                  </div>

                  {/* 링크 아이콘 */}
                  {project.link && project.link !== '#' && (
                    <div className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="w-8 h-8 rounded-full bg-[#0F172A]/80 flex items-center justify-center">
                        <ExternalLink className="w-4 h-4 text-[#F8FAFC]" />
                      </div>
                    </div>
                  )}
                </div>

                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">
                    {project.title}
                  </CardTitle>
                  <CardDescription className="text-sm line-clamp-3">
                    {project.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="pt-0">
                  {/* 기술 스택 */}
                  <div className="flex flex-wrap gap-1 mb-3">
                    {project.tech.slice(0, 3).map((tech, index) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className="text-xs bg-[#6366F1]/10 text-[#6366F1] border-[#6366F1]/20"
                      >
                        {tech}
                      </Badge>
                    ))}
                    {project.tech.length > 3 && (
                      <Badge
                        variant="outline"
                        className="text-xs bg-[#64748B]/10 text-[#64748B] border-[#64748B]/20"
                      >
                        +{project.tech.length - 3}
                      </Badge>
                    )}
                  </div>

                  {/* 프로젝트 정보 */}
                  <div className="flex items-center gap-4 text-xs text-[#64748B] font-suit">
                    <div className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      <span>Team</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>2024</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default WavePage;
