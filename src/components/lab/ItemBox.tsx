import React from 'react';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '../ui/Card';
import { ExternalLink, Gamepad2, Globe, Brain, Code, Palette, Zap } from 'lucide-react';

interface Props {
    title: string;
    description: string;
    imageUrl?: string;
    link?: string;
    icon?: string;
    onProjectOpen?: (title: string, url: string) => void;
}

// 아이콘 매핑 (디자인 규약)
const iconMap = {
    'Gamepad2': Gamepad2,
    'Globe': Globe,
    'Brain': Brain,
    'Code': Code,
    'Palette': Palette,
    'Zap': Zap,
};

const ItemBox = ({ title, description, imageUrl, link, icon, onProjectOpen }: Props) => {
    // 아이콘 컴포넌트 가져오기
    const IconComponent = icon ? iconMap[icon as keyof typeof iconMap] : null;
    const handleClick = () => {
        if (link) {
            if (link.startsWith('/lab/') && onProjectOpen) {
                // Lab 프로젝트는 현재 페이지 내에서 실행
                onProjectOpen(title, ''); // URL은 더 이상 필요 없음
            } else if (link.startsWith('http')) {
                // 외부 링크는 새 탭에서 열기
                window.open(link, '_blank');
            } else {
                // 내부 링크는 현재 탭에서 이동
                window.location.href = link;
            }
        }
    };

    return (
        <Card
            variant="cosmic"
            className="group cursor-pointer h-full"
            onClick={handleClick}
            hover={true}
        >
            {/* 이미지 영역 + 호버 시 아이콘 오버레이 */}
            <div className="relative w-full h-48 overflow-hidden rounded-t-xl bg-[#1E293B]/50 flex-shrink-0">
                {imageUrl ? (
                    <>
                        {/* 기본 이미지 */}
                        <img
                            src={process.env.PUBLIC_URL + imageUrl}
                            alt={title}
                            className="w-full h-full object-cover object-center transition-all duration-300 group-hover:scale-105 group-hover:brightness-75"
                            style={{ minHeight: '192px', maxHeight: '192px' }}
                            onError={(e) => {
                                const target = e.currentTarget as HTMLImageElement;
                                target.style.display = 'none';
                            }}
                        />

                        {/* 호버 시 아이콘 오버레이 */}
                        <div className="absolute inset-0 bg-gradient-to-br from-[#6366F1]/80 to-[#A855F7]/80 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center rounded-t-xl">
                            {IconComponent ? (
                                <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                                    <IconComponent className="w-12 h-12 text-white" strokeWidth={1.5} />
                                </div>
                            ) : (
                                <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                                    <Code className="w-12 h-12 text-white" strokeWidth={1.5} />
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    // 이미지가 없는 경우 기본 아이콘 표시
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#1E293B]/50 to-[#0F172A]/80">
                        <div className="text-center text-[#64748B]">
                            <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-[#1E293B]/80 flex items-center justify-center border border-[#64748B]/30">
                                {IconComponent ? (
                                    <IconComponent className="w-10 h-10 text-[#64748B]" strokeWidth={1.5} />
                                ) : (
                                    <Code className="w-10 h-10 text-[#64748B]" strokeWidth={1.5} />
                                )}
                            </div>
                            <p className="text-xs font-suit">이미지 없음</p>
                        </div>
                    </div>
                )}

                {/* 링크 아이콘 */}
                {link && (
                    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="w-8 h-8 rounded-full bg-[#0F172A]/80 flex items-center justify-center backdrop-blur-sm">
                            <ExternalLink className="w-4 h-4 text-[#F8FAFC]" />
                        </div>
                    </div>
                )}
            </div>

            <CardHeader className="pb-3">
                <CardTitle className="text-lg font-space-grotesk">
                    {title}
                </CardTitle>
                <CardDescription className="text-sm line-clamp-3 font-suit">
                    {description}
                </CardDescription>
            </CardHeader>

            {link && (
                <CardContent className="pt-0">
                    <div className="flex items-center gap-2 text-xs text-[#64748B] font-poppins">
                        <ExternalLink className="w-3 h-3" />
                        <span>프로젝트 보기</span>
                    </div>
                </CardContent>
            )}
        </Card>
    );
};

export default ItemBox; 