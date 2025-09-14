import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DocuMentorStats } from './types';
import styles from './DocuMentor.module.css';

interface Props {
  onSubmit: (url: string, email?: string, tone?: string, purpose?: string, audience?: string, marketingConsent?: boolean) => void;
  stats: DocuMentorStats;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  hasUsedTrial?: boolean;
}

const TONE_OPTIONS = [
  {
    value: 'sns',
    emoji: '💬',
    name: 'SNS 스타일',
    example: '"ㅋㅋㅋ 이거 완전 찐이다!! 🔥 근데 엔딩이 좀 별로임 ㅠㅠ 다시 ㄱㄱ"',
    isRecommended: true
  },
  {
    value: 'resume',
    emoji: '💼',
    name: '이력서 전문가',
    example: '"경력 기술이 모호합니다. STAR 기법으로 정량적 성과를 제시하세요."'
  },
  {
    value: 'friend',
    emoji: '🤗',
    name: '친근한 친구',
    example: '"야, 이 부분 좀 애매한데? 이렇게 바꿔보는 게 어때?"'
  },
  {
    value: 'editor',
    emoji: '📝',
    name: '전문 편집자',
    example: '"3번째 단락의 논지 전개가 불명확합니다. 구체적인 근거를 추가하시기 바랍니다."'
  },
  {
    value: 'mentor',
    emoji: '💝',
    name: '따뜻한 멘토',
    example: '"정말 잘 쓰셨네요! 여기만 조금 다듬으면 완벽할 것 같아요."'
  },
  {
    value: 'critic',
    emoji: '🔥',
    name: '직설적 비평가',
    example: '"이 부분은 틀렸습니다. 논리적 비약이 있어 독자가 이해하기 어렵습니다."'
  }
];

function DocuMentorForm({ onSubmit, stats, isAuthenticated, loading, error, hasUsedTrial }: Props): React.ReactNode {
  const navigate = useNavigate();
  const [url, setUrl] = useState('');
  const [email, setEmail] = useState('');
  const [tone, setTone] = useState<string>('mentor');
  const [purpose, setPurpose] = useState<string>('');
  const [audience, setAudience] = useState<string>('');
  const [urlError, setUrlError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [showOptions, setShowOptions] = useState(false);
  const [marketingConsent, setMarketingConsent] = useState(false);

  const validateUrl = (urlString: string): boolean => {
    if (!urlString) {
      setUrlError('URL을 입력해주세요');
      return false;
    }

    try {
      const urlObj = new URL(urlString);
      if (!['http:', 'https:'].includes(urlObj.protocol)) {
        setUrlError('올바른 URL 형식이 아니에요 (http:// 또는 https://로 시작해야 해요)');
        return false;
      }
      setUrlError(null);
      return true;
    } catch {
      setUrlError('올바른 URL 형식이 아니에요');
      return false;
    }
  };

  const validateEmail = (emailString: string): boolean => {
    if (!emailString) {
      setEmailError('이메일을 입력해주세요');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailString)) {
      setEmailError('올바른 이메일 형식이 아니에요');
      return false;
    }
    
    setEmailError(null);
    return true;
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUrl(e.target.value);
    if (urlError) setUrlError(null);
  };

  const handleUrlBlur = () => {
    if (url) {
      validateUrl(url);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // 비로그인 사용자는 이메일 검증
    if (!isAuthenticated) {
      if (!validateEmail(email)) return;
    }
    
    if (url && validateUrl(url)) {
      onSubmit(url, !isAuthenticated ? email : undefined, tone, purpose || undefined, audience || undefined, !isAuthenticated ? marketingConsent : undefined);
    }
  };

  return (
    <div className={styles.formContainer}>
      <h2 className={styles.formTitle}>
        {!isAuthenticated ? (
          <>🎉 9월 31일까지 무제한 무료!</>
        ) : (
          <>🔗 리뷰 받고 싶은 글 링크를 알려주세요</>
        )}
      </h2>
      <div className={styles.formCard}>
        <form onSubmit={handleSubmit}>
          {/* Email Input for non-authenticated users */}
          {!isAuthenticated && (
            <div className={styles.inputGroup}>
              <label className={styles.inputLabel}>📧 결과를 받아보실 이메일</label>
              <input
                type="email"
                className={`${styles.urlInput} ${emailError ? styles.error : ''}`}
                placeholder="your@email.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (emailError) setEmailError(null);
                }}
                onBlur={() => email && validateEmail(email)}
                disabled={loading}
                autoComplete="email"
              />
              {emailError && (
                <div className={styles.errorMessage}>
                  ⚠️ {emailError}
                </div>
              )}
              
              {/* Marketing Consent Checkbox */}
              <div className={styles.marketingWrapper}>
                <label className={styles.marketingConsent}>
                  <input
                    type="checkbox"
                    checked={marketingConsent}
                    onChange={(e) => setMarketingConsent(e.target.checked)}
                    disabled={loading}
                  />
                  <div className={styles.consentContent}>
                    <span className={styles.consentText}>
                      도큐멘토의 글쓰기 팁과 새로운 기능 소식 받기
                    </span>
                    <span className={styles.consentFrequency}>월 1-2회, 언제든 구독 해지 가능</span>
                  </div>
                </label>
                <div className={`${styles.consentBenefits} ${marketingConsent ? styles.benefitsActive : ''}`}>
                  <span className={styles.benefitEmoji}>🎁</span>
                  <span className={styles.benefitText}>구독자 전용 혜택</span>
                  <span className={styles.benefitDivider}>•</span>
                  <span className={styles.benefitEmoji}>📚</span>
                  <span className={styles.benefitText}>글쓰기 꿀팁</span>
                  <span className={styles.benefitDivider}>•</span>
                  <span className={styles.benefitEmoji}>🚀</span>
                  <span className={styles.benefitText}>신기능 먼저 체험</span>
                </div>
              </div>
            </div>
          )}

          {/* URL Input */}
          <div className={styles.inputGroup}>
            {!isAuthenticated && !hasUsedTrial && (
              <label className={styles.inputLabel}>🔗 리뷰 받을 글의 URL</label>
            )}
            <input
              type="url"
              className={`${styles.urlInput} ${urlError ? styles.error : ''}`}
              placeholder="https://blog.naver.com/mypost..."
              value={url}
              onChange={handleUrlChange}
              onBlur={handleUrlBlur}
              disabled={loading}
              autoComplete="url"
            />
            {urlError && (
              <div className={styles.errorMessage}>
                ⚠️ {urlError}
              </div>
            )}
          </div>

          {/* Additional Options */}
          <div className={styles.additionalOptions}>
            <button
              type="button"
              className={styles.optionsToggle}
              onClick={() => setShowOptions(!showOptions)}
              disabled={loading}
            >
              <span className={styles.toggleIcon}>{showOptions ? '▼' : '▶'}</span>
              <span className={styles.toggleText}>추가 옵션 설정</span>
              <span className={styles.recommendBadge}>추천 톤 있음!</span>
              <span className={styles.toggleHint}>AI 리뷰를 더 정확하게 받고 싶다면</span>
            </button>
            
            {/* Tone Preview - Always visible */}
            {!showOptions && (
              <div className={styles.tonePreview}>
                <span className={styles.previewLabel}>추천 AI 톤:</span>
                <div className={styles.previewTones}>
                  <button
                    type="button"
                    className={`${styles.previewTone} ${tone === 'sns' ? styles.selected : ''}`}
                    onClick={() => {
                      setTone('sns');
                      setShowOptions(true);
                    }}
                    disabled={loading}
                  >
                    💬 SNS 스타일
                  </button>
                </div>
              </div>
            )}
            
            {showOptions && (
              <div className={styles.optionsContent}>
                <div className={styles.infoField}>
                  <label className={styles.infoLabel}>🎯 글의 목적이 무엇인가요? (선택사항)</label>
                  <select
                    className={styles.infoSelect}
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                    disabled={loading}
                  >
                    <option value="">선택하지 않음</option>
                    <option value="정보전달">정보 전달</option>
                    <option value="마케팅">마케팅/홍보</option>
                    <option value="일기">일기/에세이</option>
                    <option value="리뷰">제품/서비스 리뷰</option>
                    <option value="교육">교육/튜토리얼</option>
                    <option value="이력서">이력서/자소서</option>
                    <option value="기타">기타</option>
                  </select>
                </div>
                
                <div className={styles.infoField}>
                  <label className={styles.infoLabel}>👥 누가 읽을 글인가요? (선택사항)</label>
                  <select
                    className={styles.infoSelect}
                    value={audience}
                    onChange={(e) => setAudience(e.target.value)}
                    disabled={loading}
                  >
                    <option value="">선택하지 않음</option>
                    <option value="일반대중">일반 대중</option>
                    <option value="전문가">전문가/업계 종사자</option>
                    <option value="학생">학생</option>
                    <option value="20-30대">20-30대</option>
                    <option value="40대이상">40대 이상</option>
                    <option value="기타">기타</option>
                  </select>
                </div>
                
                {/* Tone Selector */}
                <div className={styles.toneField}>
                  <label className={styles.infoLabel}>🎨 AI가 어떤 어조로 리뷰해주면 좋을까요?</label>
                  <div className={styles.toneOptions}>
                    {TONE_OPTIONS.map((option) => (
                      <label 
                        key={option.value}
                        className={`${styles.toneOption} ${tone === option.value ? styles.selected : ''}`}
                      >
                        <input
                          type="radio"
                          name="tone"
                          value={option.value}
                          checked={tone === option.value}
                          onChange={(e) => setTone(e.target.value)}
                          disabled={loading}
                        />
                        <div className={styles.toneContent}>
                          <div className={styles.toneHeader}>
                            <span className={styles.toneEmoji}>{option.emoji}</span>
                            <span className={styles.toneName}>{option.name}</span>
                            {option.isRecommended && <span className={styles.recommendedBadge}>추천</span>}
                          </div>
                          <div className={styles.toneExample}>
                            {option.example}
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Event period - always show submit button */}
          <button
            type="submit"
            className={styles.submitButton}
            disabled={loading || !url}
          >
            {loading ? (
              <>🔄 처리 중...</>
            ) : !isAuthenticated ? (
              <>🎉 무료로 AI 리뷰 받기</>
            ) : (
              <>🚀 AI 리뷰 받기</>
            )}
          </button>

          <div className={styles.usageCounter}>
            <>
              <span className={styles.trialHighlight}>🎉 9월 31일까지 무제한 무료!</span>
              <br />
              <span className={styles.loginPrompt}>이벤트 기간 동안 횟수 제한 없이 이용하세요!</span>
            </>
          </div>
          {error && (
            <div className={styles.globalError}>
              ❌ {error}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

export default DocuMentorForm;