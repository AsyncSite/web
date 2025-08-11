#!/bin/bash

# TecoTeco ExperienceSection 추가 스크립트
# 실제 사용자가 UI에서 입력한 것과 동일한 형태로 API 호출

# 색상 코드
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${YELLOW}========================================${NC}"
echo -e "${YELLOW}TecoTeco ExperienceSection 추가 스크립트${NC}"
echo -e "${YELLOW}========================================${NC}"

# 1. 로그인하여 토큰 받기
echo -e "\n${GREEN}1. 인증 토큰 획득 중...${NC}"
TOKEN=$(curl -s -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"asyncsite@gmail.com","password":"qlehdrl@20250626"}' \
  | jq -r '.data.accessToken')

if [ -z "$TOKEN" ] || [ "$TOKEN" = "null" ]; then
  echo -e "${RED}❌ 로그인 실패. 인증 정보를 확인하세요.${NC}"
  exit 1
fi

echo -e "${GREEN}✅ 토큰 획득 성공${NC}"

# 토큰을 파일에 저장 (디버깅용)
echo "$TOKEN" > /tmp/token.txt

# 2. 스터디 목록 조회하여 TecoTeco 스터디 찾기
echo -e "\n${GREEN}2. TecoTeco 스터디 검색 중...${NC}"

# 모든 스터디 목록 조회 (my-studies 대신 studies 사용)
STUDIES_RESPONSE=$(curl -s -X GET "http://localhost:8080/api/studies" \
  -H "Authorization: Bearer $TOKEN")

# TecoTeco 스터디 ID 찾기 (테코테코로 검색)
STUDY_ID=$(echo "$STUDIES_RESPONSE" | jq -r '.data[] | select(.title | contains("테코테코")) | .id' | head -1)

if [ -z "$STUDY_ID" ] || [ "$STUDY_ID" = "null" ]; then
  echo -e "${YELLOW}TecoTeco 스터디를 찾을 수 없습니다. 수동으로 입력하세요:${NC}"
  read -p "Study ID: " STUDY_ID
  
  if [ -z "$STUDY_ID" ]; then
    echo -e "${RED}❌ 스터디 ID가 필요합니다.${NC}"
    exit 1
  fi
else
  echo -e "${GREEN}✅ TecoTeco 스터디 발견: ${YELLOW}$STUDY_ID${NC}"
fi

# 3. ExperienceSection 데이터 준비
echo -e "\n${GREEN}3. ExperienceSection 데이터 준비 중...${NC}"

# JSON 데이터 (실제 TecoTeco ExperienceSection 내용)
read -r -d '' EXPERIENCE_SECTION_DATA << 'EOF'
{
  "type": "EXPERIENCE",
  "props": {
    "tagHeader": "성장을 위한 스텝",
    "title": "테코테코 모임을 한다는 건",
    "subtitle": "매주 금요일 저녁, 이런 루틴으로 함께 성장해요.",
    "highlightText": "이런 루틴",
    "steps": [
      {
        "label": "문제를 만나고",
        "title": "새로운 도전, 익숙한 문제",
        "description": "혼자서는 엄두 내지 못했던 문제들. TecoTeco에서는 그 문제들을 피하지 않고, 함께 마주하며 새로운 도전을 시작합니다. 작은 성공들이 쌓여 큰 자신감으로 이어질 거예요.",
        "illustrationType": "problem"
      },
      {
        "label": "질문하고",
        "title": "멈추지 않는 호기심, 날카로운 질문",
        "description": "막히는 지점 앞에서 주저하지 마세요. '이건 왜 이렇게 될까?', '더 좋은 방법은 없을까?' 끊임없이 질문하고 서로에게 배우며 이해의 폭을 넓힙니다. 질문하는 용기가 성장의 첫걸음입니다.",
        "illustrationType": "question"
      },
      {
        "label": "파고들고",
        "title": "본질을 꿰뚫는 깊이 있는 탐구",
        "description": "단순히 정답을 아는 것을 넘어, 문제의 본질과 숨겨진 원리를 집요하게 파고듭니다. 함께 토론하며 '아하!' 하고 깨닫는 순간, 지적 성장의 짜릿함을 경험할 수 있습니다.",
        "illustrationType": "explore"
      },
      {
        "label": "리뷰하고",
        "title": "성장을 위한 따뜻한 피드백",
        "description": "서로의 코드를 읽고, 배우고, 더 나은 코드를 위해 아낌없이 피드백합니다. 나를 돌아보고 동료의 시야를 빌려 나의 코드를 한층 더 성장시키는 소중한 시간입니다.",
        "illustrationType": "review"
      },
      {
        "label": "성장해요",
        "title": "코드를 넘어, 삶의 이야기",
        "description": "알고리즘을 넘어 개발 문화, 커리어 고민, 소소한 일상까지. 코드를 매개로 연결된 소중한 인연들이 함께 성장해요.",
        "illustrationType": "grow"
      }
    ],
    "theme": "tecoteco",
    "layout": "horizontal",
    "enableAnimation": true,
    "animationType": "fadeIn",
    "defaultActiveStep": 0,
    "autoProgress": false,
    "navigationStyle": "numbers",
    "mobileCollapse": false
  }
}
EOF

# 4. API 호출하여 섹션 추가
echo -e "\n${GREEN}4. ExperienceSection 추가 중...${NC}"

RESPONSE=$(curl -s -X POST "http://localhost:8080/api/study-pages/${STUDY_ID}/sections" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "$EXPERIENCE_SECTION_DATA")

# 응답 확인
if echo "$RESPONSE" | jq -e '.id' > /dev/null 2>&1; then
  SECTION_ID=$(echo "$RESPONSE" | jq -r '.id')
  SECTION_ORDER=$(echo "$RESPONSE" | jq -r '.order')
  
  echo -e "${GREEN}✅ ExperienceSection이 성공적으로 추가되었습니다!${NC}"
  echo -e "   섹션 ID: ${YELLOW}$SECTION_ID${NC}"
  echo -e "   섹션 순서: ${YELLOW}$SECTION_ORDER${NC}"
  echo -e "   테마: ${BLUE}TecoTeco${NC}"
  echo -e "   스텝 수: ${BLUE}5개 (성장 과정)${NC}"
  echo -e "   레이아웃: ${BLUE}가로형${NC}"
  echo -e "   네비게이션: ${BLUE}숫자 스타일${NC}"
  
  # 페이지 확인 안내
  echo -e "\n${YELLOW}페이지 확인:${NC}"
  echo -e "   관리 페이지: http://localhost:3000/study/${STUDY_ID}/manage"
  echo -e "   실제 페이지: http://localhost:3000/study/tecoteco"
  
  echo -e "\n${BLUE}💡 팁: 각 스텝을 클릭하면 상세 설명과 일러스트레이션이 표시됩니다!${NC}"
  echo -e "${BLUE}   TecoTeco 스터디의 성장 과정이 시각적으로 표현됩니다.${NC}"
else
  echo -e "${RED}❌ ExperienceSection 추가 실패${NC}"
  echo -e "응답: $RESPONSE"
  
  # 에러 코드 확인
  ERROR_CODE=$(echo "$RESPONSE" | jq -r '.error.code' 2>/dev/null)
  ERROR_MSG=$(echo "$RESPONSE" | jq -r '.error.message' 2>/dev/null)
  
  if [ "$ERROR_CODE" = "SYS-5001" ]; then
    echo -e "${YELLOW}⚠️  백엔드가 EXPERIENCE 타입을 지원하지 않습니다.${NC}"
    echo -e "${YELLOW}   어댑터를 통해 CUSTOM_HTML로 변환하여 저장해야 합니다.${NC}"
    
    # CUSTOM_HTML로 변환하여 재시도
    echo -e "\n${GREEN}5. CUSTOM_HTML로 변환하여 재시도 중...${NC}"
    
    # 타입을 CUSTOM_HTML로 변경하고 메타데이터 추가
    read -r -d '' ADAPTED_SECTION_DATA << 'EOF2'
{
  "type": "CUSTOM_HTML",
  "props": {
    "__realType": "EXPERIENCE",
    "__isExtended": true,
    "tagHeader": "성장을 위한 스텝",
    "title": "테코테코 모임을 한다는 건",
    "subtitle": "매주 금요일 저녁, 이런 루틴으로 함께 성장해요.",
    "highlightText": "이런 루틴",
    "steps": [
      {
        "label": "문제를 만나고",
        "title": "새로운 도전, 익숙한 문제",
        "description": "혼자서는 엄두 내지 못했던 문제들. TecoTeco에서는 그 문제들을 피하지 않고, 함께 마주하며 새로운 도전을 시작합니다. 작은 성공들이 쌓여 큰 자신감으로 이어질 거예요.",
        "illustrationType": "problem"
      },
      {
        "label": "질문하고",
        "title": "멈추지 않는 호기심, 날카로운 질문",
        "description": "막히는 지점 앞에서 주저하지 마세요. '이건 왜 이렇게 될까?', '더 좋은 방법은 없을까?' 끊임없이 질문하고 서로에게 배우며 이해의 폭을 넓힙니다. 질문하는 용기가 성장의 첫걸음입니다.",
        "illustrationType": "question"
      },
      {
        "label": "파고들고",
        "title": "본질을 꿰뚫는 깊이 있는 탐구",
        "description": "단순히 정답을 아는 것을 넘어, 문제의 본질과 숨겨진 원리를 집요하게 파고듭니다. 함께 토론하며 '아하!' 하고 깨닫는 순간, 지적 성장의 짜릿함을 경험할 수 있습니다.",
        "illustrationType": "explore"
      },
      {
        "label": "리뷰하고",
        "title": "성장을 위한 따뜻한 피드백",
        "description": "서로의 코드를 읽고, 배우고, 더 나은 코드를 위해 아낌없이 피드백합니다. 나를 돌아보고 동료의 시야를 빌려 나의 코드를 한층 더 성장시키는 소중한 시간입니다.",
        "illustrationType": "review"
      },
      {
        "label": "성장해요",
        "title": "코드를 넘어, 삶의 이야기",
        "description": "알고리즘을 넘어 개발 문화, 커리어 고민, 소소한 일상까지. 코드를 매개로 연결된 소중한 인연들이 함께 성장해요.",
        "illustrationType": "grow"
      }
    ],
    "theme": "tecoteco",
    "layout": "horizontal",
    "enableAnimation": true,
    "animationType": "fadeIn",
    "defaultActiveStep": 0,
    "autoProgress": false,
    "navigationStyle": "numbers",
    "mobileCollapse": false
  }
}
EOF2
    
    RETRY_RESPONSE=$(curl -s -X POST "http://localhost:8080/api/study-pages/${STUDY_ID}/sections" \
      -H "Authorization: Bearer $TOKEN" \
      -H "Content-Type: application/json" \
      -d "$ADAPTED_SECTION_DATA")
    
    if echo "$RETRY_RESPONSE" | jq -e '.id' > /dev/null 2>&1; then
      SECTION_ID=$(echo "$RETRY_RESPONSE" | jq -r '.id')
      SECTION_ORDER=$(echo "$RETRY_RESPONSE" | jq -r '.order')
      
      echo -e "${GREEN}✅ ExperienceSection이 CUSTOM_HTML로 변환되어 추가되었습니다!${NC}"
      echo -e "   섹션 ID: ${YELLOW}$SECTION_ID${NC}"
      echo -e "   섹션 순서: ${YELLOW}$SECTION_ORDER${NC}"
      echo -e "   실제 타입: ${BLUE}EXPERIENCE (CUSTOM_HTML로 래핑)${NC}"
    else
      echo -e "${RED}❌ 재시도도 실패했습니다.${NC}"
      echo -e "재시도 응답: $RETRY_RESPONSE"
      exit 1
    fi
  else
    echo -e "${RED}에러 코드: $ERROR_CODE${NC}"
    echo -e "${RED}에러 메시지: $ERROR_MSG${NC}"
    exit 1
  fi
fi

echo -e "\n${GREEN}✅ 작업 완료!${NC}"
echo -e "${YELLOW}========================================${NC}"