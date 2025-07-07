import './Tetris.css';

const Tetris = () => {
  return (
    <div className="tetris-container">
      <div className="tetris-header">
        <h1>AI 테트리스</h1>
        <p className="tetris-description">
          AI로 시작한 테트리스 게임 만들기 프로젝트입니다. 현재 버전에서는 기본적인 테트리스
          게임플레이를 구현했습니다.
        </p>
      </div>

      <div className="tetris-content">
        <iframe
          src={process.env.PUBLIC_URL + '/lab/html/tetris.html'}
          title="AI Tetris Game"
          className="tetris-frame"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>

      <div className="tetris-info">
        <h2>프로젝트 정보</h2>
        <div className="info-grid">
          <div className="info-item">
            <h3>개발 기간</h3>
            <p>2024.06.11 ~ 현재</p>
          </div>
          <div className="info-item">
            <h3>사용 기술</h3>
            <p>HTML, CSS, JavaScript</p>
          </div>
          <div className="info-item">
            <h3>주요 기능</h3>
            <ul>
              <li>기본 테트리스 게임플레이</li>
              <li>점수 시스템</li>
              <li>레벨 시스템</li>
            </ul>
          </div>
          <div className="info-item">
            <h3>향후 계획</h3>
            <ul>
              <li>AI 학습 모델 통합</li>
              <li>멀티플레이어 지원</li>
              <li>커스텀 테마</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Tetris;
