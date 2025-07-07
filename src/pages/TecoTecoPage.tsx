// src/pages/TecoTecoPage.tsx
import React, { useState, useEffect, useRef } from 'react';
import { TemplateHeader } from '../components/layout';
import { Footer } from '../components/layout';
import './TecoTecoPage.css';

// Contribution 섹션에서 가져온 이미지 에러 핸들러 함수
const getRandomColor = () => {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

const handleImgError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
  const bg = getRandomColor();
  const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64">
            <circle cx="32" cy="32" r="32" fill="${bg}"/>
            <text x="32" y="42" font-size="32" text-anchor="middle" fill="#fff" font-family="Arial, sans-serif">?</text>
        </svg>
    `;
  e.currentTarget.src = 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
  e.currentTarget.alt = '프로필 이미지 없음';
};

interface Contributor {
  name: string;
  githubId: string;
  imageUrl?: string;
}

const tecotecoMembers: Contributor[] = [
  {
    name: 'renechoi',
    githubId: 'renechoi',
    imageUrl: process.env.PUBLIC_URL + '/images/face/rene.png',
  },
  {
    name: 'kdelay',
    githubId: 'kdelay',
    imageUrl: process.env.PUBLIC_URL + '/images/face/kdelay.png',
  },
  {
    name: 'vvoohhee',
    githubId: 'vvoohhee',
    imageUrl: process.env.PUBLIC_URL + '/images/face/vvoohhee.png',
  },
  {
    name: 'KrongDev',
    githubId: 'KrongDev',
    imageUrl: 'https://avatars.githubusercontent.com/u/138358867?s=40&v=4',
  },
  {
    name: "who's next?",
    githubId: 'your-next-profile',
    imageUrl: process.env.PUBLIC_URL + '/images/face/another.png',
  },
];

const ContributorCard: React.FC<{ contributor: Contributor }> = ({ contributor }) => (
  <div className="tecoteco-contributor-card">
    <a
      href={`https://github.com/${contributor.githubId}`}
      target="_blank"
      rel="noopener noreferrer"
      className="tecoteco-contributor-link"
    >
      <div className="tecoteco-profile-wrapper">
        <img
          src={contributor.imageUrl}
          alt={`${contributor.name} 프로필`}
          className="tecoteco-profile-img"
          onError={handleImgError}
        />
      </div>
      <span className="tecoteco-contributor-name">{contributor.name}</span>
    </a>
  </div>
);

const tecotecoKeywords: string[] = [
  '😌 편안한 분위기',
  '💥 사고의 확장',
  '🤗 배려왕 멤버',
  '🥳 즐거운 분위기',
  '📝 꼼꼼한 코드 리뷰',
  '👩‍💻 실전 코딩',
  '🧠 논리적 사고력',
  '🗣️ 커뮤니케이션 역량',
  '🤖 AI 활용',
  '🌱 함께 성장',
];

interface Review {
  name: string;
  attendCount: number;
  timeAgo: string;
  title: string;
  content: string;
  emojis: string[];
  likes: number;
}

const tecotecoReviews: Review[] = [
  {
    name: '익명1',
    attendCount: 3,
    timeAgo: '6달 전',
    title: '인생의 의미',
    content:
      '누가 시킨것도 ..부자가 되는 것도 아닌데 코딩테스트 문제를 풀고 바쁜 일상을 탈탈 털어 진지한 이야기를 나눈 소중한 경험',
    emojis: ['😃', '✨', '🔥'],
    likes: 2,
  },
  {
    name: '익명2',
    attendCount: 10,
    timeAgo: '2년 전',
    title: 'Better together !',
    content:
      '혼자서는 엄두도 못 냈던 어려운 알고리즘 문제들! 테코테코 모임에서 함께 고민하고 해결하며 완독하는 뿌듯함을 느꼈습니다. 함께라면 우린 해낼 수 있어요!',
    emojis: ['🧡', '😍', '😃'],
    likes: 1,
  },
  {
    name: '익명3',
    attendCount: 8,
    timeAgo: '1년 전',
    title: '많은 것들을 배운 시간이었습니다!',
    content:
      '운이 좋게 좋은 문제, 열정적인 멤버, 그리고 많은 것을 배울 수 있는 동료들이 있는 모임에 참여하게 돼서 정말 의미 있는 시간이었습니다. 감사합니다 :)',
    emojis: ['☺️', '👍', '💡'],
    likes: 1,
  },
];

const ReviewCard: React.FC<{ review: Review }> = ({ review }) => (
  <div className="tecoteco-review-card">
    <div className="tecoteco-review-header">
      <span className="tecoteco-reviewer-name">{review.name}</span>
      <span className="tecoteco-review-meta">
        모임에 {review.attendCount}회 참석하고 작성한 후기예요. {review.timeAgo}
      </span>
    </div>
    <h4 className="tecoteco-review-title">{review.title}</h4>
    <p className="tecoteco-review-content">{review.content}</p>
    <div className="tecoteco-review-footer">
      <div className="tecoteco-review-emojis">
        {review.emojis.map((emoji, idx) => (
          <span key={idx}>{emoji}</span>
        ))}
      </div>
      <span className="tecoteco-review-likes">🧡 {review.likes}</span>
    </div>
  </div>
);

interface FAQItem {
  id: number;
  question: string;
  answer: string;
}

const tecotecoFaqs: FAQItem[] = [
  {
    id: 1,
    question: '테코테코는 어떤 스터디인가요?',
    answer:
      '테코테코는 코딩 테스트 완전 정복을 목표로 하는 알고리즘 스터디입니다. 단순히 문제를 푸는 것을 넘어, 논리적 사고력과 커뮤니케이션 역량 강화를 지향합니다.',
  },
  {
    id: 2,
    question: '모임은 언제, 어디서 진행되나요?',
    answer:
      '매주 금요일 저녁 7:30 ~ 9:30에 강남역 인근 스터디룸에서 오프라인 모임을 중심으로 진행됩니다. 상황에 따라 온라인(Discord)으로 전환될 수 있습니다.',
  },
  {
    id: 3,
    question: '스터디 비용은 어떻게 되나요?',
    answer: '스터디룸 대관료는 참석자끼리 N/1로 정산합니다. 별도의 회비나 멤버십 비용은 없습니다.',
  },
  {
    id: 4,
    question: '참여하려면 어떻게 해야 하나요?',
    answer:
      '현재는 공식 모집은 진행하고 있지 않아요. 관심 있으신 분들은 @renechoi에게 커피챗을 요청해주시면 참여 방법을 안내해 드립니다.',
  },
  {
    id: 5,
    question: '코딩 테스트 실력이 부족해도 참여할 수 있나요?',
    answer:
      '네, 실력에 관계없이 누구나 참여할 수 있습니다. 함께의 가치를 중요하게 생각하며, 서로 돕고 배우며 성장할 수 있는 환경을 지향합니다.',
  },
];

// 새로운 섹션: "테코테코 모임을 한다는 건" - 단계별 데이터
interface StepContent {
  label: string; // "문제를 만나고"
  title: string; // 상세 설명 제목
  description: string; // 상세 설명 2-3줄
  image: string; // 이미지 경로
}

const tecotecoSteps: StepContent[] = [
  {
    label: '문제를 만나고',
    title: '새로운 도전, 익숙한 문제',
    description:
      '혼자서는 엄두 내지 못했던 문제들. TecoTeco에서는 그 문제들을 피하지 않고, 함께 마주하며 새로운 도전을 시작합니다. 작은 성공들이 쌓여 큰 자신감으로 이어질 거예요.',
    image: process.env.PUBLIC_URL + '/images/step_problem.png', // 더미 이미지
  },
  {
    label: '질문하고',
    title: '멈추지 않는 호기심, 날카로운 질문',
    description:
      "막히는 지점 앞에서 주저하지 마세요. '이건 왜 이렇게 될까?', '더 좋은 방법은 없을까?' 끊임없이 질문하고 서로에게 배우며 이해의 폭을 넓힙니다. 질문하는 용기가 성장의 첫걸음입니다.",
    image: process.env.PUBLIC_URL + '/images/step_question.png', // 더미 이미지
  },
  {
    label: '파고들고',
    title: '본질을 꿰뚫는 깊이 있는 탐구',
    description:
      "단순히 정답을 아는 것을 넘어, 문제의 본질과 숨겨진 원리를 집요하게 파고듭니다. 함께 토론하며 '아하!' 하고 깨닫는 순간, 지적 성장의 짜릿함을 경험할 수 있습니다.",
    image: process.env.PUBLIC_URL + '/images/step_explore.png', // 더미 이미지
  },
  {
    label: '리뷰하고',
    title: '성장을 위한 따뜻한 피드백',
    description:
      '서로의 코드를 읽고, 배우고, 더 나은 코드를 위해 아낌없이 피드백합니다. 나를 돌아보고 동료의 시야를 빌려 나의 코드를 한층 더 성장시키는 소중한 시간입니다.',
    image: process.env.PUBLIC_URL + '/images/step_review.png', // 더미 이미지
  },
  {
    label: '대화해요',
    title: '코드를 넘어, 삶의 이야기',
    description:
      '알고리즘을 넘어 개발 문화, 커리어 고민, 소소한 일상까지. 코드를 매개로 연결된 소중한 인연들이 함께 성장하는 깊이 있는 대화의 장입니다.',
    image: process.env.PUBLIC_URL + '/images/step_talk.png', // 더미 이미지
  },
];

const TecoTecoPage: React.FC = () => {
  const [openFaqId, setOpenFaqId] = useState<number | null>(null);
  const [currentReviewIndex, setCurrentReviewIndex] = useState(0);
  // "테코테코 모임을 한다는 건" 섹션을 위한 state
  const [activeStepIndex, setActiveStepIndex] = useState<number | null>(0); // 0번째 스텝을 기본 활성화

  const introSectionRef = useRef<HTMLDivElement>(null); // "변화 속에서, 변치 않는 본질을 찾다" 섹션
  // "테코테코 모임을 한다는 건" 섹션을 위한 ref
  const experienceSectionRef = useRef<HTMLDivElement>(null); // 새로운 섹션

  const toggleFaq = (id: number) => {
    setOpenFaqId((prevId) => (prevId === id ? null : id));
  };

  // Hero CTA 버튼 클릭 시 동작할 함수: 새로운 도입 섹션으로 스크롤
  const handleCtaClick = () => {
    if (introSectionRef.current) {
      window.scrollTo({
        top: introSectionRef.current.offsetTop - 80, // 헤더 높이만큼 빼줌
        behavior: 'smooth',
      });
    }
  };

  const goToNextReview = () => {
    setCurrentReviewIndex((prevIndex) => (prevIndex + 1) % tecotecoReviews.length);
  };

  const goToPrevReview = () => {
    setCurrentReviewIndex(
      (prevIndex) => (prevIndex - 1 + tecotecoReviews.length) % tecotecoReviews.length,
    );
  };

  const goToReview = (index: number) => {
    setCurrentReviewIndex(index);
  };

  // 스텝 클릭 핸들러
  const handleStepClick = (index: number) => {
    setActiveStepIndex(index === activeStepIndex ? null : index); // 같은 스텝 클릭 시 닫기
  };

  return (
    <div className="tecoteco-page">
      <TemplateHeader />
      <main className="tecoteco-content">
        {/* 1. 몰입감 있는 서사 시작: 히어로 섹션 */}
        <section className="tecoteco-hero-section">
          <div className="hero-content">
            <h1 className="hero-title">💯 코딩테스트 스터디, 테코테코</h1>
            <p className="hero-subtitle">
              함께 자료구조와 알고리즘을 <span className="highlight">뿌시고 성장하는</span>{' '}
              개발자들의 공간입니다.
            </p>
            <div className="hero-image-wrapper">
              <img
                src={process.env.PUBLIC_URL + '/images/tecoteco-profile.png'}
                alt="테코테코 프로필 이미지"
              />
            </div>
            <button className="hero-cta-button" onClick={handleCtaClick}>
              TecoTeco, 함께 성장할 용기
            </button>
          </div>
        </section>

        {/* 2. 서사 진행: 변화 속에서, 변치 않는 본질을 찾다 (새로운 도입 섹션) */}
        <section className="tecoteco-intro-section" ref={introSectionRef}>
          <h2 className="section-title">
            변화 속에서, <br className="mobile-only" />
            변치 않는 본질을 찾다 💡
          </h2>
          <p className="section-description">
            빠르게 진화하는 기술의 물결 속에서,{' '}
            <span className="highlight">우리는 어떤 개발자가 되어야 할까요?</span>
            새로운 프레임워크와 AI 도구들이 쏟아져 나오지만,{' '}
            <span className="highlight">결국 모든 문제 해결의 근원</span>은
            <span className="highlight">견고한 사고력과 논리</span>에 있습니다.
          </p>
          <p className="section-description">
            TecoTeco는 바로 그 본질을 탐구합니다.{' '}
            <span className="highlight">
              단순히 코딩 테스트를 넘어, 어떤 기술 스택에도 흔들리지 않는 개발자의 기초 체력
            </span>
            을 다지는 곳입니다. AI를 활용하되,{' '}
            <span className="highlight">AI를 넘어서는 인간의 통찰력</span>을 함께 키워나갑니다.
          </p>
          <p className="section-description section-cta-text">
            혼자서는 막막했던 길, TecoTeco에서 함께라면{' '}
            <span className="highlight">더 멀리, 더 깊이</span> 나아갈 수 있습니다.
            <br />
            그렇다면, 우리는 어떻게 이 여정을 함께하고 있을까요?
          </p>
        </section>

        {/* 3. 서사 연결: TecoTeco, 함께 쓰는 성장 스토리 (기존 우리의 지향점) */}
        <section className="tecoteco-philosophy-section">
          <h2 className="section-title">
            🤝 TecoTeco, <br className="mobile-only" />
            함께 쓰는 성장 스토리
          </h2>
          <p className="section-subtitle">
            우리는 알고리즘 풀이를 넘어,{' '}
            <span className="highlight">서로의 성장을 이끄는 여정</span>에 집중합니다.
          </p>
          <div className="philosophy-grid">
            <div className="philosophy-item">
              <h3>
                <span className="philosophy-icon">✨</span> 시너지의 마법
              </h3>
              <p>
                혼자 꾸준히 하기 어려운 알고리즘 공부, 서로 이끌어주고 동기를 부여하며 함께 성장하는{' '}
                <span className="highlight">끈끈한 커뮤니티</span>를 지향합니다.
              </p>
            </div>
            <div className="philosophy-item">
              <h3>
                <span className="philosophy-icon">🔍</span> 본질적 탐구
              </h3>
              <p>
                정답 코드만 보지 않습니다. 동료의 코드를{' '}
                <span className="highlight">리뷰하고 토론하며 문제의 본질</span>을 깊이 파고듭니다.
                '아하!'하는 깨달음이 TecoTeco의 핵심입니다.
              </p>
            </div>
            <div className="philosophy-item">
              <h3>
                <span className="philosophy-icon">🚀</span> 미래로의 도약
              </h3>
              <p>
                AI를 도구로 활용하며, 더 나아가{' '}
                <span className="highlight">AI를 넘어서는 개발자의 통찰력</span>을 함께 고민하고
                공유하는 진보적인 스터디를 추구합니다.
              </p>
            </div>
          </div>
        </section>

        {/* 4. 서사 진행: 테코테코 모임을 한다는 건 (새로운 핵심 섹션) */}
        <section className="tecoteco-experience-section" ref={experienceSectionRef}>
          <h2 className="section-title">테코테코 모임을 한다는 건</h2>
          <p className="section-subtitle">
            우리는 매주 금요일, <span className="highlight">이런 단계</span>를 거쳐 함께 성장합니다.
          </p>

          <div className="tecoteco-steps-nav">
            {tecotecoSteps.map((step, index) => (
              <div
                key={index}
                className={`step-item ${activeStepIndex === index ? 'active' : ''}`}
                onClick={() => handleStepClick(index)}
              >
                <div className="step-button">{index + 1}</div>
                <p className="step-label">{step.label}</p>
              </div>
            ))}
          </div>

          {/* 선택된 스텝의 상세 내용 */}
          {activeStepIndex !== null && (
            <div className="step-detail-container">
              <div className="step-detail-content">
                <h3 className="step-detail-title">{tecotecoSteps[activeStepIndex].title}</h3>
                <div className="step-detail-image-wrapper">
                  <img
                    src={tecotecoSteps[activeStepIndex].image}
                    alt={tecotecoSteps[activeStepIndex].title}
                    onError={handleImgError} // 이미지 에러 핸들러 재활용
                  />
                </div>
                <p className="step-detail-text">{tecotecoSteps[activeStepIndex].description}</p>
              </div>
            </div>
          )}
        </section>

        {/* 5. 서사 연결: 당신과 TecoTeco의 하루 (기존 스터디 운영 방식) */}
        <section className="tecoteco-how-we-roll-section">
          <h2 className="section-title">🗓️ 당신과 TecoTeco의 하루</h2>
          <p className="section-subtitle">
            매주 금요일 저녁, 우리는 이렇게 <span className="highlight">특별한 시간</span>을
            함께합니다.
          </p>
          <div className="operation-details">
            <p>
              <strong>정기 모임:</strong> 매주 금요일 저녁 7:30 ~ 9:30, 강남역 인근 스터디룸
              (온/오프라인 병행)
            </p>
            <p>
              <strong>주요 교재:</strong>{' '}
              <a
                href="https://product.kyobobook.co.kr/detail/S000212576322"
                target="_blank"
                rel="noopener noreferrer"
              >
                코딩 테스트 합격자 되기: 자바 편 (골드래빗)
              </a>{' '}
              외 다양한 온라인 저지 활용
            </p>
            <p>
              <strong>스터디 비용:</strong> 스터디룸 대관료 N/1 정산.{' '}
              <span className="highlight">별도 회비 없음.</span>
            </p>
          </div>

          <h3 className="subsection-title">
            함께 성장하는 <span className="highlight">모임 흐름</span>
          </h3>
          <div className="activity-table">
            <table>
              <thead>
                <tr>
                  <th>시간</th>
                  <th>활동 내용</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <strong>19:30 ~ 20:20</strong>
                  </td>
                  <td>
                    <strong>이론/코드 리뷰</strong> (선정된 리뷰어가 깊이 있는 주제/문제 발표)
                  </td>
                </tr>
                <tr>
                  <td>
                    <strong>20:20 ~ 20:30</strong>
                  </td>
                  <td>
                    <strong>잠깐의 휴식 & 자유로운 네트워킹</strong>
                  </td>
                </tr>
                <tr>
                  <td>
                    <strong>20:30 ~ 21:30</strong>
                  </td>
                  <td>
                    <strong>함께 문제 풀이</strong> (실시간으로 머리를 맞대고 문제 해결)
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* 6. 서사 연결: 우리의 성장 발자취 (기존 우리의 발자취) */}
        <section className="tecoteco-journey-section">
          <h2 className="section-title">👣 TecoTeco의 성장 발자취</h2>
          <p className="section-subtitle">
            우리는 <span className="highlight">멈추지 않고 계속 성장</span>해 왔습니다.
          </p>
          <ul className="journey-list">
            <li>
              <strong>시즌 1 (2024.09 ~ 2024.12):</strong> 자료구조 기본기 다지기 (배열, 스택, 큐,
              해시, 트리)
            </li>
            <li>
              <strong>시즌 1.5 (2025.01 ~ 2025.03):</strong> 자료구조 복습 및 문제풀이 집중
            </li>
            <li>
              <strong>시즌 2 (2025.04 ~ 진행중):</strong> 심화 알고리즘 정복 (집합, 그래프,
              백트래킹, DP, 그리디)
            </li>
          </ul>
          <div className="journey-image-wrapper">
            <img
              src={process.env.PUBLIC_URL + '/images/2025-3q4q-schedule.png'}
              alt="2025년 3분기 4분기 스케줄"
            />
          </div>
        </section>

        {/* 7. 서사 연결: 함께 만들어가는 사람들 (기존 함께하는 사람들) */}
        <section className="tecoteco-members-section">
          <h2 className="section-title">👨‍👩‍👧‍👦 함께 만들어가는 TecoTeco</h2>
          <p className="members-intro">
            TecoTeco는 <span className="highlight">서로의 성장을 돕는 열정적인 멤버들</span>이 함께
            만들어갑니다.
          </p>
          <div className="tecoteco-contributors-list">
            {tecotecoMembers.map((member, index) => (
              <ContributorCard key={index} contributor={member} />
            ))}
          </div>
        </section>

        {/* 8. 서사 연결: 멤버들이 말하는 TecoTeco (기존 주요 키워드 + 멤버 후기) */}
        <section className="tecoteco-reviews-section">
          <h2 className="section-title">💬 TecoTeco 멤버들은 이렇게 느꼈어요.</h2>
          <p className="section-subtitle">
            우리 모임을 가장 잘 표현하는 <span className="highlight">생생한 이야기들</span>입니다.
          </p>
          <div className="tecoteco-keywords-list">
            {tecotecoKeywords.map((keyword, index) => (
              <span key={index} className="tecoteco-keyword-tag">
                {keyword}
              </span>
            ))}
          </div>
          <div className="tecoteco-carousel-container">
            <button className="carousel-nav-button prev" onClick={goToPrevReview}>
              &lt;
            </button>
            <div className="tecoteco-reviews-carousel-wrapper">
              <div
                className="tecoteco-reviews-list"
                style={{ transform: `translateX(-${currentReviewIndex * 100}%)` }}
              >
                {tecotecoReviews.map((review, index) => (
                  <ReviewCard key={index} review={review} />
                ))}
              </div>
            </div>
            <button className="carousel-nav-button next" onClick={goToNextReview}>
              &gt;
            </button>
          </div>
          <div className="carousel-indicators">
            {tecotecoReviews.map((_, index) => (
              <span
                key={index}
                className={`indicator-dot ${currentReviewIndex === index ? 'active' : ''}`}
                onClick={() => goToReview(index)}
              ></span>
            ))}
          </div>
          <div className="tecoteco-view-all-reviews-wrapper">
            <button className="tecoteco-view-all-reviews-button">후기 전체 보기 (N개)</button>
          </div>
        </section>

        {/* 9. 서사 마무리 & 다음 단계 유도: 궁금한 점이 있다면? TecoTeco에 참여하고 싶다면! (기존 FAQ + 참여 방법 결합) */}
        <section className="tecoteco-faq-join-section">
          <h2 className="section-title">
            궁금한 점이 있다면? <br className="mobile-only" />
            TecoTeco에 참여하고 싶다면! 🚀
          </h2>
          <p className="section-subtitle">
            여러분의 <span className="highlight">궁금증을 해소</span>하고,{' '}
            <span className="highlight">성장 여정</span>에 함께할 준비가 되어있습니다.
          </p>
          <div className="tecoteco-faq-items">
            {tecotecoFaqs.map((faq) => (
              <div
                key={faq.id}
                className={`tecoteco-faq-item ${openFaqId === faq.id ? 'open' : ''}`}
              >
                <div
                  className="tecoteco-faq-question"
                  onClick={() => toggleFaq(faq.id)}
                  role="button"
                  aria-expanded={openFaqId === faq.id}
                >
                  <span className="tecoteco-faq-icon">Q.</span>
                  <span className="tecoteco-faq-question-text">{faq.question}</span>
                  <span className="tecoteco-faq-toggle-icon">
                    {openFaqId === faq.id ? '▲' : '▼'}
                  </span>
                </div>
                {openFaqId === faq.id && (
                  <div className="tecoteco-faq-answer">
                    <span className="tecoteco-faq-icon">A.</span>
                    <p>{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="join-cta-block">
            <p className="join-description">
              현재는 공식 모집을 진행하고 있지는 않지만,{' '}
              <span className="highlight">테코테코의 여정에 함께하고 싶다면</span> 주저하지 마세요!
            </p>
            <button
              className="join-contact-button"
              onClick={() => alert('renechoi에게 커피챗 요청!')}
            >
              @renechoi에게 커피챗 요청하기
            </button>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default TecoTecoPage;
