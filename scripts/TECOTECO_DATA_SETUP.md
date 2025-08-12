# 📊 TecoTeco 스터디 데이터 셋업 가이드

## 📌 개요

이 문서는 TecoTeco 스터디 페이지의 하드코딩된 UI를 동적 데이터로 재현하기 위해 작성된 스크립트들의 사용법과 배경을 설명합니다.

## 🎯 목적

### 배경
- TecoTeco 스터디 페이지(`/study/1-tecoteco`)는 원래 하드코딩된 React 컴포넌트로 구현되었습니다
- 이를 동적 콘텐츠 관리 시스템으로 전환하면서, 기존 디자인과 콘텐츠를 100% 재현해야 했습니다
- 각 섹션별로 API를 통해 데이터를 삽입하는 스크립트를 작성하여 반복 가능한 셋업 프로세스를 구축했습니다

### 목표
1. 하드코딩된 TecoTeco 페이지의 모든 섹션을 DB 기반 동적 콘텐츠로 변환
2. 디자인, 색상, 레이아웃, 텍스트 등 모든 요소를 정확히 재현
3. 향후 다른 스터디 페이지 생성 시 참고할 수 있는 템플릿 제공

## 📁 스크립트 구조

```
/Users/rene/asyncsite/web/scripts/
├── add-tecoteco-intro-blocks.sh    # IntroSection (블록 기반 RichText)
├── add-tecoteco-members.sh         # Members 섹션
├── add-tecoteco-howweroll.sh       # HowWeRoll 섹션
├── add-tecoteco-journey.sh         # Journey 섹션
├── add-tecoteco-experience.sh      # Experience 섹션
├── add-tecoteco-faq.sh            # FAQ 섹션
└── update-tecoteco-members.sh      # Members 업데이트
```

## 🚀 사용 방법

### 전제 조건
1. Study Service가 Docker 컨테이너로 실행 중이어야 합니다
2. Gateway 서비스가 실행 중이어야 합니다
3. 유효한 JWT 토큰이 필요합니다 (관리자 권한)

### 실행 순서

```bash
# 1. 토큰 획득 (asyncsite@gmail.com 계정)
TOKEN=$(curl -s -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"asyncsite@gmail.com","password":"qlehdrl@20250626"}' \
  | jq -r '.data.accessToken')

# 2. 환경변수 설정
export TOKEN

# 3. 각 섹션 데이터 삽입 (순서대로 실행)
cd /Users/rene/asyncsite/web/scripts

./add-tecoteco-intro-blocks.sh      # IntroSection 추가
./add-tecoteco-members.sh           # Members 섹션 추가
./add-tecoteco-howweroll.sh         # HowWeRoll 섹션 추가
./add-tecoteco-journey.sh           # Journey 섹션 추가
./add-tecoteco-experience.sh        # Experience 섹션 추가
./add-tecoteco-faq.sh              # FAQ 섹션 추가
```

## 📝 각 스크립트 상세 설명

### 1. add-tecoteco-intro-blocks.sh
**목적**: TecoTeco 소개 섹션을 블록 기반 RichText로 추가

**특징**:
- 블록 기반 구조 (heading, paragraph, callout 등)
- 인라인 스타일링 지원 (색상, 강조)
- TecoTeco 테마 색상 사용 (#c3e88d, #82aaff)

**주요 블록**:
- 제목: "테코테코 스터디 소개"
- 단락: 스터디 철학과 목표
- Callout: 핵심 메시지 강조
- 정보 박스: 참여 대상, 진행 방식 등

### 2. add-tecoteco-members.sh
**목적**: TecoTeco 멤버 정보 추가

**데이터 구조**:
```json
{
  "type": "MEMBERS",
  "props": {
    "members": [...],
    "stats": {
      "weeklyMvp": "멤버명",
      "popularAlgorithms": ["BFS", "DFS", "DP"],
      "solvedProblems": 1234
    },
    "theme": "tecoteco"
  }
}
```

**특징**:
- 각 멤버의 프로필, 역할, 배지 정보
- 주간 MVP, 인기 알고리즘 통계
- TecoTeco 테마 적용

### 3. add-tecoteco-howweroll.sh
**목적**: "우리가 굴러가는 방식" 섹션 추가

**콘텐츠**:
- 매주 진행 방식
- 알고리즘 선정 프로세스
- 코드 리뷰 문화
- 성장 지향적 학습 방법

### 4. add-tecoteco-journey.sh
**목적**: TecoTeco의 여정 타임라인 추가

**구조**:
- 시작부터 현재까지의 주요 이벤트
- 마일스톤 달성 기록
- 멤버 합류 히스토리

### 5. add-tecoteco-experience.sh
**목적**: "테코테코를 경험한다는 것" 섹션 추가

**내용**:
- 참여자 후기
- 성장 스토리
- 커뮤니티 문화

### 6. add-tecoteco-faq.sh
**목적**: 자주 묻는 질문 섹션 추가

**FAQ 항목**:
- 참여 자격
- 진행 방식
- 준비 사항
- 비용 및 일정

## 🎨 디자인 시스템

### 색상 팔레트
```css
/* TecoTeco 브랜드 색상 */
--tecoteco-primary: #c3e88d;     /* 연한 녹색 */
--tecoteco-secondary: #82aaff;   /* 연한 파란색 */
--tecoteco-accent: #ffcb6b;      /* 노란색 */
--tecoteco-bg: #0a0a0a;          /* 배경색 */
--tecoteco-text: #e0e0e0;        /* 텍스트 색상 */
```

### 타이포그래피
- 제목: Pretendard Bold
- 본문: Pretendard Regular
- 강조: 색상 하이라이트 또는 배경색

## ⚠️ 주의사항

1. **순서 중요**: 스크립트는 반드시 위에 명시된 순서대로 실행해야 합니다
2. **토큰 유효성**: JWT 토큰이 만료되면 다시 로그인하여 갱신해야 합니다
3. **중복 실행**: 동일한 스크립트를 여러 번 실행하면 중복 데이터가 생성될 수 있습니다
4. **Gateway 경유**: 모든 API 호출은 반드시 Gateway(8080)를 통해야 합니다

## 🔍 디버깅

### 데이터 확인
```bash
# MySQL 접속하여 데이터 확인
docker exec asyncsite-mysql mysql -uroot -pasyncsite_root_2024! studydb \
  -e "SELECT * FROM study_detail_pages WHERE slug='tecoteco';"

# 섹션 데이터 확인
docker exec asyncsite-mysql mysql -uroot -pasyncsite_root_2024! studydb \
  -e "SELECT type, JSON_EXTRACT(props, '$.title') as title FROM study_detail_page_sections WHERE page_id='페이지ID';"
```

### 로그 확인
```bash
# Study Service 로그
docker logs asyncsite-study-service --tail 100

# Gateway 로그
docker logs asyncsite-gateway --tail 100
```

## 📚 참고 자료

- 원본 하드코딩 페이지: `/Users/rene/asyncsite/web/src/pages/TecoTecoPage.tsx`
- 동적 렌더러: `/Users/rene/asyncsite/web/src/components/studyDetailPage/StudyDetailPageRenderer.tsx`
- 섹션 컴포넌트: `/Users/rene/asyncsite/web/src/components/studyDetailPage/sections/`

## 🔄 업데이트 이력

- 2025-08-10: 초기 스크립트 작성
- 2025-08-11: IntroSection을 블록 기반으로 전환
- 2025-08-12: 문서 작성 및 정리