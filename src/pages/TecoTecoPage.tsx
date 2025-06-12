// src/pages/TecoTecoPage.tsx
import React, { useState } from 'react'; // useState import
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
        name: "renechoi",
        githubId: "renechoi",
        imageUrl: process.env.PUBLIC_URL + '/images/face/rene.png'
    },
    {
        name: "kdelay",
        githubId: "kdelay",
        imageUrl: process.env.PUBLIC_URL + '/images/face/kdelay.png'
    },
    {
        name: "vvoohhee",
        githubId: "vvoohhee",
        imageUrl: process.env.PUBLIC_URL + '/images/face/vvoohhee.png'
    },
    {
        name: "KrongDev",
        githubId: "KrongDev",
        imageUrl: 'https://avatars.githubusercontent.com/u/138358867?s=40&v=4'
    },
    {
        name: "who's next?",
        githubId: "your-next-profile",
        imageUrl: process.env.PUBLIC_URL + '/images/face/another.png'
    }
];

// Contribution 섹션의 ContributorCard 스타일을 벤치마킹하여 컴포넌트화
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
    "😌 편안한 분위기", "💥 사고의 확장", "🤗 배려왕 멤버",
    "🥳 즐거운 분위기", "📝 꼼꼼한 코드 리뷰", "👩‍💻 실전 코딩",
    "🧠 논리적 사고력", "🗣️ 커뮤니케이션 역량", "🤖 AI 활용",
    "🌱 함께 성장"
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
        name: "익명1",
        attendCount: 3,
        timeAgo: "6달 전",
        title: "인생의 의미",
        content: "누가 시킨것도 ..부자가 되는 것도 아닌데 코딩테스트 문제를 풀고 바쁜 일상을 탈탈 털어 진지한 이야기를 나눈 소중한 경험",
        emojis: ["😃", "✨", "🔥"],
        likes: 2,
    },
    {
        name: "익명2",
        attendCount: 10,
        timeAgo: "2년 전",
        title: "Better together !",
        content: "혼자서는 엄두도 못 냈던 어려운 알고리즘 문제들! 테코테코 모임에서 함께 고민하고 해결하며 완독하는 뿌듯함을 느꼈습니다. 함께라면 우린 해낼 수 있어요!",
        emojis: ["🧡", "😍", "😃"],
        likes: 1,
    },
    {
        name: "익명3",
        attendCount: 8,
        timeAgo: "1년 전",
        title: "많은 것들을 배운 시간이었습니다!",
        content: "운이 좋게 좋은 문제, 열정적인 멤버, 그리고 많은 것을 배울 수 있는 동료들이 있는 모임에 참여하게 돼서 정말 의미 있는 시간이었습니다. 감사합니다 :)",
        emojis: ["☺️", "👍", "💡"],
        likes: 1,
    },
];

const ReviewCard: React.FC<{ review: Review }> = ({ review }) => (
    <div className="tecoteco-review-card">
        <div className="tecoteco-review-header">
            <span className="tecoteco-reviewer-name">{review.name}</span>
            <span className="tecoteco-review-meta">모임에 {review.attendCount}회 참석하고 작성한 후기예요. {review.timeAgo}</span>
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
        answer: '테코테코는 코딩 테스트 완전 정복을 목표로 하는 알고리즘 스터디입니다. 단순히 문제를 푸는 것을 넘어, 논리적 사고력과 커뮤니케이션 역량 강화를 지향합니다.'
    },
    {
        id: 2,
        question: '모임은 언제, 어디서 진행되나요?',
        answer: '매주 금요일 저녁 7:30 ~ 9:30에 강남역 인근 스터디룸에서 오프라인 모임을 중심으로 진행됩니다. 상황에 따라 온라인(Discord)으로 전환될 수 있습니다.'
    },
    {
        id: 3,
        question: '스터디 비용은 어떻게 되나요?',
        answer: '스터디룸 대관료는 참석자끼리 N/1로 정산합니다. 별도의 회비나 멤버십 비용은 없습니다.'
    },
    {
        id: 4,
        question: '참여하려면 어떻게 해야 하나요?',
        answer: '현재는 공식 모집은 진행하고 있지 않아요. 관심 있으신 분들은 @renechoi에게 커피챗을 요청해주시면 참여 방법을 안내해 드립니다.'
    },
    {
        id: 5,
        question: '코딩 테스트 실력이 부족해도 참여할 수 있나요?',
        answer: '네, 실력에 관계없이 누구나 참여할 수 있습니다. 함께의 가치를 중요하게 생각하며, 서로 돕고 배우며 성장할 수 있는 환경을 지향합니다.'
    }
];


const TecoTecoPage: React.FC = () => {
    const [openFaqId, setOpenFaqId] = useState<number | null>(null);

    const toggleFaq = (id: number) => {
        setOpenFaqId(prevId => (prevId === id ? null : id));
    };

    return (
        <div className="tecoteco-page">
            <TemplateHeader />
            <main className="tecoteco-content">
                {/* 1. 메인 슬로건 / 이미지 섹션 (상단 파트) */}
                <section className="tecoteco-hero-section">
                    <div className="hero-content">
                        <h1 className="hero-title">💯 코딩테스트 스터디, 테코테코</h1>
                        <p className="hero-subtitle">함께 자료구조와 알고리즘을 뿌시고 성장하는 개발자들의 공간입니다.</p>
                        {/* 이미지 추가 예정 */}
                        <div className="hero-image-wrapper">
                            <img src={process.env.PUBLIC_URL + '/images/tecoteco-profile.png'} alt="테코테코 프로필 이미지" />
                        </div>
                    </div>
                </section>

                {/* 2. 우리의 지향점 (Our Philosophy & Goals) 섹션 */}
                <section className="tecoteco-philosophy-section">
                    <h2 className="section-title">🎯 우리의 지향점</h2>
                    <p className="section-subtitle">테코테코는 알고리즘 풀이라는 하나의 구심점을 갖고 있지만 문제만 풀지는 않아요.</p>
                    <div className="philosophy-grid">
                        {/* 각 지향점 (함께의 가치, 성장의 경험, 현대적 접근) */}
                        <div className="philosophy-item">
                            <h3>함께의 가치 🤝</h3>
                            <p>혼자서는 꾸준히 하기 어려운 알고리즘 공부, 함께 모여 서로를 이끌어주고 동기를 부여합니다. 잘하든 못하든, 일단 참여하면 뭐라도 배우게 되는 마법을 경험할 수 있습니다.</p>
                        </div>
                        <div className="philosophy-item">
                            <h3>성장의 경험 🌱</h3>
                            <p>정답 코드만 보고 넘어가는 것이 아니라, 동료의 코드를 리뷰하고 토론하며 문제의 본질을 깊이 파고듭니다. 막혔던 부분에서 다 같이 "어?!" 하고 깨달음을 얻는 순간의 즐거움이야말로 테코테코의 핵심입니다.</p>
                        </div>
                        <div className="philosophy-item">
                            <h3>현대적 접근 🤖</h3>
                            <p>GPT와 같은 AI 도구를 배척하지 않습니다. 오히려 더 나은 질문을 통해 문제 해결의 힌트를 얻고, 내 코드를 개선하는 등 AI를 똑똑하게 활용하는 방법을 함께 고민하고 공유하는 진보적인 스터디를 지향합니다.</p>
                        </div>
                    </div>
                    <div className="final-goal">
                        <h3>최종 목표 🏆</h3>
                        <p>단순히 코딩 테스트를 '통과'하는 것을 넘어, 문제의 본질을 꿰뚫는 <strong>논리적 사고력</strong>과 어떤 상황에서도 최적의 해결책을 찾아내는 <strong>견고한 알고리즘 실력</strong>을 갖추는 것을 목표로 합니다. 또한, 함께 코드를 리뷰하고 토론하는 과정 속에서 자신의 생각을 명확하게 설명하고 동료를 설득하는 <strong>커뮤니케이션 역량</strong>을 기릅니다.</p>
                    </div>
                </section>

                {/* 3. 스터디 운영 방식 (How We Roll) 섹션 */}
                <section className="tecoteco-how-we-roll-section">
                    <h2 className="section-title">📖 스터디 운영 방식</h2>
                    <div className="operation-details">
                        <p><strong>정기 모임:</strong> 매주 금요일 저녁 7:30 ~ 9:30</p>
                        <p><strong>장소:</strong> 강남역 인근 스터디룸 (매주 Discord를 통해 장소 공지)</p>
                        <p><strong>모임 방식:</strong> 오프라인 모임을 중심으로 하며, 상황에 따라 온라인(Discord)으로 전환될 수 있습니다.</p>
                        <p><strong>주요 교재:</strong> <a href="https://product.kyobobook.co.kr/detail/S000212576322" target="_blank" rel="noopener noreferrer">코딩 테스트 합격자 되기: 자바 편 (골드래빗)</a></p>
                        <p><strong>온라인 저지:</strong> <a href="https://school.programmers.co.kr/learn/challenges" target="_blank" rel="noopener noreferrer">프로그래머스</a>, <a href="https://www.acmicpc.net/" target="_blank" rel="noopener noreferrer">백준</a></p>
                        <p><strong>스터디 비용:</strong> 스터디룸 대관료는 참석자끼리 N/1로 정산해요.</p>
                    </div>

                    <h3 className="subsection-title">진행 흐름 (예시)</h3>
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
                                <td><strong>19:30 ~ 20:20</strong></td>
                                <td><strong>이론/코드 리뷰</strong> (선정된 리뷰어가 주제/문제 발표)</td>
                            </tr>
                            <tr>
                                <td><strong>20:20 ~ 20:30</strong></td>
                                <td><strong>휴식 및 네트워킹</strong></td>
                            </tr>
                            <tr>
                                <td><strong>20:30 ~ 21:30</strong></td>
                                <td><strong>함께 문제 풀이</strong> (다같이 실시간으로 문제 해결)</td>
                            </tr>
                            </tbody>
                        </table>
                    </div>
                </section>

                {/* 4. 참여 방법 (How to Join) 섹션 */}
                <section className="tecoteco-join-section">
                    <h2 className="section-title">🚀 참여 방법</h2>
                    <p className="join-description">현재는 공식 모집은 안하고 있어요. 관심 있으신 분들에 한해서 참여 방법을 안내드리고 있어요. `@renechoi`에게 커피챗 주세요!</p>
                </section>

                {/* 5. GitHub 레포지토리 가이드라인 (Repository Guidelines) 섹션 */}
                <section className="tecoteco-github-guidelines-section">
                    <h2 className="section-title">💻 GitHub 레포지토리 가이드라인</h2>
                    <p className="guideline-intro">우리의 스터디 기록을 차곡차곡 쌓고, 동료의 코드를 쉽게 찾아볼 수 있도록 아래의 가이드라인을 따라주세요. 강제적인 규칙은 아니지만, 함께 지켜나갈 때 스터디가 더욱 풍성해집니다.</p>

                    <div className="guideline-item">
                        <h3>1. 폴더 구조 📂</h3>
                        <p>큰 틀의 구조만 유지해주시면 됩니다. 기본적으로 <strong>시즌 &gt; 주차/주제 &gt; 문제 &gt; 작성자</strong> 순으로 정리하고 있습니다.</p>
                        <pre className="code-example">
                            {`
- season02
  - week15_set
    - [02] 영어 끝말잇기
      - renechoi
        - 영어 끝말잇기.java
`}
                        </pre>
                        <p><strong>이론 학습 폴더 예시:</strong></p>
                        <pre className="code-example">
                            {`
- season1.5
  - study
    - queue
      - 우선순위큐_리뷰.md
`}
                        </pre>
                    </div>

                    <div className="guideline-item">
                        <h3>2. 커밋 메시지 💬</h3>
                        <p>어떤 작업을 했는지 다른 사람이 쉽게 알아볼 수 있도록 작성하는 것을 권장합니다. 정해진 형식은 없지만, 아래 예시처럼 플랫폼과 문제 이름을 포함해주시면 좋습니다.</p>
                        <pre className="code-example">
                            {`
- [Programmers] kdelay - 폰켓몬
- [백준] 집합의 표현 / renechoi
`}
                        </pre>
                        <p><strong>공지/리뷰 자료 업데이트 커밋 예시:</strong></p>
                        <pre className="code-example">
                            {`
- [시즌 2 - 15주차] - 유니온 파인드 시간 복잡도
- feat: week3 jiwonlee 풀이
`}
                        </pre>
                    </div>

                    <div className="guideline-item">
                        <h3>3. 파일명 규칙 ✍️</h3>
                        <p>로컬 환경에서 레포지토리를 클론할 때 오류가 발생하지 않도록, 특정 OS에서 인식하지 못하는 특수문자는 파일명에 사용하지 말아주세요.</p>
                        <p className="warning-text">🚫 <strong>사용 자제 문자:</strong> ?, *, :, &lt;, &gt;, | 등</p>
                    </div>
                </section>

                {/* 6. 우리의 발자취 (Our Journey) 섹션 */}
                <section className="tecoteco-journey-section">
                    <h2 className="section-title">👣 우리의 발자취</h2>
                    <ul className="journey-list">
                        <li><strong>시즌 1 (2024.09 ~ 2024.12):</strong> 자료구조 기본기 다지기 (배열, 스택, 큐, 해시, 트리)</li>
                        <li><strong>시즌 1.5 (2025.01 ~ 2025.03):</strong> 자료구조 복습 및 문제풀이 집중</li>
                        <li><strong>시즌 2 (2025.04 ~ 진행중):</strong> 심화 알고리즘 정복 (집합, 그래프, 백트래킹, DP, 그리디)</li>
                    </ul>
                    <div className="journey-image-wrapper">
                        <img src={process.env.PUBLIC_URL + '/images/2025-3q4q-schedule.png'} alt="2025년 3분기 4분기 스케줄" />
                    </div>
                </section>

                {/* 7. 함께하는 사람들 (Members) 섹션 */}
                <section className="tecoteco-members-section">
                    <h2 className="section-title">👨‍👩‍👧‍👦 함께하는 사람들</h2>
                    <p className="members-intro">테코테코를 만들어가는 멤버들입니다.</p>
                    <div className="tecoteco-contributors-list">
                        {tecotecoMembers.map((member, index) => (
                            <ContributorCard key={index} contributor={member} />
                        ))}
                    </div>
                </section>

                {/* 8. 주요 키워드 (Key Tags) 섹션 */}
                <section className="tecoteco-keywords-section">
                    <h2 className="section-title">✨ 테코테코를 나타내는 주요 키워드</h2>
                    <p className="section-subtitle">테코테코 멤버들이 직접 고른 태그예요.</p>
                    <div className="tecoteco-keywords-list">
                        {tecotecoKeywords.map((keyword, index) => (
                            <span key={index} className="tecoteco-keyword-tag">
                                {keyword}
                            </span>
                        ))}
                    </div>
                </section>

                {/* 9. 멤버 후기 (Reviews) 섹션 */}
                <section className="tecoteco-reviews-section">
                    <h2 className="section-title">💬 테코테코 멤버들은 이렇게 느꼈어요.</h2>
                    <div className="tecoteco-reviews-list">
                        {tecotecoReviews.map((review, index) => (
                            <ReviewCard key={index} review={review} />
                        ))}
                    </div>
                    <div className="tecoteco-view-all-reviews-wrapper">
                        <button className="tecoteco-view-all-reviews-button">후기 전체 보기 (N개)</button>
                    </div>
                </section>

                {/* 10. 자주 묻는 질문 (FAQ) 섹션 - 새로 추가 */}
                <section className="tecoteco-faq-section">
                    <h2 className="section-title">❓ 자주 묻는 질문</h2>
                    <p className="section-subtitle">테코테코 스터디에 대한 궁금증을 풀어보세요.</p>
                    <div className="tecoteco-faq-items">
                        {tecotecoFaqs.map(faq => (
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
                </section>

            </main>
            <Footer />
        </div>
    );
};

export default TecoTecoPage;