import React, { useState } from 'react';
import Modal from '../components/common/Modal/Modal';
import styles from './QueryDailyPromoDemo.module.css';

/**
 * QueryDaily 프로모션 통합 방안 데모 페이지
 * 5가지 프로모션 전략을 실제로 시각화하여 보여줍니다
 */
const QueryDailyPromoDemo: React.FC = () => {
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [activeDemo, setActiveDemo] = useState<number>(1);

  return (
    <div className={styles['demo-page']}>
      <div className={styles['demo-header']}>
        <h1>QueryDaily 프로모션 통합 데모</h1>
        <p>5가지 프로모션 방안을 실제 UI로 확인해보세요</p>
      </div>

      {/* Demo Navigation */}
      <div className={styles['demo-nav']}>
        <button
          className={activeDemo === 1 ? styles['active'] : ''}
          onClick={() => setActiveDemo(1)}
        >
          1. StudyPage 배너
        </button>
        <button
          className={activeDemo === 2 ? styles['active'] : ''}
          onClick={() => setActiveDemo(2)}
        >
          2. 상세페이지 카드
        </button>
        <button
          className={activeDemo === 3 ? styles['active'] : ''}
          onClick={() => setActiveDemo(3)}
        >
          3. 신청 성공 모달
        </button>
        <button
          className={activeDemo === 4 ? styles['active'] : ''}
          onClick={() => setActiveDemo(4)}
        >
          4. Homepage Featured
        </button>
        <button
          className={activeDemo === 5 ? styles['active'] : ''}
          onClick={() => setActiveDemo(5)}
        >
          5. Header 메뉴
        </button>
      </div>

      {/* Demo Content */}
      <div className={styles['demo-content']}>
        {/* Demo 1: StudyPage 프로모션 배너 */}
        {activeDemo === 1 && (
          <div className={styles['demo-section']}>
            <div className={styles['demo-description']}>
              <h2>📍 위치: StudyPage - 필터 바로 아래</h2>
              <p>타이밍: 스터디 탐색 시작 시점 (가장 높은 노출)</p>
              <p>효과: 모든 스터디 탐색자에게 100% 노출, 학습 의지가 높은 순간 도달</p>
            </div>

            <div className={styles['demo-preview']}>
              <div className={styles['mock-study-page']}>
                {/* Mock filter bar */}
                <div className={styles['mock-filter-bar']}>
                  <button>전체</button>
                  <button>모집중</button>
                  <button>시작예정</button>
                  <button>진행중</button>
                </div>

                {/* ACTUAL PROMO BANNER */}
                <div className={styles['querydaily-promo-banner']}>
                  <div className={styles['promo-pulse']}></div>
                  <div className={styles['promo-content']}>
                    <div className={styles['promo-left']}>
                      <span className={styles['promo-badge']}>NEW</span>
                      <h3>🎯 매일 3문제로 실력 쌓기</h3>
                      <p>QueryDaily - 다른 개발자들의 생각을 엿보며 함께 성장하세요</p>
                      <div className={styles['promo-features']}>
                        <span>✅ 매일 새로운 질문</span>
                        <span>✅ 다양한 답변 공유</span>
                        <span>✅ 학습 습관 형성</span>
                      </div>
                    </div>
                    <div className={styles['promo-right']}>
                      <button
                        onClick={() => window.open('https://querydaily.asyncsite.com/', '_blank')}
                        className={styles['promo-cta']}
                      >
                        지금 시작하기 →
                      </button>
                      <span className={styles['promo-subtext']}>5분이면 충분해요</span>
                    </div>
                  </div>
                </div>

                {/* Mock study cards */}
                <div className={styles['mock-study-grid']}>
                  <div className={styles['mock-study-card']}>테코테코</div>
                  <div className={styles['mock-study-card']}>시스템 디자인</div>
                  <div className={styles['mock-study-card']}>백엔드 딥다이브</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Demo 2: StudyDetailPage 컨텍스트 카드 */}
        {activeDemo === 2 && (
          <div className={styles['demo-section']}>
            <div className={styles['demo-description']}>
              <h2>📍 위치: StudyDetailPage - 참가 신청 버튼 아래</h2>
              <p>타이밍: 스터디 상세 확인 후</p>
              <p>효과: 스터디 참여 고려 중인 사용자 타겟, "스터디 + QueryDaily" 조합 제안</p>
            </div>

            <div className={styles['demo-preview']}>
              <div className={styles['mock-detail-page']}>
                <h2 className={styles['mock-study-title']}>테코테코 - 우테코 출신 개발자들의 회고록</h2>
                <p className={styles['mock-study-desc']}>매주 화요일 저녁 8시, 8주 과정</p>

                <button className={styles['mock-apply-button']}>📝 참가 신청하기</button>

                {/* ACTUAL COMPANION CARD */}
                <div className={styles['study-companion-card']}>
                  <div className={styles['companion-header']}>
                    <div className={styles['companion-icon']}>💡</div>
                    <div className={styles['companion-badge']}>추천</div>
                  </div>
                  <div className={styles['companion-content']}>
                    <h4>이 스터디와 함께하면 더 좋아요!</h4>
                    <p>QueryDaily로 매일 3문제씩 풀며 스터디 내용을 복습하세요</p>
                    <div className={styles['companion-benefits']}>
                      <div className={styles['benefit-item']}>
                        <span className={styles['benefit-icon']}>🔄</span>
                        <span>반복 학습</span>
                      </div>
                      <div className={styles['benefit-item']}>
                        <span className={styles['benefit-icon']}>👥</span>
                        <span>다양한 관점</span>
                      </div>
                      <div className={styles['benefit-item']}>
                        <span className={styles['benefit-icon']}>📈</span>
                        <span>꾸준한 성장</span>
                      </div>
                    </div>
                    <button
                      onClick={() => window.open('https://querydaily.asyncsite.com/', '_blank')}
                      className={styles['companion-cta']}
                    >
                      QueryDaily 둘러보기 →
                    </button>
                  </div>
                </div>

                <div className={styles['mock-study-content']}>
                  <p>스터디 상세 내용...</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Demo 3: 신청 성공 모달 */}
        {activeDemo === 3 && (
          <div className={styles['demo-section']}>
            <div className={styles['demo-description']}>
              <h2>📍 위치: 스터디 신청 성공 직후 모달</h2>
              <p>타이밍: Commitment 최고점 (신청 완료 직후)</p>
              <p>효과: 학습 의지가 가장 높은 순간 활용, 전환율 최고 예상 지점</p>
            </div>

            <div className={styles['demo-preview']}>
              <button
                className={styles['trigger-modal-button']}
                onClick={() => setShowSuccessModal(true)}
              >
                신청 성공 모달 보기
              </button>

              {/* ACTUAL SUCCESS MODAL WITH PROMO */}
              {showSuccessModal && (
                <div className={styles['modal-overlay']} onClick={() => setShowSuccessModal(false)}>
                  <div className={styles['success-modal']} onClick={(e) => e.stopPropagation()}>
                    <button
                      className={styles['modal-close']}
                      onClick={() => setShowSuccessModal(false)}
                    >
                      ×
                    </button>

                    <div className={styles['success-header']}>
                      <div className={styles['success-icon']}>✅</div>
                      <h2>신청이 완료되었습니다!</h2>
                      <p>심사 결과는 이메일로 알려드릴게요</p>
                    </div>

                    <div className={styles['success-divider']}>
                      <span>스터디 시작 전까지</span>
                    </div>

                    <div className={styles['querydaily-suggestion']}>
                      <div className={styles['suggestion-header']}>
                        <h3>🎯 QueryDaily로 실력 다지기</h3>
                        <span className={styles['suggestion-badge']}>무료</span>
                      </div>
                      <p className={styles['suggestion-desc']}>
                        매일 3문제로 기초를 탄탄히! 다른 개발자들의 해법도 확인하세요
                      </p>

                      <div className={styles['suggestion-features']}>
                        <div className={styles['feature-row']}>
                          <span>⏱️ 하루 5분 투자</span>
                          <span>🎓 실전 기술 질문</span>
                        </div>
                        <div className={styles['feature-row']}>
                          <span>💬 답변 공유 & 토론</span>
                          <span>📊 학습 기록 추적</span>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          window.open('https://querydaily.asyncsite.com/', '_blank');
                          setShowSuccessModal(false);
                        }}
                        className={styles['suggestion-cta']}
                      >
                        오늘의 문제 풀러 가기 →
                      </button>
                      <p className={styles['suggestion-note']}>
                        스터디 합격 전까지 QueryDaily로 준비하세요
                      </p>
                    </div>

                    <button
                      className={styles['modal-secondary']}
                      onClick={() => setShowSuccessModal(false)}
                    >
                      나중에 할게요
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Demo 4: Homepage Featured Section */}
        {activeDemo === 4 && (
          <div className={styles['demo-section']}>
            <div className={styles['demo-description']}>
              <h2>📍 위치: Homepage - Hero 섹션 다음</h2>
              <p>타이밍: 첫 방문자 또는 메인 페이지 탐색</p>
              <p>효과: 첫 인상에서 QueryDaily 소개, Study와 동등한 비중으로 제시</p>
            </div>

            <div className={styles['demo-preview']}>
              <div className={styles['mock-homepage']}>
                <div className={styles['mock-hero']}>
                  <h1>AsyncSite</h1>
                  <p>함께 성장하는 개발자 커뮤니티</p>
                </div>

                {/* ACTUAL FEATURED SERVICES */}
                <section className={styles['featured-services']}>
                  <h2>AsyncSite의 학습 도구</h2>
                  <div className={styles['services-grid']}>
                    <div className={styles['service-card-featured']}>
                      <span className={styles['featured-badge']}>NEW</span>
                      <div className={styles['service-icon']}>🎯</div>
                      <h3>QueryDaily</h3>
                      <p className={styles['service-desc']}>매일 3문제, 다른 사람의 생각 엿보기</p>
                      <ul className={styles['service-features']}>
                        <li>✅ 매일 새로운 기술 질문</li>
                        <li>✅ 다른 개발자들의 답변 공유</li>
                        <li>✅ 꾸준한 학습 습관 형성</li>
                      </ul>
                      <button
                        onClick={() => window.open('https://querydaily.asyncsite.com/', '_blank')}
                        className={styles['service-cta-featured']}
                      >
                        시작하기 →
                      </button>
                    </div>

                    <div className={styles['service-card']}>
                      <div className={styles['service-icon']}>📚</div>
                      <h3>Study</h3>
                      <p className={styles['service-desc']}>함께 성장하는 개발자 커뮤니티</p>
                      <ul className={styles['service-features']}>
                        <li>✅ 실무 중심 스터디</li>
                        <li>✅ 경험 많은 리더</li>
                        <li>✅ 체계적인 커리큘럼</li>
                      </ul>
                      <button className={styles['service-cta']}>
                        둘러보기 →
                      </button>
                    </div>
                  </div>
                </section>
              </div>
            </div>
          </div>
        )}

        {/* Demo 5: Header Menu */}
        {activeDemo === 5 && (
          <div className={styles['demo-section']}>
            <div className={styles['demo-description']}>
              <h2>📍 위치: Header Navigation</h2>
              <p>타이밍: 모든 페이지 탐색 중</p>
              <p>효과: 기본 접근성 제공, "NEW" 뱃지로 주목도 향상</p>
            </div>

            <div className={styles['demo-preview']}>
              {/* ACTUAL HEADER DEMO */}
              <div className={styles['mock-header']}>
                <div className={styles['mock-logo']}>AsyncSite</div>
                <nav className={styles['mock-nav']}>
                  <a href="#">WHO WE ARE</a>
                  <a href="#">STUDY</a>
                  <a href="#">PROJECT</a>
                  <a
                    href="https://querydaily.asyncsite.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles['nav-querydaily']}
                  >
                    QUERYDAILY
                    <span className={styles['nav-new-badge']}>NEW</span>
                  </a>
                  <a href="#">JOBS</a>
                  <a href="#">LAB</a>
                </nav>
              </div>

              <div className={styles['header-note']}>
                <p>💡 "NEW" 뱃지가 눈에 띄어 클릭을 유도합니다</p>
                <p>💡 모든 페이지에서 접근 가능합니다</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Summary Comparison */}
      <div className={styles['demo-summary']}>
        <h2>📊 각 방안 비교</h2>
        <table className={styles['comparison-table']}>
          <thead>
            <tr>
              <th>방안</th>
              <th>노출도</th>
              <th>전환율 예상</th>
              <th>구현 난이도</th>
              <th>추천도</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>1. StudyPage 배너</td>
              <td>⭐⭐⭐⭐⭐</td>
              <td>⭐⭐⭐⭐</td>
              <td>🟢 쉬움</td>
              <td>🔥 최우선</td>
            </tr>
            <tr>
              <td>2. 상세페이지 카드</td>
              <td>⭐⭐⭐⭐</td>
              <td>⭐⭐⭐⭐</td>
              <td>🟢 쉬움</td>
              <td>✅ 권장</td>
            </tr>
            <tr>
              <td>3. 신청 성공 모달</td>
              <td>⭐⭐⭐</td>
              <td>⭐⭐⭐⭐⭐</td>
              <td>🟡 보통</td>
              <td>🔥 최우선</td>
            </tr>
            <tr>
              <td>4. Homepage Featured</td>
              <td>⭐⭐⭐⭐⭐</td>
              <td>⭐⭐⭐</td>
              <td>🟢 쉬움</td>
              <td>✅ 권장</td>
            </tr>
            <tr>
              <td>5. Header 메뉴</td>
              <td>⭐⭐⭐⭐⭐</td>
              <td>⭐⭐</td>
              <td>🟢 쉬움</td>
              <td>⚪ 보조</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default QueryDailyPromoDemo;
