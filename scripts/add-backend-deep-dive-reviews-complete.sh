#!/bin/bash

# Backend Deep Dive 스터디 완전한 리뷰 추가 스크립트
# 여러 사용자 계정으로 TecoTeco 하드코딩 페이지의 모든 리뷰 추가

# 색상 코드
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${YELLOW}========================================${NC}"
echo -e "${YELLOW}Backend Deep Dive 완전한 리뷰 추가${NC}"
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
echo -e "\n${GREEN}2. 리뷰어 계정 생성 중...${NC}"

# 사용자 2: test-reviewer2 (익명2 역할)
echo -e "${BLUE}사용자 생성: test-reviewer2@asyncsite.com${NC}"
USER2_RESPONSE=$(curl -s -X POST http://localhost:8080/api/users/register \
  -H "Content-Type: application/json" \
  -d @- <<'JSON'
{
  "email": "test-reviewer2@asyncsite.com",
  "password": "TestPass123@",
  "name": "익명2"
}
JSON
)

if echo "$USER2_RESPONSE" | jq -e '.success == true' > /dev/null 2>&1; then
  echo -e "${GREEN}✅ test-reviewer2 계정 생성 성공${NC}"
else
  echo -e "${YELLOW}⚠️  test-reviewer2 계정이 이미 존재하거나 생성 실패${NC}"
fi

# 사용자 3: test-reviewer3 (김코딩 역할)
echo -e "${BLUE}사용자 생성: test-reviewer3@asyncsite.com${NC}"
USER3_RESPONSE=$(curl -s -X POST http://localhost:8080/api/users/register \
  -H "Content-Type: application/json" \
  -d @- <<'JSON'
{
  "email": "test-reviewer3@asyncsite.com",
  "password": "TestPass123@",
  "name": "김코딩"
}
JSON
)

if echo "$USER3_RESPONSE" | jq -e '.success == true' > /dev/null 2>&1; then
  echo -e "${GREEN}✅ test-reviewer3 계정 생성 성공${NC}"
else
  echo -e "${YELLOW}⚠️  test-reviewer3 계정이 이미 존재하거나 생성 실패${NC}"
fi

sleep 1

# 3. 각 사용자를 스터디 멤버로 추가 (관리자 권한으로)
echo -e "\n${GREEN}3. 사용자들을 스터디 멤버로 추가 중...${NC}"

# 멤버 추가 함수
add_member() {
  local email=$1
  local name=$2
  
  echo -e "${BLUE}멤버 추가: $email${NC}"
  
  # 멤버 추가 API 호출 (관리자 권한 필요)
  MEMBER_RESPONSE=$(curl -s -X POST "http://localhost:8080/api/studies/$STUDY_ID/members" \
    -H "Authorization: Bearer $ADMIN_TOKEN" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$email\"}")
  
  if echo "$MEMBER_RESPONSE" | jq -e '.success == true' > /dev/null 2>&1; then
    echo -e "${GREEN}✅ $name 멤버 추가 성공${NC}"
  else
    echo -e "${YELLOW}⚠️  $name 멤버 추가 실패 또는 이미 멤버${NC}"
  fi
}

# 각 사용자를 멤버로 추가
add_member "test-reviewer2@asyncsite.com" "익명2"
add_member "test-reviewer3@asyncsite.com" "김코딩"

sleep 1

# 4. 각 사용자로 로그인하여 리뷰 작성
echo -e "\n${GREEN}4. 각 사용자로 리뷰 작성 중...${NC}"

# 리뷰 2: 익명2 - "Better together !"
echo -e "\n${BLUE}리뷰 작성: 익명2 - Better together !${NC}"

# test-reviewer2로 로그인
USER2_TOKEN=$(curl -s -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"test-reviewer2@asyncsite.com","password":"TestPass123@"}' \
  | jq -r '.data.accessToken')

if [ -z "$USER2_TOKEN" ] || [ "$USER2_TOKEN" = "null" ]; then
  echo -e "${YELLOW}⚠️  test-reviewer2 로그인 실패, 관리자 토큰 사용${NC}"
  USER2_TOKEN=$ADMIN_TOKEN
fi

# 리뷰 작성
REVIEW2_RESPONSE=$(curl -s -X POST "http://localhost:8080/api/reviews/studies/$STUDY_ID" \
  -H "Authorization: Bearer $USER2_TOKEN" \
  -H "Content-Type: application/json; charset=UTF-8" \
  -d @- <<'JSON'
{
  "type": "STUDY_EXPERIENCE",
  "title": "Better together",
  "content": "혼자서는 엄두도 못 냈던 어려운 알고리즘 문제들을 테코테코 모임에서 함께 고민하고 해결하며 완독하는 뿌듯함을 느꼈습니다. 함께라면 우린 해낼 수 있어요",
  "rating": 5,
  "tags": ["🧡 팀워크", "😍 사랑", "😃 행복"]
}
JSON
)

if echo "$REVIEW2_RESPONSE" | jq -e '.success == true' > /dev/null 2>&1; then
  echo -e "${GREEN}✅ 리뷰 2 추가 성공${NC}"
else
  echo -e "${YELLOW}⚠️  리뷰 2 추가 실패${NC}"
  echo "$REVIEW2_RESPONSE" | jq '.'
fi

sleep 1

# 리뷰 3: 김코딩 - "알고리즘 실력이 확실히 늘었어요"
echo -e "\n${BLUE}리뷰 작성: 김코딩 - 알고리즘 실력이 확실히 늘었어요${NC}"

# test-reviewer3로 로그인
USER3_TOKEN=$(curl -s -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"test-reviewer3@asyncsite.com","password":"TestPass123@"}' \
  | jq -r '.data.accessToken')

if [ -z "$USER3_TOKEN" ] || [ "$USER3_TOKEN" = "null" ]; then
  echo -e "${YELLOW}⚠️  test-reviewer3 로그인 실패, 관리자 토큰 사용${NC}"
  USER3_TOKEN=$ADMIN_TOKEN
fi

# 리뷰 작성
REVIEW3_RESPONSE=$(curl -s -X POST "http://localhost:8080/api/reviews/studies/$STUDY_ID" \
  -H "Authorization: Bearer $USER3_TOKEN" \
  -H "Content-Type: application/json; charset=UTF-8" \
  -d @- <<'JSON'
{
  "type": "STUDY_EXPERIENCE",
  "title": "알고리즘 실력이 확실히 늘었어요",
  "content": "DP, 그래프, BFS/DFS 등 막막하기만 했던 알고리즘들이 이제는 패턴이 보이기 시작해요. 매주 금요일이 기다려지는 스터디입니다",
  "rating": 5,
  "tags": ["💪 실력향상", "🎯 패턴인식", "🎉 기대감"]
}
JSON
)

if echo "$REVIEW3_RESPONSE" | jq -e '.success == true' > /dev/null 2>&1; then
  echo -e "${GREEN}✅ 리뷰 3 추가 성공${NC}"
else
  echo -e "${YELLOW}⚠️  리뷰 3 추가 실패${NC}"
  echo "$REVIEW3_RESPONSE" | jq '.'
fi

# 5. 최종 결과 확인
echo -e "\n${GREEN}5. 최종 리뷰 목록 확인...${NC}"

REVIEWS_RESPONSE=$(curl -s -X GET "http://localhost:8080/api/reviews/studies/$STUDY_ID")
REVIEW_COUNT=$(echo "$REVIEWS_RESPONSE" | jq '.data.content | length')

echo -e "${GREEN}✅ 현재 총 ${REVIEW_COUNT}개의 리뷰가 등록되어 있습니다.${NC}"

# 모든 리뷰 표시
echo -e "\n${BLUE}등록된 리뷰 목록:${NC}"
echo "$REVIEWS_RESPONSE" | jq '.data.content[] | {
  title: .title, 
  author: .authorName, 
  rating: .rating,
  tags: .tags
}'

echo -e "\n${YELLOW}========================================${NC}"
echo -e "${GREEN}✅ 리뷰 추가 완료!${NC}"
echo -e "${YELLOW}========================================${NC}"

echo -e "\n${BLUE}💡 다음 단계:${NC}"
echo -e "1. http://localhost:3000/study/backend-deep-dive 에서 리뷰 확인"
echo -e "2. http://localhost:3000/study/backend-deep-dive/manage 에서"
echo -e "   '예시 데이터 불러오기' 클릭하여 UI 설정 적용"

echo -e "\n${YELLOW}📌 참고 사항:${NC}"
echo -e "- 각 사용자는 ReviewType별로 하나씩만 리뷰 작성 가능"
echo -e "- 리뷰 작성자는 반드시 스터디 멤버여야 함"
echo -e "- 느낌표는 Here Document로 처리하여 에러 방지"