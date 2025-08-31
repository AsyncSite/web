import React, { useState } from 'react';
import { DocuMentorStats } from './types';
import styles from './DocuMentor.module.css';

interface Props {
  onSubmit: (url: string, tone?: string, purpose?: string, audience?: string) => void;
  stats: DocuMentorStats;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
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

function DocuMentorForm({ onSubmit, stats, isAuthenticated, loading, error }: Props): React.ReactNode {
  const [url, setUrl] = useState('');
  const [tone, setTone] = useState<string>('mentor');
  const [purpose, setPurpose] = useState<string>('');
  const [audience, setAudience] = useState<string>('');
  const [urlError, setUrlError] = useState<string | null>(null);
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
    if (url && validateUrl(url)) {
      onSubmit(url, tone, purpose || undefined, audience || undefined);
    }
  };

  return (
    <div className={styles.formContainer}>
      <div className={styles.formCard}>
        <h2 className={styles.formTitle}>🔗 리뷰 받고 싶은 글 링크를 알려주세요</h2>
        <form onSubmit={handleSubmit}>
          {/* URL Input */}
          <div className={styles.inputGroup}>
            <input
              type="url"
              className={`${styles.urlInput} ${urlError ? styles.error : ''}`}
              placeholder="https://blog.naver.com/mypost..."
              value={url}
              onChange={handleUrlChange}
              onBlur={handleUrlBlur}
              disabled={loading}
              autoComplete="url"
              autoFocus
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

          <button
            type="submit"
            className={styles.submitButton}
            disabled={loading || !url || stats.remainingToday === 0}
          >
            {loading ? (
              <>🔄 처리 중...</>
            ) : !isAuthenticated ? (
              <>🔐 로그인 후 이용 가능</>
            ) : stats.remainingToday === 0 ? (
              <>😅 오늘 횟수 모두 사용</>
            ) : (
              <>🚀 AI 리뷰 받기</>
            )}
          </button>

          <div className={styles.usageCounter}>
            {isAuthenticated ? (
              <>
                오늘 <span className={styles.countNumber}>{stats.usedToday}/{stats.dailyLimit}</span> 회 사용 
                {stats.remainingToday > 0 && (
                  <> | <span className={styles.remaining}>{stats.remainingToday}회 남음</span></>
                )}
              </>
            ) : (
              <>로그인하면 매일 5회 무료로 이용할 수 있어요!</>
            )}
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