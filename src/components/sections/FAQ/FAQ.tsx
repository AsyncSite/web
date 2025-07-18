import React, { useState } from 'react';
import './FAQ.css';

interface FAQItem {
  id: number;
  question: string;
  answer: string;
}

const faqData: FAQItem[] = [
  {
    id: 1,
    question: '참여 비용이 있나요?',
    answer: 'AsyncSite는 완전 무료로 운영되는 커뮤니티입니다. 멤버십 비용이나 참가비 없이 누구나 자유롭게 참여할 수 있어요.'
  },
  {
    id: 2,
    question: '어떤 활동을 하나요?',
    answer: '알고리즘 스터디(테코테코), 개발 블로그 작성(DEVLOG), 오픈소스 기여(디핑소스) 등 다양한 스터디와 프로젝트 활동을 진행합니다.'
  },
  {
    id: 3,
    question: '모임은 얼마나 자주 있나요?',
    answer: '스터디별로 다르지만, 대부분 주 1회 정도 진행됩니다. 온라인과 오프라인을 병행하며, 개인 일정에 맞춰 유연하게 참여할 수 있어요.'
  },
  {
    id: 4,
    question: '초보자도 참여할 수 있나요?',
    answer: '물론입니다! 초보자부터 경력자까지 모든 레벨의 개발자가 함께 성장할 수 있는 환경을 만들어가고 있어요. 서로 도움을 주고받으며 함께 배워나갑니다.'
  },
  {
    id: 5,
    question: '특정 기술 스택만 사용하나요?',
    answer: '특정 기술에 제한은 없습니다. JavaScript, Python, Java, React, Vue 등 다양한 기술 스택으로 활동하고 있어요. 본인이 관심 있는 분야로 참여하시면 됩니다.'
  },
  {
    id: 6,
    question: '출석이 필수인가요?',
    answer: '강제적인 출석 체크는 없지만, 꾸준한 참여가 중요합니다. 팀 활동에 참여하신다면 책임감을 가지고 성실하게 참여해주시면 좋겠어요.'
  }
];

const FAQ: React.FC = () => {
  const [openFAQId, setOpenFAQId] = useState<number | null>(null);

  const toggleFAQ = (id: number) => {
    setOpenFAQId(openFAQId === id ? null : id);
  };

  return (
    <section className="faq" id="faq">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">FAQ</h2>
          <p className="section-subtitle">궁금한 점들을 확인해보세요</p>
        </div>

        <div className="faq-list">
          {faqData.map((faq) => (
            <div key={faq.id} className={`faq-item card ${openFAQId === faq.id ? 'open' : ''}`}>
              <div
                className="faq-question"
                onClick={() => toggleFAQ(faq.id)}
              >
                <h3>{faq.question}</h3>
                <span className="faq-icon">
                  {openFAQId === faq.id ? '−' : '+'}
                </span>
              </div>

              <div className="faq-answer">
                <p>{faq.answer}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="faq-contact">
          <h3>다른 궁금한 점이 있으신가요?</h3>
          <p>언제든지 편하게 문의해주세요!</p>
          <div className="contact-buttons">
            <a
              href="https://github.com/asyncsite"
              className="btn-secondary"
              target="_blank"
              rel="noopener noreferrer"
            >
              💻 GitHub
            </a>
            <a
              href="mailto:contact@asyncsite.com"
              className="btn-primary"
            >
              ✉️ 이메일 문의
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQ;
