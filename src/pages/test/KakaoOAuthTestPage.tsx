import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { env } from '../../config/environment';
import './KakaoOAuthTestPage.css';

/**
 * Kakao OAuth Test Page
 *
 * 카카오 OAuth 로그인을 테스트하기 위한 독립적인 페이지
 * 기존 로그인 시스템에 영향을 주지 않고 카카오 로그인 플로우를 검증
 *
 * 테스트 흐름:
 * 1. 카카오 로그인 버튼 클릭
 * 2. 백엔드의 /api/auth/oauth/kakao/login 으로 리다이렉트
 * 3. 카카오 인증 후 /api/auth/oauth/kakao/callback 으로 돌아옴
 * 4. 백엔드에서 프론트엔드로 토큰과 함께 리다이렉트
 * 5. 토큰 파싱 및 표시
 */
function KakaoOAuthTestPage(): React.ReactNode {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [authData, setAuthData] = useState<{
    token?: string;
    refreshToken?: string;
    error?: string;
  }>({});

  const [testResult, setTestResult] = useState<{
    status: 'idle' | 'testing' | 'success' | 'error';
    message: string;
    userInfo?: any;
  }>({
    status: 'idle',
    message: ''
  });

  // URL 파라미터에서 토큰 또는 에러 추출
  useEffect(() => {
    const token = searchParams.get('token');
    const refreshToken = searchParams.get('refreshToken');
    const error = searchParams.get('error');

    if (token || error) {
      setAuthData({
        token: token || undefined,
        refreshToken: refreshToken || undefined,
        error: error || undefined
      });

      if (token) {
        setTestResult({
          status: 'success',
          message: '카카오 로그인 성공! 토큰을 받았습니다.'
        });

        // 토큰 디코딩 시도 (JWT)
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          setTestResult(prev => ({
            ...prev,
            userInfo: payload
          }));
        } catch (e) {
          console.error('토큰 디코딩 실패:', e);
        }
      } else if (error) {
        setTestResult({
          status: 'error',
          message: `카카오 로그인 실패: ${decodeURIComponent(error)}`
        });
      }

      // URL에서 파라미터 제거
      window.history.replaceState({}, document.title, '/test/kakao-oauth');
    }
  }, [searchParams]);

  const handleKakaoLogin = () => {
    setTestResult({
      status: 'testing',
      message: '카카오 로그인 페이지로 이동 중...'
    });

    // 백엔드의 카카오 OAuth 엔드포인트로 리다이렉트
    const kakaoLoginUrl = `${env.apiBaseUrl}/api/auth/oauth/kakao/login`;

    // 현재 페이지를 return URL로 저장 (나중에 사용할 수 있음)
    localStorage.setItem('kakao_test_return_url', window.location.href);

    console.log('카카오 로그인 시작:', kakaoLoginUrl);
    window.location.href = kakaoLoginUrl;
  };

  const handleTestUserInfo = async () => {
    if (!authData.token) {
      alert('먼저 로그인해주세요.');
      return;
    }

    try {
      const response = await fetch(`${env.apiBaseUrl}/api/users/me`, {
        headers: {
          'Authorization': `Bearer ${authData.token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setTestResult(prev => ({
          ...prev,
          userInfo: data.data
        }));
        console.log('사용자 정보:', data.data);
      } else {
        console.error('사용자 정보 조회 실패:', response.status);
      }
    } catch (error) {
      console.error('사용자 정보 조회 에러:', error);
    }
  };

  const handleClearTest = () => {
    setAuthData({});
    setTestResult({
      status: 'idle',
      message: ''
    });
    localStorage.removeItem('kakao_test_return_url');
  };

  return (
    <div className="kakao-oauth-test-container">
      <div className="test-header">
        <h1>카카오 OAuth 테스트 페이지</h1>
        <p>이 페이지는 카카오 로그인 통합을 테스트하기 위한 임시 페이지입니다.</p>
        <p className="warning">⚠️ 프로덕션에서는 사용하지 마세요!</p>
      </div>

      <div className="test-controls">
        <h2>1. 카카오 로그인 테스트</h2>

        <div className="button-group">
          <button
            className="kakao-login-button"
            onClick={handleKakaoLogin}
            disabled={testResult.status === 'testing'}
          >
            <svg width="20" height="20" viewBox="0 0 512 512" fill="currentColor">
              <path d="M255.5 48C299.345 48 339.897 56.5332 377.156 73.5996C414.415 90.666 443.871 113.873 465.522 143.22C487.174 172.566 498 204.577 498 239.252C498 273.926 487.174 305.982 465.522 335.42C443.871 364.857 414.46 388.109 377.291 405.175C340.122 422.241 299.525 430.775 255.5 430.775C241.607 430.775 227.262 429.781 212.467 427.795C148.233 472.402 114.042 494.977 109.892 495.518C107.907 496.241 106.012 496.15 104.208 495.248C103.486 494.706 102.945 493.983 102.584 493.08C102.223 492.177 102.043 491.365 102.043 490.642V489.559C103.126 482.515 111.335 453.169 126.672 401.518C91.8486 384.181 64.1974 361.2 43.7185 332.575C23.2395 303.951 13 272.843 13 239.252C13 204.577 23.8259 172.566 45.4777 143.22C67.1295 113.873 96.5849 90.666 133.844 73.5996C171.103 56.5332 211.655 48 255.5 48Z"/>
            </svg>
            카카오 로그인
          </button>

          <button
            className="test-button"
            onClick={handleTestUserInfo}
            disabled={!authData.token}
          >
            사용자 정보 테스트
          </button>

          <button
            className="clear-button"
            onClick={handleClearTest}
          >
            초기화
          </button>
        </div>
      </div>

      <div className="test-status">
        <h2>2. 테스트 상태</h2>

        <div className={`status-indicator status-${testResult.status}`}>
          <span className="status-badge">{testResult.status}</span>
          <span className="status-message">{testResult.message}</span>
        </div>

        {authData.error && (
          <div className="error-box">
            <h3>❌ 에러 정보</h3>
            <pre>{authData.error}</pre>
          </div>
        )}

        {authData.token && (
          <div className="token-box">
            <h3>✅ 인증 토큰</h3>
            <div className="token-info">
              <label>Access Token:</label>
              <pre>{authData.token.substring(0, 50)}...</pre>
            </div>
            {authData.refreshToken && (
              <div className="token-info">
                <label>Refresh Token:</label>
                <pre>{authData.refreshToken.substring(0, 50)}...</pre>
              </div>
            )}
          </div>
        )}

        {testResult.userInfo && (
          <div className="user-info-box">
            <h3>👤 사용자 정보</h3>
            <pre>{JSON.stringify(testResult.userInfo, null, 2)}</pre>
          </div>
        )}
      </div>

      <div className="test-instructions">
        <h2>3. 테스트 방법</h2>
        <ol>
          <li>위의 "카카오 로그인" 버튼을 클릭합니다.</li>
          <li>카카오 로그인 페이지로 이동합니다.</li>
          <li>카카오 계정으로 로그인합니다.</li>
          <li>권한 동의 후 이 페이지로 돌아옵니다.</li>
          <li>토큰이 성공적으로 받아졌는지 확인합니다.</li>
          <li>"사용자 정보 테스트"로 토큰이 유효한지 확인합니다.</li>
        </ol>
      </div>

      <div className="test-config">
        <h2>4. 현재 설정</h2>
        <div className="config-info">
          <div className="config-item">
            <label>API Base URL:</label>
            <code>{env.apiBaseUrl}</code>
          </div>
          <div className="config-item">
            <label>OAuth Endpoint:</label>
            <code>/api/auth/oauth/kakao/login</code>
          </div>
          <div className="config-item">
            <label>Callback URL:</label>
            <code>/api/auth/oauth/kakao/callback</code>
          </div>
          <div className="config-item">
            <label>Frontend Callback:</label>
            <code>/auth/callback</code>
          </div>
        </div>
      </div>

      <div className="test-footer">
        <button
          className="back-button"
          onClick={() => navigate('/')}
        >
          ← 메인으로 돌아가기
        </button>
        <p className="footer-note">
          이 페이지는 개발 환경에서만 사용되어야 합니다.
          테스트가 완료되면 실제 로그인 페이지에 통합하세요.
        </p>
      </div>
    </div>
  );
}

export default KakaoOAuthTestPage;