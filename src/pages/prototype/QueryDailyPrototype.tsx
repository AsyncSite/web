import React, { useState, useEffect } from 'react';
import styles from './QueryDailyPrototype.module.css';

const QueryDailyPrototype: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    resume: null as File | null,
  });
  const [resumeFileName, setResumeFileName] = useState<string>('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [activeQuestionTab, setActiveQuestionTab] = useState(0);

  useEffect(() => {
    // Smooth scroll setup
    const handleSmoothScroll = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'A' && target.getAttribute('href')?.startsWith('#')) {
        e.preventDefault();
        const targetId = target.getAttribute('href')?.slice(1);
        const targetElement = document.getElementById(targetId || '');
        if (targetElement) {
          targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    };

    document.addEventListener('click', handleSmoothScroll);
    return () => document.removeEventListener('click', handleSmoothScroll);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, files } = e.target;
    if (name === 'resume' && files && files[0]) {
      setFormData({ ...formData, resume: files[0] });
      setResumeFileName(files[0].name);
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const validateForm = () => {
    const newErrors: string[] = [];

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email || !emailRegex.test(formData.email)) {
      newErrors.push('올바른 이메일 주소를 입력해주세요');
    }

    // Name validation (optional but if provided, min 2 chars)
    if (formData.name && formData.name.trim().length < 2) {
      newErrors.push('이름은 2글자 이상 입력해주세요');
    }

    // Resume validation
    if (!formData.resume) {
      newErrors.push('PDF 형식의 이력서를 업로드해주세요');
    } else if (!formData.resume.name.toLowerCase().endsWith('.pdf')) {
      newErrors.push('PDF 형식만 업로드 가능합니다');
    } else if (formData.resume.size > 10 * 1024 * 1024) {
      newErrors.push('파일 크기는 10MB 이하여야 합니다');
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      setShowSuccessModal(true);
      // Reset form
      setFormData({ email: '', name: '', resume: null });
      setResumeFileName('');
    }
  };

  const closeModal = () => {
    setShowSuccessModal(false);
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.navContainer}>
          <div className={styles.nav}>
            <div className={styles.logo}>
              <span className={styles.logoText}>Query<span className={styles.logoAccent}>Daily</span></span>
              <span className={styles.betaTag}>BETA</span>
            </div>
            <nav className={styles.navMenu}>
              <a href="#why" className={styles.navLink}>왜 QueryDaily</a>
              <a href="#how-it-works" className={styles.navLink}>작동 방식</a>
              <a href="#testimonials" className={styles.navLink}>후기</a>
              <a href="#apply" className={`${styles.navLink} ${styles.navLinkCta}`}>
                <span>무료 시작</span>
                <span className={styles.navArrow}>→</span>
              </a>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className={styles.hero}>
        <div className={styles.heroContainer}>
          <div className={styles.heroContent}>
            <div className={styles.heroBadgeContainer}>
              <div className={styles.heroBadge}>
                <span className={styles.badgeIcon}>🎯</span>
                <span>선착순 <strong>10명 한정</strong> 베타 테스트</span>
              </div>
            </div>

            <h1 className={styles.heroTitle}>
              <span className={styles.heroTitleMain}>성장의 '자극'을</span><br/>
              <span className={styles.textGradient}>매일 아침 배달해 드립니다</span>
            </h1>

            <p className={styles.heroSubtitle}>
              매일 아침, 당신의 <strong>Java/Spring 프로젝트</strong>에서 가장 날카로운 질문 하나를 꺼내드립니다.<br/>
              <strong>7일 뒤,</strong> 당신은 스스로의 경험을 증명하는 법을 알게 됩니다.
            </p>

            <div className={styles.heroStats}>
              <div className={styles.statItem}>
                <div className={styles.statNumber}>7일</div>
                <div className={styles.statLabel}>무료 챌린지</div>
              </div>
              <div className={styles.statDivider}></div>
              <div className={styles.statItem}>
                <div className={styles.statNumber}>89%</div>
                <div className={styles.statLabel}>베타 참여자<br/>'매우 만족'</div>
              </div>
              <div className={styles.statDivider}></div>
              <div className={styles.statItem}>
                <div className={styles.statNumber}>3분</div>
                <div className={styles.statLabel}>하루 투자</div>
              </div>
            </div>

            <div className={styles.heroCta}>
              <a href="#apply" className={`${styles.btn} ${styles.btnPrimary} ${styles.btnLarge}`}>
                <span>7일 무료 챌린지, 지금 시작하기</span>
                <span className={styles.btnArrow}>→</span>
              </a>
              <p className={styles.ctaNote}>
                <span className={styles.noteIcon}>✓</span> 신용카드 불필요
                <span className={styles.noteDivider}>•</span>
                <span className={styles.noteIcon}>✓</span> 언제든 취소 가능
              </p>
            </div>
          </div>

          {/* Visual Element */}
          <div className={styles.heroVisual}>
            <div className={`${styles.floatingCard} ${styles.card1}`}>
              <div className={styles.cardHeader}>오늘의 질문</div>
              <div className={styles.cardContent}>
                "Redis 캐시 무효화 전략에서 Cache Aside와 Write Through 중 왜 그걸 선택하셨죠?"
              </div>
            </div>
            <div className={`${styles.floatingCard} ${styles.card2}`}>
              <div className={styles.cardHeader}>AI 분석 중...</div>
              <div className={styles.cardProgress}></div>
            </div>
            <div className={`${styles.floatingCard} ${styles.card3}`}>
              <div className={styles.cardEmoji}>☕</div>
            </div>
          </div>
        </div>
      </div>

      {/* Problem Section */}
      <div id="why" className={`${styles.section} ${styles.problem}`}>
        <div className={styles.sectionContainer}>
          <h2 className={styles.sectionTitle}>혹시 당신의 이야기인가요?</h2>
          <p className={styles.sectionSubtitle} style={{ fontSize: '1.5rem', color: '#c3e88d', marginBottom: '2rem' }}>
            "코드는 돌아가는데, 제 경력은 설명이 안됩니다."
          </p>

          <div className={styles.problemsBalancedGrid}>
            <div className={styles.problemCard}>
              <div className={styles.problemIcon}>🤔</div>
              <h3>"왜 썼죠?"</h3>
              <p>분명 내가 사용한 기술인데, '왜?'라는 질문 앞에서는 말문이 막힙니다.</p>
            </div>
            <div className={styles.problemCard}>
              <div className={styles.problemIcon}>🤯</div>
              <h3>"그래서 뭘 했죠?"</h3>
              <p>내 프로젝트는 너무 평범해서, 뭘 어떻게 어필해야 할지 모르겠습니다.</p>
            </div>
            <div className={styles.problemCard}>
              <div className={styles.problemIcon}>📚</div>
              <h3>"어떻게 다르죠?"</h3>
              <p>분명 Spring의 동작 원리는 아는데, 이걸 제 프로젝트 경험과 연결하지 못하겠습니다.</p>
            </div>
            <div className={styles.problemCard}>
              <div className={styles.problemIcon}>😰</div>
              <h3>"긴장하면 백지"</h3>
              <p>집에서는 잘 아는데, 면접장에서는 머릿속이 하얜집니다.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Solution Section */}
      <div className={`${styles.section} ${styles.solution}`}>
        <div className={styles.sectionContainer}>
          <h2 className={styles.sectionTitle}>
            면접 준비의 핵심은<br/>'답을 찾는 것'이 아닌, '질문을 아는 것'입니다.
          </h2>

          <div className={styles.solutionValues}>
            <div className={styles.valueItem}>
              <div className={styles.valueIcon}>🎯</div>
              <h3>당신만을 위한 질문</h3>
              <p>검색하면 나오는 빤한 질문은 그만. 당신의 프로젝트 경험과 기술 스택에서만 나올 수 있는 '꼬리 질문'으로 면접의 깊이를 더합니다.</p>
            </div>
            <div className={styles.valueItem}>
              <div className={styles.valueIcon}>💪</div>
              <h3>매일 만드는 실전 감각</h3>
              <p>거창한 계획은 필요 없습니다. 매일 단 하나의 질문에 답을 고민하는 것만으로 '면접 근육'이 자연스럽게 단련됩니다.</p>
            </div>
            <div className={styles.valueItem}>
              <div className={styles.valueIcon}>🧭</div>
              <h3>나만의 성장 지도</h3>
              <p>7일 후, 당신은 어떤 경험을 어떻게 정리해야 할지, 무엇을 더 보강해야 할지 스스로 알게 됩니다.</p>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works Section - Vertical Timeline */}
      <div id="how-it-works" className={`${styles.section} ${styles.howItWorks}`}>
        <div className={styles.sectionContainer}>
          <h2 className={styles.sectionTitle}>어떻게 작동하나요?</h2>
          <p className={styles.sectionSubtitle}>단 3단계로 시작하는 챌린지</p>

          <div className={styles.timeline}>
            <div className={styles.timelineItem}>
              <div className={styles.timelineMarker}>
                <div className={styles.timelineNumber}>1</div>
                <div className={styles.timelineIcon}>📄</div>
              </div>
              <div className={styles.timelineContent}>
                <h3 className={styles.timelineTitle}>이력서 제출</h3>
                <p className={styles.timelineDesc}>당신의 경험이 세상에 하나뿐인 면접 질문지가 됩니다.</p>
                <div className={styles.timelineDetail}>
                  <span className={styles.timelineTiming}>⏱ 소요 시간: 30초</span>
                  <span className={styles.timelineNote}>PDF 파일로 간단하게</span>
                </div>
              </div>
            </div>

            <div className={styles.timelineItem}>
              <div className={styles.timelineMarker}>
                <div className={styles.timelineNumber}>2</div>
                <div className={styles.timelineIcon}>👨‍🏫</div>
              </div>
              <div className={styles.timelineContent}>
                <h3 className={styles.timelineTitle}>매일 질문 수신</h3>
                <p className={styles.timelineDesc}>7일 동안 매일 아침, 전문가가 당신을 위한 질문을 준비합니다.</p>
                <div className={styles.timelineDetail}>
                  <span className={styles.timelineTiming}>📅 매일 오전 10시</span>
                  <span className={styles.timelineNote}>이메일로 편하게</span>
                </div>
              </div>
            </div>

            <div className={styles.timelineItem}>
              <div className={styles.timelineMarker}>
                <div className={styles.timelineNumber}>3</div>
                <div className={styles.timelineIcon}>🚀</div>
              </div>
              <div className={styles.timelineContent}>
                <h3 className={styles.timelineTitle}>성장의 시작</h3>
                <p className={styles.timelineDesc}>질문에 스스로 답을 고민하는 과정에서, 당신의 경험은 비로소 날카로운 무기가 됩니다.</p>
                <div className={styles.timelineDetail}>
                  <span className={styles.timelineTiming}>💎 7일 후 변화</span>
                  <span className={styles.timelineNote}>면접 자신감 상승</span>
                </div>
              </div>
            </div>
          </div>

          {/* Sample Email Preview */}
          <div className={styles.emailPreview}>
            <div className={styles.emailHeader}>
              <span className={styles.emailFrom}>QueryDaily</span>
              <span className={styles.emailTime}>오전 10:00</span>
            </div>
            <div className={styles.emailSubject}>[Day 3/7] 오늘의 면접 질문이 도착했습니다 🎯</div>
            <div className={styles.emailBody}>
              <p>안녕하세요 김개발님,</p>
              <p>오늘의 질문입니다:</p>
              <div className={styles.questionBox}>
                "이력서에 작성하신 '실시간 채팅 서비스'에서 WebSocket 대신
                Server-Sent Events를 고려해보셨나요?
                각각의 장단점과 선택 이유를 설명해주세요."
              </div>
              <p>💡 힌트: 양방향 통신의 필요성, 브라우저 호환성, 서버 부하를 고려해보세요.</p>
              <p style={{ marginTop: '15px', fontSize: '14px', color: '#999' }}>
                ✅ 무료 체험에서는 질문만 제공됩니다. 답변 가이드가 궁금하신가요?<br/>
                <a href="#pricing" style={{ color: '#c3e88d' }}>인터뷰 패스 알아보기 →</a>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Question Types Section - Tabbed Interface */}
      <div className={`${styles.section} ${styles.questionTypes}`}>
        <div className={styles.sectionContainer}>
          <h2 className={styles.sectionTitle}>어떤 질문들을 받게 되나요?</h2>
          <p className={styles.sectionSubtitle}>실제 면접관들이 자주 묻는 3가지 유형</p>

          {/* Tab Navigation */}
          <div className={styles.questionTabs}>
            <button
              className={`${styles.questionTab} ${activeQuestionTab === 0 ? styles.questionTabActive : ''}`}
              onClick={() => setActiveQuestionTab(0)}
            >
              <span className={styles.tabIcon}>🔗</span>
              <span className={styles.tabLabel}>경험 연결형</span>
            </button>
            <button
              className={`${styles.questionTab} ${activeQuestionTab === 1 ? styles.questionTabActive : ''}`}
              onClick={() => setActiveQuestionTab(1)}
            >
              <span className={styles.tabIcon}>⚖️</span>
              <span className={styles.tabLabel}>트레이드오프형</span>
            </button>
            <button
              className={`${styles.questionTab} ${activeQuestionTab === 2 ? styles.questionTabActive : ''}`}
              onClick={() => setActiveQuestionTab(2)}
            >
              <span className={styles.tabIcon}>🎯</span>
              <span className={styles.tabLabel}>상황 가정형</span>
            </button>
          </div>

          {/* Tab Content */}
          <div className={styles.questionTabContent}>
            {activeQuestionTab === 0 && (
              <div className={styles.questionTabPanel}>
                <div className={styles.questionBadge}>Type 1</div>
                <h3 className={styles.questionType}>🔗 경험 연결형</h3>
                <p className={styles.questionExample}>
                  "JPA 쓰면서 '차라리 SQL 짜는게 나았겠다' 싶었던 순간은 언제였나요?"
                </p>
                <div className={styles.questionInsight}>
                  <strong>면접관의 의도:</strong> 기술 선택의 후회와 실제 경험 확인
                </div>
                <div className={styles.additionalExamples}>
                  <h4>다른 예시들:</h4>
                  <ul>
                    <li>"왜 Spring Boot를 선택하셨나요? Express.js는 고려해보셨나요?"</li>
                    <li>"이력서에 작성하신 '성능 개선'이 정확히 어떤 지표를 개선한 건가요?"</li>
                    <li>"Redis 도입 후 장애가 발생한 적이 있나요? 어떻게 대응하셨죠?"</li>
                  </ul>
                </div>
              </div>
            )}
            {activeQuestionTab === 1 && (
              <div className={styles.questionTabPanel}>
                <div className={styles.questionBadge}>Type 2</div>
                <h3 className={styles.questionType}>⚖️ 트레이드오프형</h3>
                <p className={styles.questionExample}>
                  "성능 최적화했더니 코드 가독성이 망가졌는데, 그게 맞는 선택이었나요?"
                </p>
                <div className={styles.questionInsight}>
                  <strong>면접관의 의도:</strong> 트레이드오프 인식과 의사결정 판단력
                </div>
                <div className={styles.additionalExamples}>
                  <h4>다른 예시들:</h4>
                  <ul>
                    <li>"MSA로 전환하면서 복잡도가 증가했는데, 그만한 가치가 있었나요?"</li>
                    <li>"JPA의 편리함 vs Native Query의 성능, 어떤 기준으로 선택하시나요?"</li>
                    <li>"테스트 커버리지 100%가 정말 필요한가요? 시간 대비 효율은요?"</li>
                  </ul>
                </div>
              </div>
            )}
            {activeQuestionTab === 2 && (
              <div className={styles.questionTabPanel}>
                <div className={styles.questionBadge}>Type 3</div>
                <h3 className={styles.questionType}>🎯 상황 가정형</h3>
                <p className={styles.questionExample}>
                  "Spring Batch로 대용량 데이터를 처리하던 중 OOM이 발생한다면,
                  어떤 순서로 문제를 진단하고 해결하시겠습니까?"
                </p>
                <div className={styles.questionInsight}>
                  <strong>면접관의 의도:</strong> 문제 해결 접근법, 실무 대처 능력
                </div>
                <div className={styles.additionalExamples}>
                  <h4>다른 예시들:</h4>
                  <ul>
                    <li>"배포 직후 API 응답속도가 10배 느려졌어요. 어떻게 접근하시겠어요?"</li>
                    <li>"DB 커넥션 풀이 고갈되는 상황, 당장 어떻게 대응하실 건가요?"</li>
                    <li>"코드리뷰에서 시니어와 의견 충돌이 생긴다면 어떻게 하시겠어요?"</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div id="testimonials" className={`${styles.section} ${styles.testimonials}`}>
        <div className={styles.sectionContainer}>
          <h2 className={styles.sectionTitle}>먼저 경험한 개발자들의 이야기</h2>

          <div className={styles.testimonialsCarousel}>
            <div className={styles.testimonialsWrapper} style={{ transform: `translateX(-${currentTestimonial * 100}%)` }}>
              {[
                {
                  name: '김**',
                  role: '백엔드 2년차',
                  avatar: '👨‍💻',
                  text: '"제 이력서에 있는 프로젝트 기반으로 질문이 와서 놀랐어요. 덕분에 실제 면접에서 당황하지 않고 잘 대답할 수 있었습니다."',
                  result: '💼 N사 합격'
                },
                {
                  name: '이**',
                  role: 'Java 백엔드 신입',
                  avatar: '👩‍💻',
                  text: '"매일 한 문제씩이라 부담없이 준비할 수 있었어요. 출근길 지하철에서 답변 구상하는 게 일상이 됐습니다."',
                  result: '💼 스타트업 3곳 합격'
                },
                {
                  name: '박**',
                  role: 'Spring 백엔드 3년차',
                  avatar: '🧑‍💻',
                  text: '"기술 면접 준비의 방향을 잡을 수 있었습니다. 특히 트레이드오프 관련 질문들이 정말 도움됐어요."',
                  result: '💼 연봉 협상 성공'
                },
                {
                  name: '최**',
                  role: '백엔드 1년차',
                  avatar: '👨‍🎓',
                  text: '"비전공자로 치열한 경쟁을 뚫고 취업했어요. QueryDaily가 저의 경험을 설명하는 방법을 가르쳐줬어요."',
                  result: '🎆 대기업 합격'
                },
                {
                  name: '정**',
                  role: 'Spring 백엔드 4년차',
                  avatar: '👩‍🏫',
                  text: '"이직 준비하면서 제가 놓치고 있던 부분을 발견했어요. 왜 그렇게 했는지 설명하는 연습이 큰 도움이 됐습니다."',
                  result: '🚀 외국계 테크 회사'
                },
                {
                  name: '서**',
                  role: '부트캠프 수료생',
                  avatar: '🥰',
                  text: '"처음엔 \'내가 잘할 수 있을까\' 고민했는데, 7일 후엔 자신감이 생겼어요. 매일 받는 질문이 저를 성장시켰습니다."',
                  result: '🎯 원하는 회사 카카오'
                }
              ].map((testimonial, index) => (
                <div key={index} className={styles.testimonialSlide}>
                  <div className={styles.testimonialCard}>
                    <div className={styles.testimonialHeader}>
                      <div className={styles.testimonialAvatar}>{testimonial.avatar}</div>
                      <div className={styles.testimonialInfo}>
                        <div className={styles.testimonialName}>{testimonial.name}</div>
                        <div className={styles.testimonialRole}>{testimonial.role}</div>
                      </div>
                      <div className={styles.testimonialRating}>⭐⭐⭐⭐⭐</div>
                    </div>
                    <p className={styles.testimonialText}>{testimonial.text}</p>
                    <div className={styles.testimonialResult}>{testimonial.result}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Carousel Controls */}
            <button
              className={`${styles.carouselBtn} ${styles.carouselBtnPrev}`}
              onClick={() => setCurrentTestimonial(prev => prev === 0 ? 5 : prev - 1)}
              aria-label="Previous testimonial"
            >
              ‹
            </button>
            <button
              className={`${styles.carouselBtn} ${styles.carouselBtnNext}`}
              onClick={() => setCurrentTestimonial(prev => prev === 5 ? 0 : prev + 1)}
              aria-label="Next testimonial"
            >
              ›
            </button>

            {/* Carousel Dots */}
            <div className={styles.carouselDots}>
              {[0, 1, 2, 3, 4, 5].map((index) => (
                <button
                  key={index}
                  className={`${styles.dot} ${currentTestimonial === index ? styles.activeDot : ''}`}
                  onClick={() => setCurrentTestimonial(index)}
                  aria-label={`Go to testimonial ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className={`${styles.section} ${styles.faqSection}`}>
        <div className={styles.sectionContainer}>
          <h2 className={styles.sectionTitle}>아직 고민되시나요?</h2>
          <p className={styles.sectionSubtitle}>가장 많이 궁금해하시는 점들을 정리했습니다</p>

          <div className={styles.faqGrid}>
            <div className={styles.faqItem}>
              <div className={styles.faqQuestion}>
                <span className={styles.faqIcon}>🤔</span>
                <h3>정말 내 이력서에 맞는 질문이 올까요?</h3>
              </div>
              <p className={styles.faqAnswer}>
                네, <strong>현직 면접관 수준의 전문가로 파인 튜닝한 AI</strong>가<br/>
                당신의 기술 스택, 프로젝트 경험, 사용한 라이브러리까지 분석해서 실제 면접관이 물어볼 만한 꼬리 질문을 생성합니다.
                <br/><br/>
                ❌ "왜 Spring Security를 썼나요?" 같은 뻔한 질문이 아닌,<br/>
                ✅ "JWT 인증 방식에서 Refresh Token을 사용하셨나요?<br/>
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;만약 사용했다면 어디에 어떻게 저장하셨고,<br/>
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;그 이유는 무엇인가요?"<br/>
                같은 <strong>날카로운 질문</strong>을 받게 됩니다.
              </p>
            </div>

            <div className={styles.faqItem}>
              <div className={styles.faqQuestion}>
                <span className={styles.faqIcon}>⏰</span>
                <h3>7일이면 충분한가요?</h3>
              </div>
              <p className={styles.faqAnswer}>
                <strong>7일은 시작입니다.</strong><br/>
                이 기간 동안 당신은 자신의 약점을 명확히 파악하고,<br/>
                어떤 부분을 보강해야 할지 알게 됩니다.
                <br/><br/>
                📌 <strong>핵심은 깊이입니다</strong><br/>
                매일 단 하나의 질문에 깊이 고민하는 것이<br/>
                100개의 질문을 훑어보는 것보다 효과적입니다.
              </p>
            </div>

            <div className={styles.faqItem}>
              <div className={styles.faqQuestion}>
                <span className={styles.faqIcon}>💭</span>
                <h3>답변 가이드 없이 혼자 할 수 있을까요?</h3>
              </div>
              <p className={styles.faqAnswer}>
                <strong>오히려 그래서 효과적입니다.</strong><br/>
                스스로 고민하고 답을 찾는 과정에서<br/>
                진짜 <strong>'면접 근육'</strong>이 생깁니다.
                <br/><br/>
                💪 답변이 궁금하다면<br/>
                7일 후 '인터뷰 패스' 플랜으로 업그레이드하실 수 있습니다.<br/>
                하지만 <strong>먼저 스스로 생각해보는 시간</strong>이 꼭 필요합니다.
              </p>
            </div>

            <div className={styles.faqItem}>
              <div className={styles.faqQuestion}>
                <span className={styles.faqIcon}>🎯</span>
                <h3>어떤 사람에게 가장 효과적인가요?</h3>
              </div>
              <p className={styles.faqAnswer}>
                <strong>이런 분들께 가장 효과적입니다:</strong>
                <br/><br/>
                ✅ 이력서는 준비됐지만 <strong>면접이 막막한</strong> 주니어 개발자<br/>
                ✅ 특히 <strong>1-3년차 개발자</strong>분들<br/>
                ✅ 코드는 잘 짜지만 <strong>왜 그렇게 짰는지</strong> 설명하기 어려우신 분<br/>
                ✅ 기술 선택의 이유를 <strong>논리적으로 설명</strong>하고 싶으신 분
              </p>
            </div>

            <div className={styles.faqItem}>
              <div className={styles.faqQuestion}>
                <span className={styles.faqIcon}>🌐</span>
                <h3>Java/Spring이 아닌 다른 기술 스택도 지원하나요?</h3>
              </div>
              <p className={styles.faqAnswer}>
                <strong>현재는 Java/Spring 백엔드 개발자를 위한 베타 테스트 중입니다.</strong>
                <br/><br/>
                📅 <strong>향후 지원 예정 기술 스택:</strong><br/>
                • Python/Django, FastAPI<br/>
                • Node.js/Express, NestJS<br/>
                • Go (Gin, Echo)<br/>
                • Ruby on Rails<br/>
                <br/>
                💡 다른 기술 스택 개발자시라면,<br/>
                이메일을 남겨주시면 <strong>해당 스택 오픈 시 우선 안내</strong>해드리겠습니다.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Privacy Trust Section */}
      <div className={`${styles.section} ${styles.privacyTrust}`}>
        <div className={styles.sectionContainer}>
          <h2 className={styles.sectionTitle}>🔒 당신의 이력서, 안전하게 다룹니다</h2>
          <p className={styles.sectionSubtitle}>개발자가 개발자를 위해 만든, 가장 투명한 이력서 분석 시스템</p>

          <div className={styles.privacyGrid}>
            <div className={styles.privacyCard}>
              <div className={styles.cardIcon}>🎯</div>
              <h3>오직 면접 질문 생성</h3>
              <p>이력서는 단 하나의 목적으로만 사용됩니다:<br/>
              <strong>당신만을 위한 맞춤형 면접 질문 생성</strong></p>
              <ul>
                <li>프로젝트 경험 분석</li>
                <li>기술 스택 깊이 파악</li>
                <li>경력 수준별 질문 난이도 조정</li>
              </ul>
            </div>

            <div className={styles.privacyCard}>
              <div className={styles.cardIcon}>⏱️</div>
              <h3>7일 후 완전 삭제</h3>
              <p>챌린지 종료와 동시에 모든 데이터가 삭제됩니다</p>
              <div className={styles.deletionTimeline}>
                <div className={styles.timelineItem}>
                  <span className={styles.day}>Day 1-7</span>
                  <span>암호화 보관</span>
                </div>
                <div className={styles.timelineItem}>
                  <span className={styles.day}>Day 8</span>
                  <span>자동 영구 삭제</span>
                </div>
              </div>
              <p className={styles.note}>💡 원하시면 언제든 즉시 삭제 요청 가능</p>
            </div>

            <div className={styles.privacyCard}>
              <div className={styles.cardIcon}>🛡️</div>
              <h3>철저한 보안</h3>
              <p>당신의 정보를 지키는 우리의 약속:</p>
              <ul>
                <li>제3자 공유 절대 없음</li>
                <li>마케팅 활용 절대 없음</li>
                <li>AWS 암호화 저장</li>
                <li>접근 권한 최소화 (개발자 2명만)</li>
              </ul>
            </div>
          </div>

          <div className={styles.trustFooter}>
            <p>
              <strong>왜 이력서가 필요한가요?</strong><br/>
              일반적인 "JPA 왜 썼나요?" 같은 질문이 아닌,<br/>
              당신의 프로젝트와 경험을 깊이 이해한 후에만 나올 수 있는<br/>
              <span style={{ color: '#c3e88d' }}>진짜 날카로운 맞춤형 질문</span>을 만들기 위해서입니다.
            </p>
          </div>
        </div>
      </div>

      {/* Application Form Section */}
      <div id="apply" className={`${styles.section} ${styles.apply}`}>
        <div className={styles.applyContainer}>
          <div className={styles.applyWrapper}>
            <div className={styles.applyInfo}>
              <h2 className={styles.applyTitle}>
                <span style={{ color: '#c3e88d', fontSize: '1.2rem' }}>선착순 10명 모집</span><br/>
                Java/Spring 개발자 베타 테스트
              </h2>

              {/* 타겟 안내 */}
              <div className={styles.targetNotice}>
                <div className={styles.comingSoon}>
                  <strong>🚀 곧 지원 예정:</strong>
                  <div className={styles.techTags}>
                    <span className={styles.techTag}>Python/Django</span>
                    <span className={styles.techTag}>Node.js/Express</span>
                    <span className={styles.techTag}>Go</span>
                    <span className={styles.techTag}>Ruby on Rails</span>
                  </div>
                </div>
              </div>

              <div className={styles.applyUrgency}>
                <div className={styles.spotsProgress}>
                  <div className={styles.progressBar}>
                    <span className={`${styles.spot} ${styles.filled}`}>✓</span>
                    <span className={`${styles.spot} ${styles.filled}`}>✓</span>
                    <span className={`${styles.spot} ${styles.filled}`}>✓</span>
                    <span className={`${styles.spot} ${styles.filled}`}>✓</span>
                    <span className={`${styles.spot} ${styles.filled}`}>✓</span>
                    <span className={`${styles.spot} ${styles.filled}`}>✓</span>
                    <span className={`${styles.spot} ${styles.filled}`}>✓</span>
                    <span className={`${styles.spot} ${styles.empty}`}>○</span>
                    <span className={`${styles.spot} ${styles.empty}`}>○</span>
                    <span className={`${styles.spot} ${styles.empty}`}>○</span>
                  </div>
                  <p className={styles.progressText}><strong>7/10명</strong> 신청 완료</p>
                </div>
                <p className={styles.urgencyMessage}>🔥 <strong>마감 임박!</strong> 남은 자리가 얼마 없습니다.</p>
                <p className={styles.applyDesc}>
                  선착순 10명의 Java/Spring 백엔드 개발자를 모집합니다.<br/>
                  이력서 PDF를 분석하여 맞춤형 질문을 준비합니다.
                </p>
              </div>

              <div className={styles.applyFeatures}>
                <div className={styles.applyFeature}>
                  <span className={styles.featureCheck}>✓</span>
                  <div>
                    <strong>7일 무료 챌린지</strong>
                    <p>날카로운 질문으로 시작하는 성장</p>
                  </div>
                </div>
                <div className={styles.applyFeature}>
                  <span className={styles.featureCheck}>✓</span>
                  <div>
                    <strong>신용카드 불필요</strong>
                    <p>결제 정보 없이 바로 시작</p>
                  </div>
                </div>
                <div className={styles.applyFeature}>
                  <span className={styles.featureCheck}>✓</span>
                  <div>
                    <strong>언제든 취소 가능</strong>
                    <p>원할 때 자유롭게 중단</p>
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.applyCard}>
              <form className={styles.applicationForm} onSubmit={handleSubmit}>
                <div className={styles.formGroup}>
                  <label htmlFor="email">이메일 <span style={{ color: '#f07178' }}>*</span></label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    placeholder="example@gmail.com"
                    value={formData.email}
                    onChange={handleInputChange}
                  />
                  <p className={styles.formHint}>매일 이 이메일로 날카로운 질문을 보내드립니다</p>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="name">이름 <span style={{ color: '#707070', fontSize: '0.9rem' }}>(선택)</span></label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    placeholder="홍길동"
                    value={formData.name}
                    onChange={handleInputChange}
                  />
                  <p className={styles.formHint}>더 친근한 메일을 보내드릴 수 있어요</p>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="resume">이력서/포트폴리오 PDF <span style={{ color: '#f07178' }}>*</span></label>
                  <div className={styles.fileUpload}>
                    <input
                      type="file"
                      id="resume"
                      name="resume"
                      accept=".pdf"
                      required
                      style={{ display: 'none' }}
                      onChange={handleInputChange}
                    />
                    <label htmlFor="resume" className={styles.fileLabel}>
                      {resumeFileName || '📎 PDF 파일 선택'}
                    </label>
                  </div>
                  <p className={styles.formHint}>PDF 형식만 지원</p>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.checkboxLabel}>
                    <input type="checkbox" required />
                    <span>개인정보 수집 및 이용에 동의합니다</span>
                  </label>
                </div>

                <button type="submit" className={`${styles.btn} ${styles.btnPrimary} ${styles.btnSubmit}`}>
                  🎯 베타 테스트 신청하기
                </button>

                <p className={styles.formSimpleNote}>
                  💡 <strong>30초면 충분!</strong> 추가 정보는 시작 후 이메일로 안내드려요.
                </p>

                <div className={styles.emotionalMessage}>
                  <p>
                    "당신의 경험은 결코 평범하지 않습니다.<br/>
                    단지, 그것을 증명하는 방법을 배우지 못했을 뿐입니다."
                  </p>
                </div>

                <p className={styles.formFooter}>
                  가입 시 <a href="#">서비스 이용약관</a>과
                  <a href="#">개인정보처리방침</a>에 동의하게 됩니다.
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.sectionContainer}>
          <div className={styles.footerContent}>
            <div className={styles.footerMain}>
              <div className={styles.footerBrand}>
                <span className={styles.logoText}>Query<span className={styles.logoAccent}>Daily</span></span>
                <p>주니어 개발자를 위한 맞춤형 면접 트레이닝</p>
              </div>

              <div className={styles.footerLinks}>
                <div className={styles.footerColumn}>
                  <h4>서비스</h4>
                  <a href="#">작동 방식</a>
                  <a href="#">요금 안내</a>
                  <a href="#">자주 묻는 질문</a>
                </div>
                <div className={styles.footerColumn}>
                  <h4>회사</h4>
                  <a href="#">소개</a>
                  <a href="#">블로그</a>
                  <a href="#">채용</a>
                </div>
                <div className={styles.footerColumn}>
                  <h4>지원</h4>
                  <a href="#">문의하기</a>
                  <a href="#">이용약관</a>
                  <a href="#">개인정보처리방침</a>
                </div>
              </div>
            </div>

            <div className={styles.footerBottom}>
              <p>© 2024 QueryDaily. All rights reserved.</p>
              <div className={styles.socialLinks}>
                <a href="#" aria-label="Twitter">𝕏</a>
                <a href="#" aria-label="LinkedIn">in</a>
                <a href="#" aria-label="GitHub">⊙</a>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Error Toast */}
      {errors.length > 0 && (
        <div className={`${styles.errorToast} ${styles.show}`}>
          <div className={styles.errorContent}>
            <h4>⚠️ 입력 오류</h4>
            <ul>
              {errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className={`${styles.modal} ${styles.active}`}>
          <div className={styles.modalContent}>
            <div className={styles.modalIcon}>🎉</div>
            <h2 className={styles.modalTitle}>신청이 완료되었습니다!</h2>
            <p className={styles.modalText}>
              첫 질문은 <strong>내일 오전 10시</strong>에 발송됩니다.<br />
              스팸 메일함도 꼭 확인해주세요.
            </p>
            <div className={styles.modalTips}>
              <h3>💡 준비 팁</h3>
              <ul>
                <li>질문을 받으면 먼저 1-2분 동안 답변 구조를 생각해보세요</li>
                <li>STAR 기법(Situation-Task-Action-Result)을 활용해보세요</li>
                <li>구체적인 경험과 수치를 포함하면 더욱 좋습니다</li>
              </ul>
            </div>
            <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={closeModal}>확인</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default QueryDailyPrototype;