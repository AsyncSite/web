import React, { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  isChunkError: boolean;
  retryCount: number;
}

class ChunkErrorBoundary extends Component<Props, State> {
  private readonly MAX_RETRY_COUNT = 3;
  private readonly RETRY_COUNT_KEY = 'chunkErrorRetryCount';

  constructor(props: Props) {
    super(props);
    
    // 세션 스토리지에서 재시도 횟수 가져오기
    const savedRetryCount = sessionStorage.getItem(this.RETRY_COUNT_KEY);
    const retryCount = savedRetryCount ? parseInt(savedRetryCount, 10) : 0;
    
    this.state = {
      hasError: false,
      isChunkError: false,
      retryCount
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // ChunkLoadError 또는 Loading chunk 에러 감지
    const isChunkError = error.name === 'ChunkLoadError' ||
                         error.message.includes('Loading chunk') ||
                         error.message.includes('Failed to fetch dynamically imported module');
    
    return {
      hasError: true,
      isChunkError
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error('ChunkErrorBoundary caught an error:', error, errorInfo);
    
    // ChunkLoadError인 경우 자동 복구 시도
    if (this.state.isChunkError && this.state.retryCount < this.MAX_RETRY_COUNT) {
      this.handleRetry();
    }
  }

  private handleRetry = (): void => {
    const newRetryCount = this.state.retryCount + 1;
    sessionStorage.setItem(this.RETRY_COUNT_KEY, newRetryCount.toString());
    
    // 캐시를 무시하고 강제 새로고침
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  private handleManualReload = (): void => {
    // 재시도 카운터 초기화
    sessionStorage.removeItem(this.RETRY_COUNT_KEY);
    window.location.reload();
  };

  private resetError = (): void => {
    sessionStorage.removeItem(this.RETRY_COUNT_KEY);
    this.setState({
      hasError: false,
      isChunkError: false,
      retryCount: 0
    });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // ChunkLoadError이고 재시도 횟수가 남아있는 경우
      if (this.state.isChunkError && this.state.retryCount < this.MAX_RETRY_COUNT) {
        return (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            backgroundColor: '#05060A',
            color: '#C3E88D',
            padding: '20px',
            textAlign: 'center'
          }}>
            <h2 style={{ marginBottom: '20px' }}>새로운 버전을 불러오는 중...</h2>
            <p style={{ marginBottom: '30px' }}>
              애플리케이션이 업데이트되었습니다. 잠시 후 자동으로 새로고침됩니다.
            </p>
            <div style={{
              width: '50px',
              height: '50px',
              border: '3px solid #C3E88D33',
              borderTop: '3px solid #C3E88D',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }} />
            <style>{`
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            `}</style>
          </div>
        );
      }

      // 재시도 횟수를 초과했거나 일반 에러인 경우
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          backgroundColor: '#05060A',
          color: '#C3E88D',
          padding: '20px',
          textAlign: 'center'
        }}>
          <h1 style={{ marginBottom: '20px', fontSize: '2rem' }}>
            앗! 문제가 발생했습니다
          </h1>
          <p style={{ marginBottom: '30px', maxWidth: '600px' }}>
            {this.state.isChunkError
              ? '애플리케이션을 불러오는 중 문제가 발생했습니다. 브라우저 캐시를 지우고 다시 시도해주세요.'
              : '예기치 않은 오류가 발생했습니다. 페이지를 새로고침하거나 잠시 후 다시 시도해주세요.'}
          </p>
          
          <div style={{ display: 'flex', gap: '20px' }}>
            <button
              onClick={this.handleManualReload}
              style={{
                padding: '12px 24px',
                fontSize: '1rem',
                backgroundColor: '#C3E88D',
                color: '#05060A',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 'bold',
                transition: 'transform 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              페이지 새로고침
            </button>
            
            {!this.state.isChunkError && (
              <button
                onClick={this.resetError}
                style={{
                  padding: '12px 24px',
                  fontSize: '1rem',
                  backgroundColor: 'transparent',
                  color: '#C3E88D',
                  border: '2px solid #C3E88D',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  transition: 'background-color 0.2s'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = '#C3E88D22';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                다시 시도
              </button>
            )}
          </div>
          
          {this.state.isChunkError && (
            <div style={{
              marginTop: '40px',
              padding: '20px',
              backgroundColor: '#1a1b1e',
              borderRadius: '8px',
              maxWidth: '600px'
            }}>
              <h3 style={{ marginBottom: '15px' }}>캐시 지우는 방법:</h3>
              <ul style={{ textAlign: 'left', lineHeight: '1.8' }}>
                <li><strong>Chrome/Edge:</strong> Ctrl+Shift+Delete (Mac: Cmd+Shift+Delete)</li>
                <li><strong>Firefox:</strong> Ctrl+Shift+Delete (Mac: Cmd+Shift+Delete)</li>
                <li><strong>Safari:</strong> 개발자 메뉴 → 캐시 비우기</li>
              </ul>
            </div>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ChunkErrorBoundary;