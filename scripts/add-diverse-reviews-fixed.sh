#!/bin/bash

# 다양한 태그를 가진 리뷰 추가 스크립트 (수정 버전)

# 색상 코드
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${YELLOW}========================================${NC}"
echo -e "${YELLOW}다양한 태그 리뷰 추가 (수정 버전)${NC}"
echo -e "${YELLOW}========================================${NC}"

# Study ID
STUDY_ID="6f8dabd6-8e3f-4f6b-b017-f4a5acacb47e"
STUDY_TITLE="백엔드 심화 스터디"

# 1. 관리자 로그인
echo -e "\n${GREEN}1. 관리자 로그인 중...${NC}"
ADMIN_TOKEN=$(curl -s -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"asyncsite@gmail.com","password":"qlehdrl@20250626"}' \
  | jq -r '.data.accessToken')

if [ -z "$ADMIN_TOKEN" ] || [ "$ADMIN_TOKEN" = "null" ]; then
  echo -e "${RED}❌ 관리자 로그인 실패${NC}"
  exit 1
fi
echo -e "${GREEN}✅ 관리자 토큰 획득${NC}"

# 2. DB에 직접 멤버 추가 (user_id에 email 사용)
echo -e "\n${GREEN}2. DB에 직접 멤버 추가 중...${NC}"

# MySQL 명령어로 멤버 추가
docker exec asyncsite-mysql mysql -uroot -pasyncsite_root_2024! studydb -e "
-- 각 사용자를 멤버로 추가
INSERT IGNORE INTO member (
    id, study_id, user_id, study_title, role, status, 
    joined_at, created_at, updated_at
) VALUES
(UUID_TO_BIN(UUID()), UNHEX(REPLACE('6f8dabd6-8e3f-4f6b-b017-f4a5acacb47e', '-', '')), 
 'dev-kim@asyncsite.com', '$STUDY_TITLE', 'MEMBER', 'ACTIVE', NOW(), NOW(), NOW()),
(UUID_TO_BIN(UUID()), UNHEX(REPLACE('6f8dabd6-8e3f-4f6b-b017-f4a5acacb47e', '-', '')), 
 'dev-lee@asyncsite.com', '$STUDY_TITLE', 'MEMBER', 'ACTIVE', NOW(), NOW(), NOW()),
(UUID_TO_BIN(UUID()), UNHEX(REPLACE('6f8dabd6-8e3f-4f6b-b017-f4a5acacb47e', '-', '')), 
 'dev-park@asyncsite.com', '$STUDY_TITLE', 'MEMBER', 'ACTIVE', NOW(), NOW(), NOW()),
(UUID_TO_BIN(UUID()), UNHEX(REPLACE('6f8dabd6-8e3f-4f6b-b017-f4a5acacb47e', '-', '')), 
 'dev-choi@asyncsite.com', '$STUDY_TITLE', 'MEMBER', 'ACTIVE', NOW(), NOW(), NOW()),
(UUID_TO_BIN(UUID()), UNHEX(REPLACE('6f8dabd6-8e3f-4f6b-b017-f4a5acacb47e', '-', '')), 
 'dev-jung@asyncsite.com', '$STUDY_TITLE', 'MEMBER', 'ACTIVE', NOW(), NOW(), NOW());"

echo -e "${GREEN}✅ DB에 멤버 추가 완료${NC}"

# 확인
echo -e "\n${BLUE}추가된 멤버 확인:${NC}"
docker exec asyncsite-mysql mysql -uroot -pasyncsite_root_2024! studydb -e "
SELECT user_id FROM member 
WHERE study_id = UNHEX(REPLACE('6f8dabd6-8e3f-4f6b-b017-f4a5acacb47e', '-', ''))
AND user_id LIKE 'dev-%';"

# 3. 각 사용자로 로그인하여 리뷰 작성
echo -e "\n${GREEN}3. 다양한 태그로 리뷰 작성 중...${NC}"

# 리뷰 1: 김개발
echo -e "\n${BLUE}리뷰 작성: 김개발 - 실력이 확실히 늘었어요${NC}"
USER1_TOKEN=$(curl -s -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"dev-kim@asyncsite.com","password":"TestPass123@"}' \
  | jq -r '.data.accessToken')

if [ ! -z "$USER1_TOKEN" ] && [ "$USER1_TOKEN" != "null" ]; then
  curl -s -X POST "http://localhost:8080/api/reviews/studies/$STUDY_ID" \
    -H "Authorization: Bearer $USER1_TOKEN" \
    -H "Content-Type: application/json; charset=UTF-8" \
    -d @- <<'JSON' | jq '.success'
{
  "type": "STUDY_EXPERIENCE",
  "title": "실력이 확실히 늘었어요",
  "content": "매주 꾸준히 참여하면서 알고리즘 실력이 정말 많이 늘었습니다. 특히 DP 문제를 푸는 실력이 향상되었어요.",
  "rating": 5,
  "tags": ["💪 실력향상", "📈 성장곡선", "🎯 목표달성", "🔥 열정"]
}
JSON
else
  echo -e "${YELLOW}⚠️  김개발 로그인 실패${NC}"
fi

sleep 1

# 리뷰 2: 이코더
echo -e "\n${BLUE}리뷰 작성: 이코더 - 최고의 스터디 동료들${NC}"
USER2_TOKEN=$(curl -s -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"dev-lee@asyncsite.com","password":"TestPass123@"}' \
  | jq -r '.data.accessToken')

if [ ! -z "$USER2_TOKEN" ] && [ "$USER2_TOKEN" != "null" ]; then
  curl -s -X POST "http://localhost:8080/api/reviews/studies/$STUDY_ID" \
    -H "Authorization: Bearer $USER2_TOKEN" \
    -H "Content-Type: application/json; charset=UTF-8" \
    -d @- <<'JSON' | jq '.success'
{
  "type": "STUDY_EXPERIENCE",
  "title": "최고의 스터디 동료들",
  "content": "서로 모르는 것을 물어보고 가르쳐주는 분위기가 정말 좋아요. 함께 성장하는 느낌입니다.",
  "rating": 5,
  "tags": ["🤝 협업", "❤️ 동료애", "🌱 함께성장", "😊 따뜻함"]
}
JSON
else
  echo -e "${YELLOW}⚠️  이코더 로그인 실패${NC}"
fi

sleep 1

# 리뷰 3: 박프로
echo -e "\n${BLUE}리뷰 작성: 박프로 - 체계적인 커리큘럼${NC}"
USER3_TOKEN=$(curl -s -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"dev-park@asyncsite.com","password":"TestPass123@"}' \
  | jq -r '.data.accessToken')

if [ ! -z "$USER3_TOKEN" ] && [ "$USER3_TOKEN" != "null" ]; then
  curl -s -X POST "http://localhost:8080/api/reviews/studies/$STUDY_ID" \
    -H "Authorization: Bearer $USER3_TOKEN" \
    -H "Content-Type: application/json; charset=UTF-8" \
    -d @- <<'JSON' | jq '.success'
{
  "type": "STUDY_EXPERIENCE",
  "title": "체계적인 커리큘럼",
  "content": "난이도별로 잘 짜여진 커리큘럼 덕분에 단계적으로 실력을 향상시킬 수 있었습니다.",
  "rating": 4,
  "tags": ["📚 체계적", "📖 커리큘럼", "⚡ 효율적", "🎓 학습"]
}
JSON
else
  echo -e "${YELLOW}⚠️  박프로 로그인 실패${NC}"
fi

sleep 1

# 리뷰 4: 최알고
echo -e "\n${BLUE}리뷰 작성: 최알고 - 코드 리뷰가 큰 도움이 되었어요${NC}"
USER4_TOKEN=$(curl -s -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"dev-choi@asyncsite.com","password":"TestPass123@"}' \
  | jq -r '.data.accessToken')

if [ ! -z "$USER4_TOKEN" ] && [ "$USER4_TOKEN" != "null" ]; then
  curl -s -X POST "http://localhost:8080/api/reviews/studies/$STUDY_ID" \
    -H "Authorization: Bearer $USER4_TOKEN" \
    -H "Content-Type: application/json; charset=UTF-8" \
    -d @- <<'JSON' | jq '.success'
{
  "type": "STUDY_EXPERIENCE",
  "title": "코드 리뷰가 큰 도움이 되었어요",
  "content": "다른 사람의 코드를 보고 배우는 것도 많고, 제 코드에 대한 피드백도 정말 유익했습니다.",
  "rating": 5,
  "tags": ["💻 코드리뷰", "🔍 피드백", "✨ 인사이트", "🧠 사고력"]
}
JSON
else
  echo -e "${YELLOW}⚠️  최알고 로그인 실패${NC}"
fi

sleep 1

# 리뷰 5: 정데이터
echo -e "\n${BLUE}리뷰 작성: 정데이터 - 시간 투자 대비 최고의 선택${NC}"
USER5_TOKEN=$(curl -s -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"dev-jung@asyncsite.com","password":"TestPass123@"}' \
  | jq -r '.data.accessToken')

if [ ! -z "$USER5_TOKEN" ] && [ "$USER5_TOKEN" != "null" ]; then
  curl -s -X POST "http://localhost:8080/api/reviews/studies/$STUDY_ID" \
    -H "Authorization: Bearer $USER5_TOKEN" \
    -H "Content-Type: application/json; charset=UTF-8" \
    -d @- <<'JSON' | jq '.success'
{
  "type": "STUDY_EXPERIENCE",
  "title": "시간 투자 대비 최고의 선택",
  "content": "퇴근 후 피곤하지만 참여할 때마다 보람을 느낍니다. 확실히 투자한 시간이 아깝지 않아요.",
  "rating": 5,
  "tags": ["⏰ 시간가치", "💎 가치있음", "🚀 효과적", "😃 만족"]
}
JSON
else
  echo -e "${YELLOW}⚠️  정데이터 로그인 실패${NC}"
fi

# 4. 최종 결과 확인
echo -e "\n${GREEN}4. 최종 리뷰 목록 확인...${NC}"

REVIEWS_RESPONSE=$(curl -s -X GET "http://localhost:8080/api/reviews/studies/$STUDY_ID")
REVIEW_COUNT=$(echo "$REVIEWS_RESPONSE" | jq '.data.content | length')

echo -e "${GREEN}✅ 현재 총 ${REVIEW_COUNT}개의 리뷰가 등록되어 있습니다.${NC}"

# 리뷰 목록 출력
echo -e "\n${BLUE}등록된 리뷰:${NC}"
echo "$REVIEWS_RESPONSE" | jq -r '.data.content[] | "\(.authorName): \(.title) - 평점: \(.rating)"'

# 태그 통계 출력
echo -e "\n${BLUE}태그 분포:${NC}"
echo "$REVIEWS_RESPONSE" | jq -r '.data.content[].tags[]' | sort | uniq -c | sort -rn | head -20

echo -e "\n${YELLOW}========================================${NC}"
echo -e "${GREEN}✅ 다양한 태그 리뷰 추가 완료!${NC}"
echo -e "${YELLOW}========================================${NC}"

echo -e "\n${BLUE}💡 확인 방법:${NC}"
echo -e "1. http://localhost:3000/study/backend-deep-dive 에서 리뷰 확인"
echo -e "2. 다양한 태그들이 키워드로 자동 추출되어 상단에 표시됨"
echo -e "3. 각 리뷰 카드에 태그 이모지가 표시됨"
