import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import LabViewer from '../components/lab/LabViewer';
import { labProjects } from '../data';

const LabDetailPage: React.FC = () => {
    const { subject } = useParams<{ subject: string }>();
    const navigate = useNavigate();
    const [project, setProject] = useState<typeof labProjects[0] | null>(null);

    useEffect(() => {
        // 프로젝트 찾기 (URL 기반)
        const foundProject = labProjects.find(p =>
            p.link === `/lab/${subject}` ||
            p.title.toLowerCase().replace(/\s+/g, '-') === subject
        );

        if (foundProject) {
            setProject(foundProject);
        } else {
            // 프로젝트를 찾을 수 없으면 Lab 페이지로 리다이렉트
            navigate('/web/lab');
        }
    }, [subject, navigate]);

    const handleClose = () => {
        navigate('/web/lab');
    };

    // 프로젝트별 URL 매핑 (실제 게임/프로젝트 URL)
    const getProjectUrl = (projectTitle: string): string => {
        const urlMap: Record<string, string> = {
            '테트리스': 'https://example.com/tetris', // 실제 테트리스 게임 URL
            'Async Site': 'https://github.com/AsyncSite/async-site-web', // Async Site GitHub
            '추론 게임': 'https://example.com/deduction-game', // 실제 추론 게임 URL
        };

        return urlMap[projectTitle] || 'about:blank';
    };

    if (!project) {
        return (
            <div className="fixed inset-0 z-50 bg-[#0B0F19] flex items-center justify-center">
                <div className="text-center">
                    {/* 한글 텍스트: SUIT */}
                    <div className="text-[#F8FAFC] text-xl mb-4 font-suit">프로젝트를 로딩 중...</div>
                    <div className="w-8 h-8 border-2 border-[#6366F1] border-t-transparent rounded-full animate-spin mx-auto"></div>
                </div>
            </div>
        );
    }

    return (
        <LabViewer
            title={project.title}
            url={getProjectUrl(project.title)}
            onClose={handleClose}
        />
    );
};

export default LabDetailPage;