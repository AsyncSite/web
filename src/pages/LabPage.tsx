import React, { useState } from 'react';
import { EnhancedHeader } from '../components/layout';
import { FlaskRound } from 'lucide-react';
import ItemBox from '../components/lab/ItemBox';
import LabViewer from '../components/lab/LabViewer';
import { LabProject, labProjects } from '../data';
import { usePageTransition } from '../hooks/usePageTransition';

interface LabPageProps {
  projects?: LabProject[];
}


// 전달받은 프로젝트 데이터 사용 (빈 배열이면 빈 페이지 표시)

const LabPage: React.FC<LabPageProps> = ({ projects = labProjects }) => {
    const [selectedProject, setSelectedProject] = useState<{ title: string; url: string } | null>(null);

    // 페이지 전환 훅 사용 (빠른 페이드인)
    usePageTransition({ enableLoading: false, fadeInDelay: 100 });

    // 프로젝트 열기 핸들러
    const handleProjectOpen = (title: string, url: string) => {
        setSelectedProject({ title, url });
    };

    // 웹뷰 닫기 핸들러
    const handleCloseViewer = () => {
        setSelectedProject(null);
    };

    return (
        <div className="min-h-screen bg-[#0B0F19]">
            <EnhancedHeader />
            <main className="pt-20 pb-20 px-4">
                <div className="max-w-7xl mx-auto">
                    {/* 페이지 헤더 */}
                    <div className="text-center mb-16">
                        <div className="flex items-center justify-center gap-3 mb-6">
                            <div className="w-16 h-16 bg-gradient-to-r from-[#10B981] to-[#06B6D4] rounded-full flex items-center justify-center">
                                <FlaskRound className="w-8 h-8 text-white" strokeWidth={1.5} />
                            </div>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold text-[#F8FAFC] mb-4 font-space-grotesk">
                            Lab
                        </h1>
                        <p className="text-[#64748B] text-lg max-w-2xl mx-auto font-suit">
                            Async Site 멤버들의 실험실! 다양한 프로젝트를 확인해보세요
                        </p>
                    </div>

                    {/* 프로젝트 그리드 */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {projects.map((item, index) => (
                            <ItemBox
                                key={index}
                                title={item.title}
                                description={item.description}
                                imageUrl={item.imageUrl}
                                link={item.link}
                                icon={item.icon}
                                onProjectOpen={handleProjectOpen}
                            />
                        ))}
                    </div>
                </div>
            </main>

            {/* 웹뷰 오버레이 */}
            {selectedProject && (
                <LabViewer
                    title={selectedProject.title}
                    url={selectedProject.url}
                    onClose={handleCloseViewer}
                />
            )}
        </div>
    );
};

export default LabPage;