# TecoTeco 섹션 추가 가이드

## 개요
TecoTeco 하드코딩 페이지를 동적 스터디 상세 페이지로 마이그레이션하기 위한 섹션 추가 스크립트들입니다.

## 섹션 순서 (하드코딩 페이지 기준)

1. **HeroSection** ✅ - 완료
2. **IntroSection** → RICH_TEXT 섹션으로 구현
3. **MembersSection** → MEMBERS 섹션으로 구현  
4. **HowWeRollSection** → RICH_TEXT 또는 SCHEDULE 섹션으로 구현
5. **JourneySection** → TIMELINE 섹션으로 구현
6. **ExperienceSection** → RICH_TEXT 섹션으로 구현
7. **ReviewsSection** → REVIEWS 섹션으로 구현
8. **FaqJoinSection** → FAQ 섹션으로 구현

## IntroSection 추가 방법

### 방법 1: Bash 스크립트 사용 (추천)
```bash
# 스크립트 실행
./add-tecoteco-intro.sh

# 스터디 ID 입력 프롬프트가 나타나면 입력
```

### 방법 2: Node.js 스크립트 사용
```bash
# 환경 변수로 실행
STUDY_ID="your-study-id" AUTH_TOKEN="your-token" node add-intro-section.js
```

### 방법 3: curl 직접 사용
```bash
# 1. 토큰 획득
TOKEN=$(curl -s -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"asyncsite@gmail.com","password":"qlehdrl@20250626"}' \
  | jq -r '.data.accessToken')

# 2. 섹션 추가
curl -X POST http://localhost:8080/api/study-pages/[STUDY_ID]/sections \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "RICH_TEXT",
    "props": {
      "title": "TecoTeco 소개",
      "content": "...(HTML 내용)...",
      "alignment": "left",
      "backgroundColor": "transparent"
    }
  }'
```

## UI에서 직접 추가하기

1. 스터디 관리 페이지로 이동: `http://localhost:3000/study/[STUDY_ID]/manage`
2. "상세 페이지 편집" 탭 선택
3. "섹션 추가" 클릭
4. "RICH_TEXT" 선택
5. "TecoTeco 예시" 버튼 클릭 (실제 IntroSection 내용이 자동으로 입력됨)
6. "저장" 클릭

## 섹션 내용 특징

### IntroSection (RICH_TEXT)
- **제목**: "TecoTeco 소개"
- **주요 내용**:
  - 변화하는 세상에서 흔들리지 않을 '나'를 위한 스터디
  - 물고기를 잡는 방법을 익히는 것
  - 물고기를 '잘' 잡는 방법을 모색하는 것
- **스타일**:
  - 하이라이트 색상: `rgb(195, 232, 141)` (초록)
  - 서브 하이라이트: `rgb(130, 170, 255)` (파랑)
  - 중앙 정렬된 마무리 문구

## 다음 작업 예정

### HowWeRollSection
- SCHEDULE 또는 RICH_TEXT 섹션으로 구현
- 매주 금요일 저녁 일정
- 이론/코드 리뷰, 휴식, 실전 문제 풀이

### JourneySection  
- TIMELINE 섹션으로 구현
- 12주 커리큘럼
- 단계별 학습 내용

### ExperienceSection
- RICH_TEXT 섹션으로 구현
- 참가자들의 경험과 성장 스토리

## 주의사항

1. 스터디 ID는 실제 TecoTeco 스터디의 UUID를 사용해야 합니다
2. 인증 토큰은 유효한 관리자 권한이 필요합니다
3. 섹션 추가 후 "발행하기" 버튼을 클릭해야 실제 페이지에 반영됩니다

## 문제 해결

### 인증 실패
- 사용자 계정과 비밀번호 확인
- 관리자 권한 확인

### 섹션이 보이지 않음
- 페이지 발행 여부 확인
- 브라우저 캐시 삭제 후 재시도

### API 오류
- Gateway 서비스 실행 확인: `docker ps | grep gateway`
- Study Service 실행 확인: `docker ps | grep study`