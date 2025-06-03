import React, { useState } from 'react';
import './FAQ.css';

interface FAQItem {
    id: number;
    signature: string; // 함수 시그니처
    answer: string;    // 답변
}

const faqData: FAQItem[] = [
    {
        id: 1,
        signature: 'public boolean isItFreeToJoin()',
        answer: `// Yes! 현재 11men은 누구나 자유롭게 참여할 수 있는 오픈 커뮤니티입니다.
// 멤버십 비용은 없으며, 다양한 프로젝트와 스터디에 자유롭게 합류 가능합니다.
// 단, 각 팀(스터디/프로젝트)에 따라 약간의 요구사항이 있을 수 있으니 참고해주세요.`
    },
    {
        id: 2,
        signature: 'public String howOftenDoWeMeet()',
        answer: `// 기본적으로 주 1회, 코어타임(온라인 미팅) 형태로 만나고 있습니다.
// 그 외에도 테코테코, 노앤써 등 오프라인/온라인 스터디나 프로젝트별 추가 모임이 있습니다.`
    },
    {
        id: 3,
        signature: 'public int whatDoWeDoInCoreTime()',
        answer: `// 코어타임에서는 전체 멤버가 모여 각자의 진행 상황을 공유하고
// 업무 분배나 협업 관련 이슈를 논의합니다.
// 짧은 시간이라도 함께 모여 공통 관심사를 체크하는 것이 핵심입니다.`
    },
    {
        id: 4,
        signature: 'public boolean doIHaveToCodeInJava()',
        answer: `// 특정 언어를 강제하지는 않습니다. Java, Kotlin, JavaScript, TypeScript 등
// 다양한 스택으로 활동하고 있습니다.
// 원하는 언어와 스택을 팀 내에서 자유롭게 논의 후 선택하시면 됩니다.`
    },
    {
        id: 5,
        signature: 'public String isAttendanceMandatory()',
        answer: `// 절대적인 강제성은 없지만, 꾸준한 참여가 가장 중요합니다.
// 팀 프로젝트나 스터디에 합류했다면, 최대한 성실하게 참여해주셔야
// 함께 시너지를 낼 수 있습니다.`
    },
];

const FAQ: React.FC = () => {
    const [openFAQIds, setOpenFAQIds] = useState<number[]>([]);

    const toggleFAQ = (id: number) => {
        setOpenFAQIds((prev) =>
            prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
        );
    };

    return (
        <div className="faq-page">
            <header className="faq-header">
                <h1 className="faq-title">FAQ</h1>
                <p className="faq-subtitle">
                    자주 묻는 질문들 <strong>(feat. 인텔리제이st)</strong>
                </p>
            </header>

            <div className="faq-container">
                {faqData.map((faq) => (
                    <div key={faq.id} className="faq-item">
                        <div
                            className="faq-signature-line"
                            onClick={() => toggleFAQ(faq.id)}
                        >
                            <span className="faq-modifier">/* folded */</span>
                            <span className="faq-code-block">
                {faq.signature} &#123;
              </span>
                            <span className="faq-fold-icon">
                {openFAQIds.includes(faq.id) ? '▼' : '▶'}
              </span>
                            <span className="faq-brace-close">&#125;</span>
                        </div>

                        {openFAQIds.includes(faq.id) && (
                            <div className="faq-answer-block">
                                <pre>{faq.answer}</pre>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* 아래가 새로 추가된 CTA 섹션입니다 */}
            <div className="faq-cta-section">
                {/*<p className="cta-info">👇🏻👇🏻👇🏻</p>*/}
                <h2 className="cta-question">궁금한 게 더 있으신가요?</h2>

                <div className="cta-button-group">
                    <button className="cta-button kakao">
                        카카오톡 참여하기
                    </button>
                    <button className="cta-button coffee">
                        운영진 커피챗
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FAQ;
