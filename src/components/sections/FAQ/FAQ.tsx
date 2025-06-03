import React, { useState } from 'react';
import './FAQ.css';

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
// 그 외에도 테코테코, 노앤써 등 오프라인/온라인 스터디나 프로젝트별 추가 모임이 있습니다.
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
        <div id="faq" className="faq-page">
            {/* 헤더 */}
            <header className="faq-header">
                <h1 className="faq-title">FAQ</h1>
                <p className="faq-subtitle">
                    <strong>자주 묻는 질문들</strong>
                </p>
            </header>

            {/* 검색창 */}
            <div className="faq-search-wrapper">
                <input
                    type="text"
                    className="faq-search-input"
                    placeholder="키워드로 질문 검색..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                />
            </div>

            {/* 탭 UI */}
            <div className="faq-tabs">
                {categories.map(cat => (
                    <button
                        key={cat.key}
                        className={`faq-tab ${
                            selectedCategory === cat.key ? 'active' : ''
                        }`}
                        onClick={() => setSelectedCategory(cat.key)}
                    >
                        {cat.label}
                    </button>
                ))}
            </div>

            {/* FAQ 목록 */}
            <div className="faq-container">
                {filteredFaqData.length === 0 ? (
                    <div className="faq-no-results">
                        해당 조건에 맞는 질문이 없습니다.
                    </div>
                ) : (
                    filteredFaqData.map(faq => (
                        <div
                            key={faq.id}
                            className={`faq-item ${
                                openFAQIds.includes(faq.id) ? 'open' : ''
                            }`}
                        >
                            {/* 질문 줄 (아이콘 + 시그니처) */}
                            <div
                                className="faq-signature-line"
                                onClick={() => toggleFAQ(faq.id)}
                                role="button"
                                aria-expanded={openFAQIds.includes(faq.id)}
                            >
                                <span className="faq-icon">❓</span>
                                <span className="faq-code-block">
                  {faq.signature} &#123;
                </span>
                                <span className="faq-fold-icon">
                  {openFAQIds.includes(faq.id) ? '▼' : '▶'}
                </span>
                                <span className="faq-brace-close">&#125;</span>
                            </div>

                            {openFAQIds.includes(faq.id) ? (
                                /* 펼친 상태: 요약(회색, 이탤릭) + 답변(HTML 포함) */
                                <div className="faq-answer-block">
                                    <div
                                        className="faq-summary"
                                        style={{
                                            color: '#aaa',
                                            fontStyle: 'italic',
                                            marginBottom: '0.5rem',
                                        }}
                                    >
                                        {faq.summary}
                                    </div>
                                    <div
                                        dangerouslySetInnerHTML={{
                                            __html: `<pre>${faq.answer}</pre>`,
                                        }}
                                    />
                                </div>
                            ) : (
                                /* 접힌 상태: summary만 보여주기 */
                                <div className="faq-summary">{faq.summary}</div>
                            )}
                        </div>
                    ))
                )}
            </div>


            <div id="contact-cta" className="faq-cta-section">
                <h2 className="cta-question">궁금한 게 더 있으신가요?</h2>
                <div className="cta-button-group">
                    <button className="cta-button kakao">카카오톡 문의</button>
                    <button className="cta-button coffee">커피챗 해요 👋🏻</button>
                </div>
            </div>
        </div>
    );
};

export default FAQ;
