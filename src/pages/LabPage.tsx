import { useState } from 'react';
import { ItemBox } from '../components/lab/common';
import { LabCategory, CategoryId } from '../components/lab/types';
import './LabPage.css';

// 카테고리별 데이터
const labCategories: LabCategory[] = [
    {
        id: 'playground',
        title: 'Playground',
        subtitle: '플레이그라운드',
        description: '휴식과 재미를 위한 게임과 놀이터',
        icon: '🎮',
        color: '#9C27B0',
        bgColor: 'rgba(156, 39, 176, 0.1)',
        items: [
            {
                title: "테트리스",
                description: "AI로 시작한 테트리스 게임만들기 고도화는 어디까지 시킬 수 있는 것인가?",
                imageUrl: "/lab/images/tetris.png",
                link: "tetris",
                status: 'active'
            },
            {
                title: "추론 게임",
                description: "서로 다른 오답 정보를 가진 상태에서 정답을 추론하는 브라우저 게임",
                imageUrl: "/lab/images/deduction-game.png",
                link: "deduction-game",
                status: 'active'
            },
            {
                title: "개발자 MBTI",
                description: "당신은 어떤 타입의 개발자인가요? 재미있는 심리테스트",
                link: "dev-mbti",
                status: 'coming-soon',
                tags: ['심리테스트', '재미']
            }
        ]
    },
    {
        id: 'utilities',
        title: 'Utilities',
        subtitle: '유틸리티',
        description: '개발과 모임에 유용한 도구 모음',
        icon: '🔧',
        color: '#00BCD4',
        bgColor: 'rgba(0, 188, 212, 0.1)',
        items: [
            {
                title: "팀 나누기",
                description: "공정하고 재미있게 팀을 나누는 도구. 다양한 옵션으로 팀 구성하기",
                link: "team-shuffle",
                status: 'active',
                tags: ['팀빌딩', '랜덤']
            },
            {
                title: "스포트라이트 아레나",
                description: "다양한 미니게임으로 추첨 과정을 하나의 이벤트로 만들어주는 인터랙티브 랜덤 추첨기",
                link: "spotlight-arena",
                status: 'active',
                tags: ['랜덤', '추첨', '게임']
            },
            {
                title: "코드 공유",
                description: "실시간으로 코드를 공유하고 협업하는 간단한 에디터",
                link: "code-share",
                status: 'coming-soon',
                tags: ['협업', '공유']
            }
        ]
    },
    {
        id: 'pro-services',
        title: 'Pro Services',
        subtitle: '프로 서비스',
        description: '커리어 성장을 위한 전문 서비스',
        icon: '💼',
        color: '#2196F3',
        bgColor: 'rgba(33, 150, 243, 0.1)',
        items: [
            {
                title: "이력서 리뷰",
                description: "개발자 이력서 작성법과 전문가의 피드백을 받아보세요",
                link: "resume-review",
                status: 'coming-soon',
                tags: ['커리어', '이력서']
            },
            {
                title: "1:1 멘토링",
                description: "경험 많은 개발자와 1:1 멘토링 매칭 서비스",
                link: "mentoring",
                status: 'coming-soon',
                tags: ['멘토링', '성장']
            },
            {
                title: "모의 면접",
                description: "실전같은 기술 면접 연습과 피드백",
                link: "mock-interview",
                status: 'coming-soon',
                tags: ['면접', '준비']
            }
        ]
    }
];

const LabPage = () => {
    const [selectedCategory, setSelectedCategory] = useState<CategoryId | 'all'>('all');

    const filteredCategories = selectedCategory === 'all' 
        ? labCategories 
        : labCategories.filter(cat => cat.id === selectedCategory);

    return (        
        <div className="lab-page">
            <main className="lab-content">
                <div className="lab-header">
                    <h1 className="lab-title">🧪 실험실</h1>
                    <p className="lab-title-sub">Async Site 실험실! 다양한 프로젝트를 확인해보세요.</p>
                </div>

                {/* 카테고리 필터 */}
                <div className="category-filter">
                    <button 
                        className={`filter-btn ${selectedCategory === 'all' ? 'active' : ''}`}
                        onClick={() => setSelectedCategory('all')}
                    >
                        전체
                    </button>
                    {labCategories.map(category => (
                        <button 
                            key={category.id}
                            className={`filter-btn ${selectedCategory === category.id ? 'active' : ''}`}
                            onClick={() => setSelectedCategory(category.id)}
                            style={{ 
                                '--category-color': category.color,
                                '--category-bg': category.bgColor
                            } as React.CSSProperties}
                        >
                            {category.icon} {category.title}
                        </button>
                    ))}
                </div>

                {/* 카테고리별 섹션 */}
                <div className="categories-container">
                    {filteredCategories.map(category => (
                        <section key={category.id} className="category-section">
                            <div className="category-header" style={{ borderLeftColor: category.color }}>
                                <div className="category-title-group">
                                    <h2 className="category-title">
                                        <span className="category-icon">{category.icon}</span>
                                        {category.title}
                                        <span className="category-subtitle">{category.subtitle}</span>
                                    </h2>
                                    <p className="category-description">{category.description}</p>
                                </div>
                            </div>
                            
                            <div className="lab-grid">
                                {category.items.map((item, index) => (
                                    <div key={index} className={`item-wrapper ${item.status}`}>
                                        <ItemBox
                                            title={item.title}
                                            description={item.description}
                                            imageUrl={item.imageUrl}
                                            link={item.status === 'active' ? item.link : undefined}
                                        />
                                        {item.status === 'coming-soon' && (
                                            <div className="status-badge coming-soon">Coming Soon</div>
                                        )}
                                        {item.status === 'beta' && (
                                            <div className="status-badge beta">Beta</div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </section>
                    ))}
                </div>
            </main>
        </div>
    )
}

export default LabPage;