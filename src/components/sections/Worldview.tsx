// src/components/sections/Worldview.tsx
import React from 'react';

const Worldview: React.FC = () => {
    return (
        <section id="worldview">
            <h2 className="section-title">WORLDVIEW</h2>
            <p className="subheading">
                느슨하지만 끈끈하게,
                <br />
                <em style={{ color: '#82AAFF' }}>모두가 주인공</em>인 세계관
            </p>
            <div className="highlight-box">
                <div className="highlight-title">주요 가치</div>
                <div className="highlight-desc">
                    - 성장 (Grow)
                    <br />
                    - 꾸준함 (Consistency)
                    <br />
                    - 점들의 연결 (Networking)
                </div>
            </div>
            <div className="code-block">
                <p>
                    <span className="keyword">function</span>{' '}
                    <span className="function-name">worldview</span>() {'{'}
                </p>
                <p className="comment">  // 우리의 핵심 가치와 방향성</p>
                <p>
                    {'  '}
                    console.log(<span className="string">"성장, 꾸준함, 그리고 점들의 연결"</span>);
                </p>
                <p>
                    {'  '}
                    console.log(
                    <span className="string">
            "느슨하지만 끈끈하게, 무임승차 없이 모두가 주인공!"
          </span>
                    );
                </p>
                <p>{'}'}</p>
                <p>
          <span className="comment">
            // 함께 공유하며, 각자의 속도로 달리는 것이 세계관의 본질
          </span>
                    <span className="cursor"></span>
                </p>
            </div>
        </section>
    );
};

export default Worldview;
