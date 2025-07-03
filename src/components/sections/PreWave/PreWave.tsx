import React from 'react';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '../../ui/Card';
import Badge from '../../ui/Badge';
import { ExternalLink, Star } from 'lucide-react';
import { WaveProject, waveProjects } from '../../../data';

interface PreWaveProps {
  projects?: WaveProject[];
}

const PreWave: React.FC<PreWaveProps> = ({ projects = waveProjects }) => {
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
    <section id="pre-wave" className="py-20 px-4 bg-[#0B0F19]">
      <div className="max-w-6xl mx-auto">
        {/* 섹션 헤더 */}
        <div className="text-center mb-16">
          {/* 타이틀: Space Grotesk */}
          <h2 className="text-4xl md:text-5xl font-bold text-[#F8FAFC] mb-4 font-space-grotesk">
            PRE-WAVE
          </h2>
          {/* 한글 본문: SUIT */}
          <p className="text-[#64748B] text-lg max-w-2xl mx-auto font-suit">
            세상은 누군가의 커밋으로 만들어지고 있으니까
          </p>
        </div>

        {/* 프로젝트 그리드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {projects.map((project) => (
            <Card 
              key={project.id} 
              variant="cosmic" 
              className="group cursor-pointer h-full"
              onClick={() => handleProjectClick(project)}
              hover={true}
            >
              {/* 이미지 영역 */}
              {project.image && (
                <div className="relative w-full h-48 overflow-hidden rounded-t-xl bg-[#1E293B]/50 flex-shrink-0">
                  <img
                    src={process.env.PUBLIC_URL + project.image}
                    alt={project.title}
                    className="w-full h-full object-cover object-center transition-transform duration-300 group-hover:scale-105 block"
                    style={{ minHeight: '192px', maxHeight: '192px' }}
                    loading="eager"
                    onError={(e) => {
                      console.log('이미지 로드 실패:', process.env.PUBLIC_URL + project.image);
                      const target = e.currentTarget as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                    onLoad={() => {
                    }}
                  />
                  
                  {/* 링크 아이콘 */}
                  {project.link && project.link !== '#' && (
                    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="w-8 h-8 rounded-full bg-[#0F172A]/80 flex items-center justify-center">
                        <ExternalLink className="w-4 h-4 text-[#F8FAFC]" />
                      </div>
                    </div>
                  )}
                </div>
              )}

              <CardHeader className="pb-3">
                <div className="flex items-start justify-between mb-2">
                  <Badge className={getStatusColor(project.status)}>
                    {project.status}
                  </Badge>
                </div>
                {/* 타이틀: Space Grotesk */}
                <CardTitle className="text-lg font-space-grotesk">
                  {project.title}
                </CardTitle>
                {/* 한글 설명: SUIT */}
                <CardDescription className="text-sm line-clamp-3 font-suit">
                  {project.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="pt-0">
                {/* 기술 스택 */}
                <div className="flex flex-wrap gap-1 mb-3">
                  {project.tech.slice(0, 3).map((tech, index) => (
                    <span 
                      key={index}
                      className="text-xs px-2 py-1 bg-[#64748B]/10 text-[#64748B] rounded-md font-poppins"
                    >
                      {tech}
                    </span>
                  ))}
                  {project.tech.length > 3 && (
                    <span className="text-xs px-2 py-1 bg-[#64748B]/10 text-[#64748B] rounded-md font-poppins">
                      +{project.tech.length - 3}
                    </span>
                  )}
                </div>

                {/* 하단 정보 */}
                <div className="flex items-center justify-between text-xs text-[#64748B]">
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3" />
                    <span className="font-poppins">프로젝트</span>
                  </div>
                  {project.link && project.link !== '#' && (
                    <div className="flex items-center gap-1">
                      <ExternalLink className="w-3 h-3" />
                      <span className="font-poppins">보기</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PreWave;
