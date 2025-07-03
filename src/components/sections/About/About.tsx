import React, { useEffect, useRef, useState } from 'react';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '../../ui/Card';
import Badge from '../../ui/Badge';
import { Sprout, Globe, Lightbulb, HandHeart, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import './About.css';

interface CardContent {
    id: number;
    title: string;
    subtitle: string;
    content: React.ReactNode;
    icon: React.ComponentType<{ className?: string }>;
    badge: string;
    badgeVariant?: 'default' | 'secondary' | 'outline' | 'destructive';
}

const About: React.FC = () => {
    const [currentCardIndex, setCurrentCardIndex] = useState(0);
    const [isInView, setIsInView] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [dragOffset, setDragOffset] = useState(0);
    const aboutRef = useRef<HTMLDivElement>(null);
    const startX = useRef(0);
    const currentX = useRef(0);

    // 카드 데이터
    const cards: CardContent[] = [
        {
            id: 1,
            title: 'Async Site: 함께 성장하는 공간',
            subtitle: '배우고, 공유하고, 함께 나아가는 개발자 커뮤니티',
            icon: Sprout,
            badge: 'Community',
            badgeVariant: 'default',
            content: (
                <div className="space-y-4">
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-[#6366F1]/5 border border-[#6366F1]/10">
                        <div className="w-8 h-8 rounded-full bg-[#6366F1]/20 flex items-center justify-center flex-shrink-0">
                            <Sprout className="w-4 h-4 text-[#6366F1]" />
                        </div>
                        <div>
                            <h4 className="text-[#F8FAFC] font-medium mb-1">꾸준한 학습과 실천</h4>
                            <p className="text-[#64748B] text-sm">
                                매일 작은 목표를 통해 함께 <span className="text-[#6366F1] font-medium">성장하며</span>, 어제보다 나은 오늘을 만들어요.
                            </p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-[#06B6D4]/5 border border-[#06B6D4]/10">
                        <div className="w-8 h-8 rounded-full bg-[#06B6D4]/20 flex items-center justify-center flex-shrink-0">
                            <Lightbulb className="w-4 h-4 text-[#06B6D4]" />
                        </div>
                        <div>
                            <h4 className="text-[#F8FAFC] font-medium mb-1">자유로운 지식 공유</h4>
                            <p className="text-[#64748B] text-sm">
                                스터디, 경험담, Q&A로 서로의 성장을 돕는 <span className="text-[#06B6D4] font-medium">집단 지성</span>을 추구해요.
                            </p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-[#A855F7]/5 border border-[#A855F7]/10">
                        <div className="w-8 h-8 rounded-full bg-[#A855F7]/20 flex items-center justify-center flex-shrink-0">
                            <HandHeart className="w-4 h-4 text-[#A855F7]" />
                        </div>
                        <div>
                            <h4 className="text-[#F8FAFC] font-medium mb-1">수평적 연결과 지지</h4>
                            <p className="text-[#64748B] text-sm">
                                부담 없는 분위기에서 <span className="text-[#A855F7] font-medium">관심사</span>를 기반으로 자유롭게 교류하고 응원해요.
                            </p>
                        </div>
                    </div>
                </div>
            ),
        },
        {
            id: 2,
            title: '다양한 활동과 프로젝트',
            subtitle: '실무 경험과 포트폴리오를 쌓아가는 여정',
            icon: Globe,
            badge: 'Projects',
            badgeVariant: 'secondary',
            content: (
                <div className="space-y-4">
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-[#10B981]/5 border border-[#10B981]/10">
                        <div className="w-8 h-8 rounded-full bg-[#10B981]/20 flex items-center justify-center flex-shrink-0">
                            <Globe className="w-4 h-4 text-[#10B981]" />
                        </div>
                        <div>
                            <h4 className="text-[#F8FAFC] font-medium mb-1">실무 프로젝트</h4>
                            <p className="text-[#64748B] text-sm">
                                실제 서비스 개발을 통해 <span className="text-[#10B981] font-medium">실무 경험</span>을 쌓고 포트폴리오를 만들어요.
                            </p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-[#F59E0B]/5 border border-[#F59E0B]/10">
                        <div className="w-8 h-8 rounded-full bg-[#F59E0B]/20 flex items-center justify-center flex-shrink-0">
                            <Lightbulb className="w-4 h-4 text-[#F59E0B]" />
                        </div>
                        <div>
                            <h4 className="text-[#F8FAFC] font-medium mb-1">스터디 그룹</h4>
                            <p className="text-[#64748B] text-sm">
                                관심 분야별로 <span className="text-[#F59E0B] font-medium">스터디 그룹</span>을 만들어 함께 학습하고 성장해요.
                            </p>
                        </div>
                    </div>
                </div>
            ),
        },
        {
            id: 3,
            title: '열린 커뮤니티 문화',
            subtitle: '누구나 환영받는 포용적인 개발자 공간',
            icon: HandHeart,
            badge: 'Culture',
            badgeVariant: 'outline',
            content: (
                <div className="space-y-4">
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-[#EC4899]/5 border border-[#EC4899]/10">
                        <div className="w-8 h-8 rounded-full bg-[#EC4899]/20 flex items-center justify-center flex-shrink-0">
                            <HandHeart className="w-4 h-4 text-[#EC4899]" />
                        </div>
                        <div>
                            <h4 className="text-[#F8FAFC] font-medium mb-1">초보자 환영</h4>
                            <p className="text-[#64748B] text-sm">
                                경험과 실력에 관계없이 <span className="text-[#EC4899] font-medium">모든 레벨</span>의 개발자를 환영해요.
                            </p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-[#8B5CF6]/5 border border-[#8B5CF6]/10">
                        <div className="w-8 h-8 rounded-full bg-[#8B5CF6]/20 flex items-center justify-center flex-shrink-0">
                            <Globe className="w-4 h-4 text-[#8B5CF6]" />
                        </div>
                        <div>
                            <h4 className="text-[#F8FAFC] font-medium mb-1">다양성 존중</h4>
                            <p className="text-[#64748B] text-sm">
                                다양한 배경과 관점을 가진 사람들이 <span className="text-[#8B5CF6] font-medium">함께 어울리는</span> 공간이에요.
                            </p>
                        </div>
                    </div>
                </div>
            ),
        },
    ];

    const nextCard = () => {
        setCurrentCardIndex((prev) => (prev + 1) % cards.length);
    };

    const prevCard = () => {
        setCurrentCardIndex((prev) => (prev - 1 + cards.length) % cards.length);
    };

    // 스와이프 핸들러
    const handleStart = (clientX: number) => {
        setIsDragging(true);
        startX.current = clientX;
        currentX.current = clientX;
    };

    const handleMove = (clientX: number) => {
        if (!isDragging) return;
        currentX.current = clientX;
        const diff = currentX.current - startX.current;
        setDragOffset(diff);
    };

    const handleEnd = () => {
        if (!isDragging) return;
        setIsDragging(false);

        const diff = currentX.current - startX.current;
        const threshold = 100;

        if (diff > threshold) {
            prevCard();
        } else if (diff < -threshold) {
            nextCard();
        }

        setDragOffset(0);
    };

    // 마우스 이벤트
    const handleMouseDown = (e: React.MouseEvent) => {
        e.preventDefault();
        handleStart(e.clientX);
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        handleMove(e.clientX);
    };

    const handleMouseUp = () => {
        handleEnd();
    };

    // 터치 이벤트
    const handleTouchStart = (e: React.TouchEvent) => {
        handleStart(e.touches[0].clientX);
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        handleMove(e.touches[0].clientX);
    };

    const handleTouchEnd = () => {
        handleEnd();
    };

    const currentCard = cards[currentCardIndex];

    return (
        <section id="about" ref={aboutRef} className="py-20 px-4 bg-[#0B0F19]">
            <div className="max-w-6xl mx-auto">
                {/* 섹션 헤더 */}
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-bold text-[#F8FAFC] mb-4 font-space-grotesk">
                        About Us
                    </h2>
                    <p className="text-[#64748B] text-lg max-w-2xl mx-auto">
                        함께 성장하고 배우며 꿈을 실현해나가는 개발자 커뮤니티입니다
                    </p>
                </div>

                {/* Tinder-like 카드 스택 컨테이너 */}
                <div className="relative max-w-4xl mx-auto">
                    {/* 카드 스택 */}
                    <div
                        className="relative h-[500px] flex items-center justify-center perspective-1000 select-none"
                        onMouseDown={handleMouseDown}
                        onMouseMove={isDragging ? handleMouseMove : undefined}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseUp}
                        onTouchStart={handleTouchStart}
                        onTouchMove={handleTouchMove}
                        onTouchEnd={handleTouchEnd}
                    >
                        {cards.map((card, index) => {
                            const position = index - currentCardIndex;
                            const isVisible = Math.abs(position) <= 2;
                            const isActive = index === currentCardIndex;

                            if (!isVisible) return null;

                            // 드래그 중일 때 추가 변형 적용
                            const dragTransform = isActive && isDragging ? dragOffset : 0;
                            const dragRotation = isActive && isDragging ? dragOffset * 0.1 : 0;

                            return (
                                <div
                                    key={card.id}
                                    className={`absolute w-full ${
                                        isDragging && isActive
                                            ? 'transition-none'
                                            : 'transition-all duration-500 ease-out'
                                    }`}
                                    style={{
                                        transform: `
                                            translateX(${position * 8 + dragTransform}px)
                                            translateY(${Math.abs(position) * 4}px)
                                            scale(${1 - Math.abs(position) * 0.05})
                                            rotate(${position * 2 + dragRotation}deg)
                                        `,
                                        zIndex: cards.length - Math.abs(position),
                                        opacity: 1 - Math.abs(position) * 0.2,
                                    }}
                                >
                                    <Card
                                        variant="cosmic"
                                        className={`min-h-[500px] transition-all duration-300 ${
                                            isActive
                                                ? 'shadow-[0_0_30px_rgba(99,102,241,0.25)] border-[#6366F1]/40 scale-100'
                                                : 'shadow-lg'
                                        }`}
                                        hover={false}
                                    >
                                        <CardHeader>
                                            <div className="flex items-center gap-3 mb-4">
                                                <div className="w-12 h-12 rounded-full bg-[#6366F1]/20 flex items-center justify-center">
                                                    <card.icon className="w-6 h-6 text-[#6366F1]" />
                                                </div>
                                                <Badge variant={card.badgeVariant}>
                                                    {card.badge}
                                                </Badge>
                                            </div>
                                            <CardTitle className="text-2xl md:text-3xl">
                                                {card.title}
                                            </CardTitle>
                                            <CardDescription className="text-lg">
                                                {card.subtitle}
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            {card.content}
                                        </CardContent>
                                    </Card>
                                </div>
                            );
                        })}
                    </div>

                    {/* 네비게이션 버튼 - 카드 밖으로 이동 */}
                    <button
                        onClick={prevCard}
                        className="absolute -left-16 top-1/2 transform -translate-y-1/2 w-12 h-12 rounded-full bg-[#0F172A]/90 border border-[#64748B]/20 flex items-center justify-center text-[#64748B] hover:text-[#6366F1] hover:border-[#6366F1]/40 hover:scale-110 transition-all duration-300"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button
                        onClick={nextCard}
                        className="absolute -right-16 top-1/2 transform -translate-y-1/2 w-12 h-12 rounded-full bg-[#0F172A]/90 border border-[#64748B]/20 flex items-center justify-center text-[#64748B] hover:text-[#6366F1] hover:border-[#6366F1]/40 hover:scale-110 transition-all duration-300"
                    >
                        <ChevronRight className="w-6 h-6" />
                    </button>

                    {/* 인디케이터 */}
                    <div className="flex justify-center gap-2 mt-8">
                        {cards.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => setCurrentCardIndex(index)}
                                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                                    index === currentCardIndex
                                        ? 'bg-[#6366F1] w-8'
                                        : 'bg-[#64748B]/30 hover:bg-[#64748B]/50'
                                }`}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default About;
