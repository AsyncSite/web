import React, { useState } from 'react';
import styles from './FAQ.module.css';

interface FAQItem {
  id: number;
  question: string;
  answer: string | React.ReactNode;
}

const faqData: FAQItem[] = [
  {
    id: 1,
    question: '참여 비용이 있나요?',
    answer: (
      <>
        <p>참여하시는 스터디의 성격에 따라 다릅니다.</p>
        <p><strong>[Community Track]</strong><br />
        동료와 함께 자율적으로 성장하는 대부분의 스터디는 무료로 참여할 수 있습니다.</p>
        <p><strong>[Incubating/Workshop Track]</strong><br />
        전문가의 초밀착 가이드가 제공되는 멘토링 프로그램이나 특정 워크샵은 별도의 참가비가 있습니다.</p>
        <p>각 스터디의 상세 페이지에서 비용 정보를 확인해주세요.</p>
      </>
    )
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
    <section className={`${styles.mainPageFaq} section-background`} id="faq">
      <div className={styles.container}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>FAQ</h2>
          <p className={styles.sectionSubtitle}>궁금한 점들을 확인해보세요</p>
        </div>

        <div className={styles.mainPageFaqList}>
          {faqData.map((faq) => (
            <div key={faq.id} className={`${styles.mainPageFaqItem} ${styles.card} ${openFAQId === faq.id ? styles.open : ''}`}>
              <div
                className={styles.mainPageFaqQuestion}
                onClick={() => toggleFAQ(faq.id)}
              >
                <h3>{faq.question}</h3>
                <span className={styles.mainPageFaqIcon}>
                  {openFAQId === faq.id ? '−' : '+'}
                </span>
              </div>

              <div className={styles.mainPageFaqAnswer}>
                {typeof faq.answer === 'string' ? <p>{faq.answer}</p> : faq.answer}
              </div>
            </div>
          ))}
        </div>

        <div className={styles.mainPageFaqContact}>
          <h3>더 궁금한 점이 있으신가요?</h3>
          <div className={styles.contactOptions}>
            <div className={styles.contactMain}>
              <a
                href="https://discord.gg/asyncsite"
                className={styles.contactItem}
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className={styles.contactIcon}>💬</span>
                <span className={styles.contactLabel}>빠른 답변</span>
                <span className={styles.contactDesc}>1:1 Discord 채널</span>
              </a>
              <a
                href="https://calendly.com/asyncsite/coffee-chat"
                className={styles.contactItem}
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className={styles.contactIcon}>☕</span>
                <span className={styles.contactLabel}>커피챗</span>
                <span className={styles.contactDesc}>30분 온라인 미팅</span>
              </a>
            </div>
            <div className={styles.contactPartnership}>
              <span>파트너십 문의</span>
              <a href="mailto:partnership@asyncsite.com">partnership@asyncsite.com</a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQ;
