import React from 'react';

const Extra: React.FC = () => {
  return (
    <section id="extra">
      <h2 className="section-title">EXTRA</h2>
      <p className="subheading">
        오프라인 모임, 다양한 소모임,
        <br />
        그리고 끝없이 확장될 <span style={{ color: '#F78C6C' }}>가능성</span>
      </p>
      <div className="highlight-box">
        <div className="highlight-title">함께 더 멀리</div>
        <div className="highlight-desc">
          - 분기별 오프라인 모임: 네트워킹 & 회고
          <br />- 소모임(테코테코, 노앤써 등)으로 확장
        </div>
      </div>
      <div className="code-block">
        <p>
          <span className="keyword">function</span> <span className="function-name">extra</span>(){' '}
          {'{'}
        </p>
        <p className="comment"> // 추가 컨텐츠: 오프라인 모임, 소모임 등</p>
        <p>
          {'  '}
          console.log(
          <span className="string">"분기별 오프라인 모임으로 네트워킹 & 회고"</span>
          );
        </p>
        <p>
          {'  '}
          console.log(
          <span className="string">"테코테코, 노앤써 등 다양한 소모임으로 확장"</span>
          );
        </p>
        <p>{'}'}</p>
        <p>
          <span className="comment">// 우리의 스토리는 계속 이어집니다...</span>
          <span className="cursor"></span>
        </p>
      </div>
    </section>
  );
};

export default Extra;
