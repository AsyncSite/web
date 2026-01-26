import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './PolicyPage.css';

const supportContent = `
<h1>어싱크사이트 고객지원</h1>
<p><strong>언제든지 도움이 필요하시면 연락해 주세요.</strong></p>

<h2>문의하기</h2>
<p>앱 이용 중 문제가 발생하거나 궁금한 점이 있으시면 아래 이메일로 연락해 주세요.</p>
<ul>
  <li><strong>이메일</strong>: support@asyncsite.com</li>
</ul>
<p>문의 시 아래 정보를 함께 보내주시면 더 빠른 답변이 가능합니다:</p>
<ul>
  <li>사용 중인 기기 및 OS 버전</li>
  <li>앱 버전</li>
  <li>문제 상황에 대한 상세 설명</li>
  <li>스크린샷 (가능한 경우)</li>
</ul>

<h2>자주 묻는 질문 (FAQ)</h2>

<h3>Q. 회원가입은 어떻게 하나요?</h3>
<p>A. 앱 실행 후 카카오 또는 Apple 계정으로 간편하게 로그인할 수 있습니다.</p>

<h3>Q. 스터디에 어떻게 참여하나요?</h3>
<p>A. 홈 화면에서 원하는 스터디를 선택한 후 '참여 신청하기' 버튼을 눌러 신청할 수 있습니다.</p>

<h3>Q. 스터디를 직접 만들 수 있나요?</h3>
<p>A. 웹사이트(asyncsite.com)에서 스터디를 개설할 수 있습니다.</p>

<h3>Q. 계정을 삭제하고 싶어요.</h3>
<p>A. support@asyncsite.com으로 계정 삭제 요청을 보내주시면 처리해 드립니다.</p>

<h2>관련 링크</h2>
<ul>
  <li><a href="/terms">이용약관</a></li>
  <li><a href="/privacy">개인정보처리방침</a></li>
</ul>

<h2>운영 정보</h2>
<p>서비스명: 어싱크사이트 (asyncsite)</p>
<p>© 2025 asyncsite. All rights reserved.</p>
`;

const SupportPage: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    document.documentElement.style.height = 'auto';
    document.body.style.height = 'auto';

    return () => {
      document.documentElement.style.height = '100%';
      document.body.style.height = '100%';
    };
  }, []);

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div className="policy-container">
      <button onClick={handleGoBack} className="back-button">뒤로가기</button>
      <div dangerouslySetInnerHTML={{ __html: supportContent }} />
    </div>
  );
};

export default SupportPage;
