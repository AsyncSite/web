#!/bin/bash

# 다양한 태그를 가진 리뷰 추가 스크립트

# 색상 코드
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${YELLOW}========================================${NC}"
echo -e "${YELLOW}다양한 태그 리뷰 추가${NC}"
echo -e "${YELLOW}========================================${NC}"

# Study ID
STUDY_ID="6f8dabd6-8e3f-4f6b-b017-f4a5acacb47e"

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

# 2. 새 사용자 계정 생성
echo -e "\n${GREEN}2. 다양한 리뷰어 계정 생성 중...${NC}"

# 계정 생성 함수
create_user() {
  local email=$1
  local password=$2
  local name=$3
  
  echo -e "${BLUE}사용자 생성: $email${NC}"
  
  RESPONSE=$(curl -s -X POST http://localhost:8080/api/users/register \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$email\",\"password\":\"$password\",\"name\":\"$name\"}")
  
  if echo "$RESPONSE" | jq -e '.success == true' > /dev/null 2>&1; then
    echo -e "${GREEN}✅ $name 계정 생성 성공${NC}"
    return 0
  else
    echo -e "${YELLOW}⚠️  $name 계정이 이미 존재하거나 생성 실패${NC}"
    return 1
  fi
}

# 여러 사용자 생성
create_user "dev-kim@asyncsite.com" "TestPass123@" "김개발"
create_user "dev-lee@asyncsite.com" "TestPass123@" "이코더"
create_user "dev-park@asyncsite.com" "TestPass123@" "박프로"
create_user "dev-choi@asyncsite.com" "TestPass123@" "최알고"
create_user "dev-jung@asyncsite.com" "TestPass123@" "정데이터"

sleep 1

# 3. 직접 DB에 멤버 추가
echo -e "\n${GREEN}3. DB에 직접 멤버 추가 중...${NC}"

# MySQL 명령어로 멤버 추가
docker exec asyncsite-mysql mysql -uroot -pasyncsite_root_2024! studydb -e "
INSERT IGNORE INTO member (study_id, user_id, name, email, role, status, joined_at, attendance_count, created_at, updated_at)
SELECT 
    '6f8dabd6-8e3f-4f6b-b017-f4a5acacb47e',
    u.id,
    u.name,
    u.email,
    'MEMBER',
    'ACTIVE',
    NOW(),
    FLOOR(RAND() * 10) + 1,
    NOW(),
    NOW()
FROM user u
WHERE u.email IN (
    'dev-kim@asyncsite.com',
    'dev-lee@asyncsite.com',
    'dev-park@asyncsite.com',
    'dev-choi@asyncsite.com',
    'dev-jung@asyncsite.com'
);"

echo -e "${GREEN}✅ DB에 멤버 추가 완료${NC}"

# 4. 각 사용자로 로그인하여 리뷰 작성
echo -e "\n${GREEN}4. 다양한 태그로 리뷰 작성 중...${NC}"

# 리뷰 작성 함수
write_review() {
  local email=$1
  local password=$2
  local title=$3
  local content=$4
  local rating=$5
  shift 5
  local tags=("$@")
  
  echo -e "\n${BLUE}$email 로그인 및 리뷰 작성${NC}"
  
  # 로그인
  TOKEN=$(curl -s -X POST http://localhost:8080/api/auth/login \
    -H "Content-Type: application/json" \
    -d "{\"username\":\"$email\",\"password\":\"$password\"}" \
    | jq -r '.data.accessToken')
  
  if [ -z "$TOKEN" ] || [ "$TOKEN" = "null" ]; then
    echo -e "${YELLOW}⚠️  $email 로그인 실패${NC}"
    return 1
  fi
  
  # 태그 배열 생성
  TAGS_JSON=$(printf '%s\n' "${tags[@]}" | jq -R . | jq -s .)
  
  # 리뷰 작성
  REVIEW_RESPONSE=$(curl -s -X POST "http://localhost:8080/api/reviews/studies/$STUDY_ID" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json; charset=UTF-8" \
    -d "{
      \"type\": \"STUDY_EXPERIENCE\",
      \"title\": \"$title\",
      \"content\": \"$content\",
      \"rating\": $rating,
      \"tags\": $TAGS_JSON
    }")
  
  if echo "$REVIEW_RESPONSE" | jq -e '.success == true' > /dev/null 2>&1; then
    echo -e "${GREEN}✅ 리뷰 추가 성공${NC}"
  else
    echo -e "${YELLOW}⚠️  리뷰 추가 실패${NC}"
    echo "$REVIEW_RESPONSE" | jq '.'
  fi
}

# 다양한 태그로 리뷰 작성
write_review "dev-kim@asyncsite.com" "TestPass123@" \
  "실력이 확실히 늘었어요" \
  "매주 꾸준히 참여하면서 알고리즘 실력이 정말 많이 늘었습니다. 특히 DP 문제를 푸는 실력이 향상되었어요." \
  5 \
  "💪 실력향상" "📈 성장곡선" "🎯 목표달성" "🔥 열정"

sleep 1

write_review "dev-lee@asyncsite.com" "TestPass123@" \
  "최고의 스터디 동료들" \
  "서로 모르는 것을 물어보고 가르쳐주는 분위기가 정말 좋아요. 함께 성장하는 느낌입니다." \
  5 \
  "🤝 협업" "❤️ 동료애" "🌱 함께성장" "😊 따뜻함"

sleep 1

write_review "dev-park@asyncsite.com" "TestPass123@" \
  "체계적인 커리큘럼" \
  "난이도별로 잘 짜여진 커리큘럼 덕분에 단계적으로 실력을 향상시킬 수 있었습니다." \
  4 \
  "📚 체계적" "📖 커리큘럼" "⚡ 효율적" "🎓 학습"

sleep 1

write_review "dev-choi@asyncsite.com" "TestPass123@" \
  "코드 리뷰가 큰 도움이 되었어요" \
  "다른 사람의 코드를 보고 배우는 것도 많고, 제 코드에 대한 피드백도 정말 유익했습니다." \
  5 \
  "💻 코드리뷰" "🔍 피드백" "✨ 인사이트" "🧠 사고력"

sleep 1

write_review "dev-jung@asyncsite.com" "TestPass123@" \
  "시간 투자 대비 최고의 선택" \
  "퇴근 후 피곤하지만 참여할 때마다 보람을 느낍니다. 확실히 투자한 시간이 아깝지 않아요." \
  5 \
  "⏰ 시간가치" "💎 가치있음" "🚀 효과적" "😃 만족"

# 5. 최종 결과 확인
echo -e "\n${GREEN}5. 최종 리뷰 목록 확인...${NC}"

REVIEWS_RESPONSE=$(curl -s -X GET "http://localhost:8080/api/reviews/studies/$STUDY_ID")
REVIEW_COUNT=$(echo "$REVIEWS_RESPONSE" | jq '.data.content | length')

echo -e "${GREEN}✅ 현재 총 ${REVIEW_COUNT}개의 리뷰가 등록되어 있습니다.${NC}"

# 태그 통계 출력
echo -e "\n${BLUE}태그 분포:${NC}"
echo "$REVIEWS_RESPONSE" | jq -r '.data.content[].tags[]' | sort | uniq -c | sort -rn

echo -e "\n${YELLOW}========================================${NC}"
echo -e "${GREEN}✅ 다양한 태그 리뷰 추가 완료!${NC}"
echo -e "${YELLOW}========================================${NC}"

echo -e "\n${BLUE}💡 확인 방법:${NC}"
echo -e "1. http://localhost:3000/study/backend-deep-dive 에서 리뷰 확인"
echo -e "2. 다양한 태그들이 키워드로 추출되어 표시됨"
