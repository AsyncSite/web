import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DocuMentorStats } from './types';
import styles from './DocuMentor.module.css';

interface Props {
  onSubmit: (url: string, email?: string, tone?: string, purpose?: string, audience?: string) => void;
  stats: DocuMentorStats;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  hasUsedTrial?: boolean;
}

const TONE_OPTIONS = [
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
      onSubmit(url, !isAuthenticated ? email : undefined, tone, purpose || undefined, audience || undefined);
    }
  };

  return (
    <div className={styles.formContainer}>
      <h2 className={styles.formTitle}>
        {!isAuthenticated && !hasUsedTrial ? (
          <>✨ 1회 무료 AI 리뷰 체험!</>
        ) : hasUsedTrial ? (
          <>🎯 회원가입하고 매일 5회 사용하세요!</>
        ) : (
          <>🔗 리뷰 받고 싶은 글 링크를 알려주세요</>
        )}
      </h2>
      <div className={styles.formCard}>
        <form onSubmit={handleSubmit}>
          {/* Email Input for non-authenticated users */}
          {!isAuthenticated && !hasUsedTrial && (
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
              <span className={styles.toggleText}>추가 옵션 설정 (선택사항)</span>
              <span className={styles.toggleHint}>AI 리뷰를 더 정확하게 받고 싶다면</span>
            </button>
            
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

          {/* Trial used - show signup CTA (only for non-authenticated users) */}
          {hasUsedTrial && !isAuthenticated ? (
            <div className={styles.trialUsedContainer}>
              <p className={styles.trialUsedMessage}>
                이미 무료 체험을 사용하셨습니다.<br />
                회원가입하면 매일 5회씩 무료로 사용할 수 있어요!
              </p>
              <div className={styles.ctaButtons}>
                <button
                  type="button"
                  className={styles.signupButton}
                  onClick={() => {
                    navigate('/signup', {
                      state: {
                        from: '/studio/documentor',
                        service: 'documento',
                        branding: {
                          title: '도큐멘토 ✏️',
                          subtitle: 'AI 글쓰기 친구와 함께하세요'
                        }
                      }
                    });
                  }}
                >
                  🚀 회원가입하기
                </button>
                <button
                  type="button"
                  className={styles.loginButton}
                  onClick={() => {
                    console.log('[DocuMentorForm] 로그인 버튼 클릭');
                    const stateToSend = {
                      from: '/studio/documentor',
                      service: 'documento',
                      branding: {
                        title: '도큐멘토 ✏️',
                        subtitle: '계속하려면 로그인이 필요해요'
                      }
                    };
                    console.log('[DocuMentorForm] navigate state:', stateToSend);
                    navigate('/login', {
                      state: stateToSend
                    });
                  }}
                >
                  로그인
                </button>
              </div>
            </div>
          ) : (
            <button
              type="submit"
              className={styles.submitButton}
              disabled={loading || !url || (isAuthenticated && stats.remainingToday === 0)}
            >
              {loading ? (
                <>🔄 처리 중...</>
              ) : !isAuthenticated ? (
                <>✨ 무료 체험하기</>
              ) : stats.remainingToday === 0 ? (
                <>😅 오늘 횟수 모두 사용</>
              ) : (
                <>🚀 AI 리뷰 받기</>
              )}
            </button>
          )}

          {isAuthenticated ? (
            <div className={styles.usageCounter}>
              <>
                오늘 <span className={styles.countNumber}>{stats.usedToday}/{stats.dailyLimit}</span> 회 사용 
                {stats.remainingToday > 0 && (
                  <> | <span className={styles.remaining}>{stats.remainingToday}회 남음</span></>
                )}
                <span className={styles.resetTime}> | 🕐 자정에 리셋</span>
              </>
            </div>
          ) : !hasUsedTrial ? (
            <div className={styles.usageCounter}>
              <>
                <span className={styles.trialHighlight}>✨ 지금 1회 무료 체험 가능!</span>
                <br />
                <span className={styles.loginPrompt}>로그인하면 매일 5회 무료로 이용할 수 있어요!</span>
              </>
            </div>
          ) : null}
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