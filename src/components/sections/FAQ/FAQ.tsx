import React, { useState } from 'react';
import { Card, CardContent } from '../../ui/Card';
import Button from '../../ui/Button';
import { Mail, Github, MessageSquare, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';

interface FAQItem {
    id: number;
    category: string;   // 카테고리 (탭 필터용)
    signature: string;  // 함수 시그니처
    summary: string;    // 간략 요약
    answer: string;     // 답변 (HTML 태그 포함 가능)
}

const faqData: FAQItem[] = [
    {
        id: 1,
        category: 'join',
        signature: 'public boolean isItFreeToJoin()',
        summary: '멤버십 비용 없이 누구나 자유롭게 참여 가능한가요?',
        answer: `// Yes! 11men은 누구나 자유롭게 참여할 수 있는 오픈 커뮤니티입니다.
<span class="faq-highlight">멤버십 비용은 없어요.</span> 다양한 프로젝트와 스터디에 자유롭게 합류 가능합니다.
// 단, 정식 모집 기간이 따로 있어서 그때 신규 멤버를 모집합니다.
`
    },
    {
        id: 2,
        category: 'meeting',
        signature: 'public String howOftenDoWeMeet()',
        summary: '모임은 얼마나 자주 진행되나요?',
        answer: `// 기본적으로 <span class="faq-highlight">주 1회 코어타임(온라인 미팅)</span> 형태로 만나고 있습니다.
// 그 외에도 테코테코, DEVLOG-14, 디핑소스 등 오프라인/온라인 스터디나 프로젝트별 추가 모임이 있습니다.
`
    },
    {
        id: 3,
        category: 'meeting',
        signature: 'public int whatDoWeDoInCoreTime()',
        summary: '코어타임에서는 무엇을 하나요?',
        answer: `// 코어타임에서는 전체 멤버가 모여 각자의 진행 상황을 공유하고
// 업무 분배나 협업 관련 이슈를 논의합니다.
// 짧은 시간이라도 함께 모여 공통 관심사를 체크하는 것이 핵심입니다.
`
    },
    {
        id: 4,
        category: 'tech',
        signature: 'public boolean doIHaveToCodeInJava()',
        summary: 'Java만 사용해야 하나요?',
        answer: `// 특정 언어를 강제하지는 않습니다. Java, Kotlin, JavaScript, TypeScript 등
// 다양한 스택으로 활동하고 있습니다.
// 원하는 언어와 스택을 팀 내에서 자유롭게 논의 후 선택하시면 됩니다.
`
    },
    {
        id: 5,
        category: 'join',
        signature: 'public String isAttendanceMandatory()',
        summary: '출석이 필수인가요?',
        answer: `// 절대적인 강제성은 없지만, 꾸준한 참여가 가장 중요합니다.
// 팀 프로젝트나 스터디에 합류했다면, 최대한 성실하게 참여 해주셔야
// 함께 시너지를 낼 수 있습니다.
`
    },
];

const FAQ: React.FC = () => {
    const [openFAQIds, setOpenFAQIds] = useState<number[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [searchTerm, setSearchTerm] = useState<string>('');

    const copyToClipboard = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text);
            alert('이메일 주소가 복사되었습니다!');
        } catch (err) {
            console.error('복사 실패:', err);
            // 폴백: 텍스트 선택
            const textArea = document.createElement('textarea');
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            alert('이메일 주소가 복사되었습니다!');
        }
    };

    const toggleFAQ = (id: number) => {
        setOpenFAQIds(prev =>
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

    // 탭 카테고리 목록
    const categories = [
        { key: 'all', label: '전체' },
        { key: 'join', label: '가입/참여' },
        { key: 'meeting', label: '모임 일정' },
        { key: 'tech', label: '기술' },
    ];

    // 카테고리 + 검색어 필터링
    const filteredFaqData = faqData
        .filter(item =>
            selectedCategory === 'all' ? true : item.category === selectedCategory
        )
        .filter(item => {
            if (!searchTerm.trim()) return true;
            const keyword = searchTerm.trim().toLowerCase();
            return (
                item.signature.toLowerCase().includes(keyword) ||
                item.summary.toLowerCase().includes(keyword) ||
                item.answer.toLowerCase().includes(keyword)
            );
        });

    return (
        <section id="faq" className="py-20 px-4 bg-[#0B0F19] pb-32">
            <div className="max-w-6xl mx-auto">
                {/* 페이지 헤더 */}
                <div className="text-center mb-16">
                    <div className="flex items-center justify-center gap-3 mb-6">
                        <div className="w-16 h-16 bg-gradient-to-r from-[#6366F1] to-[#A855F7] rounded-full flex items-center justify-center">
                            <HelpCircle className="w-8 h-8 text-white" />
                        </div>
                    </div>
                    {/* 타이틀: Space Grotesk */}
                    <h1 className="text-4xl md:text-5xl font-bold text-[#F8FAFC] mb-4 font-space-grotesk">
                        FAQ
                    </h1>
                    {/* 한글 본문: SUIT */}
                    <p className="text-[#64748B] text-lg max-w-2xl mx-auto font-suit">
                        자주 묻는 질문들을 확인해보세요
                    </p>
                </div>

                {/* 검색창 */}
                <div className="mb-8">
                    <div className="max-w-md mx-auto">
                        <input
                            type="text"
                            className="w-full px-4 py-3 bg-[#0F172A]/50 border border-[#64748B]/20 rounded-xl text-[#F8FAFC] placeholder-[#64748B] focus:outline-none focus:border-[#6366F1] transition-colors font-suit"
                            placeholder="키워드로 질문 검색..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {/* 카테고리 필터 */}
                <div className="flex justify-center mb-12">
                    <div className="bg-[#0F172A]/50 rounded-lg p-1 border border-[#64748B]/10 flex flex-wrap gap-1">
                        {categories.map(cat => (
                            <button
                                key={cat.key}
                                className={`px-4 py-2 rounded-md transition-all duration-200 font-suit ${
                                    selectedCategory === cat.key
                                        ? 'bg-[#6366F1] text-white'
                                        : 'text-[#64748B] hover:text-[#F8FAFC] hover:bg-[#64748B]/10'
                                }`}
                                onClick={() => setSelectedCategory(cat.key)}
                            >
                                {cat.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* FAQ 목록 */}
                <div className="space-y-4 mb-16">
                    {filteredFaqData.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="text-[#64748B] text-lg font-suit">
                                해당 조건에 맞는 질문이 없습니다.
                            </div>
                        </div>
                    ) : (
                    filteredFaqData.map(faq => (
                        <Card
                            key={faq.id}
                            variant="cosmic"
                            className={`mb-4 transition-all duration-300 ${
                                openFAQIds.includes(faq.id) ? 'ring-2 ring-cosmic-blue/50' : ''
                            }`}
                        >
                            {/* 질문 헤더 */}
                            <div
                                className="flex items-center justify-between p-6 cursor-pointer hover:bg-[#0F172A]/30 transition-colors duration-200"
                                onClick={() => toggleFAQ(faq.id)}
                                role="button"
                                aria-expanded={openFAQIds.includes(faq.id)}
                            >
                                <div className="flex items-center space-x-4 flex-1">
                                    <div className="w-8 h-8 bg-[#6366F1]/20 rounded-full flex items-center justify-center">
                                        <HelpCircle className="w-4 h-4 text-[#6366F1]" />
                                    </div>
                                    {/* 한글 질문: SUIT */}
                                    <h3 className="text-[#F8FAFC] font-medium text-lg font-suit">
                                        {faq.signature}
                                    </h3>
                                </div>
                                <div className="transition-transform duration-200">
                                    {openFAQIds.includes(faq.id) ? (
                                        <ChevronUp className="w-5 h-5 text-[#64748B]" />
                                    ) : (
                                        <ChevronDown className="w-5 h-5 text-[#64748B]" />
                                    )}
                                </div>
                            </div>

                            {openFAQIds.includes(faq.id) && (
                                <CardContent className="pt-0 px-6 pb-6">
                                    {/* 요약 */}
                                    <div className="text-[#64748B] italic text-sm mb-4 border-l-2 border-[#6366F1]/30 pl-4 font-suit">
                                        {faq.summary}
                                    </div>
                                    {/* 답변 */}
                                    <div className="bg-[#0F172A]/50 rounded-lg p-4 border border-[#64748B]/10">
                                        <div
                                            className="text-[#F8FAFC] text-sm leading-relaxed font-suit"
                                            dangerouslySetInnerHTML={{
                                                __html: faq.answer.replace(/\n/g, '<br>')
                                            }}
                                        />
                                    </div>
                                </CardContent>
                            )}
                        </Card>
                    ))
                    )}
                </div>


            {/* CTA 섹션 - Contact 정보 포함 */}
                <div id="contact-cta" className="mt-16 mb-20">
                    <div className="text-center mb-12">
                        <h2 className="text-2xl md:text-3xl font-bold text-white mb-4 font-space-grotesk">
                            궁금한 게 더 있으신가요?
                        </h2>
                        <p className="text-[#64748B] text-lg font-suit">
                            언제든지 연락주세요! 함께 성장해나가요 🚀
                        </p>
                    </div>

                    {/* Contact 정보 카드들 */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto mb-8">
                        {/* 이메일 카드 */}
                        <Card variant="cosmic" className="p-6 text-center group cursor-pointer" onClick={() => copyToClipboard('AsyncSite@gmail.com')}>
                            <div className="flex flex-col items-center space-y-4">
                                <div className="w-16 h-16 bg-gradient-to-r from-[#6366F1] to-[#06B6D4] rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                    <Mail className="w-8 h-8 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-[#F8FAFC] font-semibold text-lg mb-2 font-space-grotesk">Email</h3>
                                    <p className="text-[#06B6D4] font-medium font-poppins">AsyncSite@gmail.com</p>
                                    <p className="text-[#64748B] text-sm mt-1 font-suit">클릭하여 복사하기</p>
                                </div>
                            </div>
                        </Card>

                        {/* 깃헙 카드 */}
                        <Card variant="cosmic" className="p-6 text-center group cursor-pointer" onClick={() => window.open('https://github.com/AsyncSite', '_blank')}>
                            <div className="flex flex-col items-center space-y-4">
                                <div className="w-16 h-16 bg-gradient-to-r from-[#10B981] to-[#06B6D4] rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                    <Github className="w-8 h-8 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-[#F8FAFC] font-semibold text-lg mb-2 font-space-grotesk">GitHub</h3>
                                    <p className="text-[#10B981] font-medium font-poppins">github.com/AsyncSite</p>
                                    <p className="text-[#64748B] text-sm mt-1 font-suit">프로젝트와 코드를 확인해보세요</p>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default FAQ;
