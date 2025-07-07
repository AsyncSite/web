import React, { useEffect } from 'react';
import './Routine.css';
import RoutineCalendar from './RoutineCalendar';

const Routine: React.FC = () => {
  useEffect(() => {
    const sections = document.querySelectorAll('.white-box.reveal, .box-connector.reveal');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          } else {
            entry.target.classList.remove('visible');
          }
        });
      },
      { threshold: 0.3 },
    );
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  return (
    <div id="routine" className="routine-page">
      <header className="header-section">
        {/* ★ 변경됨: Apple 스타일의 타이포그래피 개선 */}
        <div className="header-content">
          <h1 className="header-title">세상은 누군가의 커밋으로 만들어지고 있으니까</h1>
          <p className="header-sub">못하는 건 같이 하면 돼</p>
          <p className="header-sub">
            문제는 목표도 의지도 아니야, <strong>시스템</strong>이야
          </p>
          <p className="header-sub">
            각 자리의 별들이 만나면 별자리가 된다.
            <strong className="highlight-asyncsite"> asyncsite - ★</strong>
          </p>
        </div>
      </header>

      {/* 헤더와 첫 섹션 사이 연결선 */}
      <div className="box-connector reveal"></div>

      {/* 첫 번째 섹션 (텍스트 왼쪽 + 이미지 오른쪽) */}
      <section className="white-box reveal">
        <div className="white-box-inner">
          <div className="section-text-col">
            <div className="text-large">11 루틴 : 주 1회 모각코</div>
            <div className="text-small">
              부담 없이 각자 작업에 집중하며
              <br />
              함께 질문하고 답을 나눕니다.
              <br />
              매주 모여 서로의 진척을 공유하고 동기를 얻습니다.
            </div>
          </div>
          <div className="section-image-col">
            <img
              src={process.env.PUBLIC_URL + '/images/developers.png'}
              alt="주 1회 온라인 코어타임 이미지"
            />
          </div>
        </div>
      </section>

      <div className="box-connector reveal"></div>

      {/* 두 번째 섹션 (이미지 오른쪽 → reverse) */}
      <section className="white-box reveal">
        <div className="white-box-inner reverse">
          <div className="section-image-col">
            <img
              src={process.env.PUBLIC_URL + '/images/005%20(1).png'}
              alt="테코테코 코테 모임 이미지"
            />
          </div>
          <div className="section-text-col">
            <div className="text-large">테코테코 - 코테를 뿌수다</div>
            <div className="text-small">
              알고리즘을 함께 풀고 리뷰하는 매주 일요일 오전의 코테 모임. 실전 문제풀이와 코드 리뷰
              과정을 통해 한 단계 더 성장할 수 있도록 도와줍니다.
            </div>
          </div>
        </div>
      </section>

      {/* 테코테코 섹션 이후, 노앤써 섹션 이전에 아래 코드를 복사하여 붙여넣으세요 */}
      <div className="box-connector reveal"></div>

      {/* DEVLOG-14 섹션 */}
      <section className="white-box reveal">
        <div className="white-box-inner">
          <div className="section-text-col">
            <div className="text-large">DEVLOG-14</div>
            <div className="text-small">
              격주에 한 번, 개발자 블로그 포스팅 챌린지 “Devlog-14”
              <br />
              개발자들이 모여 주제별로 포스팅을 진행하며
              <br />
              경험을 공유하고 성장하는 시간을 가집니다.
              <br />
              블로그 글을 통해 지식을 정리하고
              <br />
              네트워크를 넓혀보세요.
            </div>
          </div>
          <div className="section-image-col">
            <img src={process.env.PUBLIC_URL + '/images/devlog-14.png'} alt="DEVLOG-14 이미지" />
          </div>
        </div>
      </section>

      <div className="box-connector reveal"></div>

      <div className="box-connector reveal"></div>

      {/* 세 번째 섹션 (텍스트 왼쪽) */}
      <section className="white-box reveal">
        <div className="white-box-inner">
          <div className="section-text-col">
            <div className="text-large">노앤써 - 시스템 디자인 스터디</div>
            <div className="text-small">
              답이 없는 무한한 소프트웨어 개발의 세계. 매주 일요일 오후에 모여 확장성과 안정성을
              함께 고민하고, 더 나은 시스템 아키텍처를 설계하기 위한 다양한 시도들을 나눕니다.
            </div>
          </div>
          <div className="section-image-col">
            <img
              src={process.env.PUBLIC_URL + '/images/no-answer2.png'}
              alt="노앤써 시스템 디자인 스터디 이미지"
            />
          </div>
        </div>
      </section>

      <div className="box-connector reveal"></div>

      {/* 네 번째 섹션 (reverse) */}
      <section className="white-box reveal">
        <div className="white-box-inner reverse">
          <div className="section-image-col">
            <img
              src={process.env.PUBLIC_URL + '/images/any-question.png'}
              alt="무엇이든 물어보살 채널 이미지"
            />
          </div>
          <div className="section-text-col">
            <div className="text-large">무엇이든 물어보살 & 이슈 있슈</div>
            <div className="text-small">
              개발하면서 혹은 일상 속에서 마주치는 크고 작은 문제들, 해결에 대한 힌트를 서로
              주고받는 채널입니다. 이미 150건이 넘는 Q&A가 활발히 오가며 함께 성장하고 있습니다.
            </div>
          </div>
        </div>
      </section>

      <div className="box-connector reveal"></div>

      {/* 다섯 번째 섹션 (텍스트 왼쪽) */}
      <section className="white-box reveal">
        <div className="white-box-inner">
          <div className="section-text-col">
            <div className="text-large">터닝페이지 : 정기적 회고 모임</div>
            <div className="text-small">
              커리어와 삶에 대한 고민을 나누고, 서로의 인사이트를 배웁니다. 정기적인 회고를 통해
              우리의 현재 방향을 점검하고 미래를 위한 로드맵을 함께 그려가는 시간입니다.
            </div>
          </div>
          <div className="section-image-col">
            <img
              src={process.env.PUBLIC_URL + '/images/turning-page.png'}
              alt="터닝페이지 정기적 회고 모임 이미지"
            />
          </div>
        </div>
      </section>

      <div className="box-connector reveal"></div>
      <RoutineCalendar />
    </div>
  );
};

export default Routine;
