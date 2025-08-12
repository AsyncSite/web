#!/bin/bash

# TecoTeco IntroSection 블록 기반으로 추가하는 스크립트
# 새로운 블록 기반 RichTextSection 사용

# 색상 코드
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${YELLOW}========================================${NC}"
echo -e "${YELLOW}TecoTeco IntroSection (블록 기반) 추가 스크립트${NC}"
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

# 2. 스터디 ID 가져오기 또는 입력받기
echo -e "\n${GREEN}2. TecoTeco 스터디 검색 중...${NC}"

# 스터디 목록에서 TecoTeco 찾기
STUDY_ID=$(curl -s -X GET "http://localhost:8080/api/studies" \
  -H "Authorization: Bearer $TOKEN" \
  | jq -r '.data[] | select(.title | contains("테코테코")) | .id' | head -1)

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

# 3. 블록 기반 IntroSection 데이터 준비
echo -e "\n${GREEN}3. 블록 기반 IntroSection 데이터 준비 중...${NC}"

# JSON 데이터 (블록 기반 구조)
read -r -d '' INTRO_SECTION_DATA << 'EOF'
{
  "type": "RICH_TEXT",
  "props": {
    "title": "TecoTeco 소개",
    "blocks": [
      {
        "id": "block-1",
        "type": "heading",
        "level": 2,
        "content": {
          "type": "richtext",
          "version": "1.0",
          "content": [
            {
              "type": "paragraph",
              "content": [
                {
                  "type": "text",
                  "text": "변화하는 세상에서"
                },
                {
                  "type": "break"
                },
                {
                  "type": "text",
                  "text": "흔들리지 않을 '나'를 위한 스터디"
                }
              ]
            }
          ]
        }
      },
      {
        "id": "block-2",
        "type": "paragraph",
        "content": {
          "type": "richtext",
          "version": "1.0",
          "content": [
            {
              "type": "paragraph",
              "content": [
                {
                  "type": "text",
                  "text": "코딩과 지식의 가치가 흔해지는 시절입니다. AI가 순식간에 코드를 작성하고, 개발 도구들이 날마다 진화하는 지금. 개발자로서 우리가 정말 집중해야 할 것은 무엇일까요?"
                }
              ]
            }
          ]
        }
      },
      {
        "id": "block-3",
        "type": "paragraph",
        "content": {
          "type": "richtext",
          "version": "1.0",
          "content": [
            {
              "type": "paragraph",
              "content": [
                {
                  "type": "text",
                  "text": "TecoTeco는 이런 질문에서 출발했습니다. 기술이 아무리 발달해도 "
                },
                {
                  "type": "text",
                  "text": "변하지 않는 개발자의 핵심 역량",
                  "marks": [
                    {
                      "type": "highlight",
                      "color": "#c3e88d"
                    },
                    {
                      "type": "bold"
                    }
                  ]
                },
                {
                  "type": "text",
                  "text": "이 있다고 믿거든요."
                }
              ]
            }
          ]
        }
      },
      {
        "id": "block-4",
        "type": "heading",
        "level": 3,
        "content": {
          "type": "richtext",
          "version": "1.0",
          "content": [
            {
              "type": "paragraph",
              "content": [
                {
                  "type": "text",
                  "text": "물고기를 잡는 방법을 익히는 것",
                  "marks": [
                    {
                      "type": "custom",
                      "color": "#c3e88d"
                    }
                  ]
                }
              ]
            }
          ]
        }
      },
      {
        "id": "block-5",
        "type": "paragraph",
        "content": {
          "type": "richtext",
          "version": "1.0",
          "content": [
            {
              "type": "paragraph",
              "content": [
                {
                  "type": "text",
                  "text": "우리는 '물고기 그 자체'가 아닌, "
                },
                {
                  "type": "text",
                  "text": "'물고기를 잡는 방법'",
                  "marks": [
                    {
                      "type": "subtle-highlight",
                      "color": "#82aaff"
                    }
                  ]
                },
                {
                  "type": "text",
                  "text": "에 집중합니다. 단순히 문제를 푸는 것을 넘어서, 문제의 본질을 이해하고 "
                },
                {
                  "type": "text",
                  "text": "견고한 사고력과 논리력",
                  "marks": [
                    {
                      "type": "subtle-highlight",
                      "color": "#82aaff"
                    }
                  ]
                },
                {
                  "type": "text",
                  "text": "을 단련하는 것이 목표입니다."
                }
              ]
            }
          ]
        }
      },
      {
        "id": "block-6",
        "type": "paragraph",
        "content": {
          "type": "richtext",
          "version": "1.0",
          "content": [
            {
              "type": "paragraph",
              "content": [
                {
                  "type": "text",
                  "text": "매주 함께 모여 한 문제를 깊이 파고들고, 서로 다른 관점으로 접근해보며 사고의 폭을 넓혀갑니다. 왜 이 알고리즘을 선택했는지, 다른 방법은 없었는지, 이 문제에서 배울 수 있는 더 큰 인사이트는 무엇인지 함께 고민해요."
                }
              ]
            }
          ]
        }
      },
      {
        "id": "block-7",
        "type": "heading",
        "level": 3,
        "content": {
          "type": "richtext",
          "version": "1.0",
          "content": [
            {
              "type": "paragraph",
              "content": [
                {
                  "type": "text",
                  "text": "물고기를 '잘' 잡는 방법을 모색하는 것",
                  "marks": [
                    {
                      "type": "custom",
                      "color": "#c3e88d"
                    }
                  ]
                }
              ]
            }
          ]
        }
      },
      {
        "id": "block-8",
        "type": "paragraph",
        "content": {
          "type": "richtext",
          "version": "1.0",
          "content": [
            {
              "type": "paragraph",
              "content": [
                {
                  "type": "text",
                  "text": "AI를 배척하지 않고 "
                },
                {
                  "type": "text",
                  "text": "현명하게 활용하는 방법",
                  "marks": [
                    {
                      "type": "subtle-highlight",
                      "color": "#82aaff"
                    }
                  ]
                },
                {
                  "type": "text",
                  "text": "을 함께 모색합니다. AI와 페어 코딩하고, 비판적으로 분석하며 코드를 개선합니다. AI가 "
                },
                {
                  "type": "text",
                  "text": "우리의 통찰력을 확장시키는 강력한 파트너",
                  "marks": [
                    {
                      "type": "subtle-highlight",
                      "color": "#82aaff"
                    }
                  ]
                },
                {
                  "type": "text",
                  "text": "가 될 수 있음을 증명해나가고 있어요."
                }
              ]
            }
          ]
        }
      },
      {
        "id": "block-9",
        "type": "callout",
        "content": {
          "type": "richtext",
          "version": "1.0",
          "content": [
            {
              "type": "paragraph",
              "content": [
                {
                  "type": "text",
                  "text": "우리가 찾는 건 변화 속에서도 "
                },
                {
                  "type": "text",
                  "text": "흔들리지 않을 '나'",
                  "marks": [
                    {
                      "type": "highlight",
                      "color": "#c3e88d"
                    },
                    {
                      "type": "bold"
                    }
                  ]
                },
                {
                  "type": "break"
                },
                {
                  "type": "text",
                  "text": "생각하는 힘이에요."
                }
              ]
            }
          ]
        },
        "icon": "✨",
        "style": "green"
      }
    ],
    "backgroundColor": "#0a0a0a",
    "theme": "tecoteco"
  }
}
EOF

# 4. API 호출하여 섹션 추가
echo -e "\n${GREEN}4. 블록 기반 IntroSection 추가 중...${NC}"

RESPONSE=$(curl -s -X POST "http://localhost:8080/api/study-pages/${STUDY_ID}/sections" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "$INTRO_SECTION_DATA")

# 응답 확인
if echo "$RESPONSE" | jq -e '.id' > /dev/null 2>&1; then
  SECTION_ID=$(echo "$RESPONSE" | jq -r '.id')
  SECTION_ORDER=$(echo "$RESPONSE" | jq -r '.order')
  
  echo -e "${GREEN}✅ 블록 기반 IntroSection이 성공적으로 추가되었습니다!${NC}"
  echo -e "   섹션 ID: ${YELLOW}$SECTION_ID${NC}"
  echo -e "   섹션 순서: ${YELLOW}$SECTION_ORDER${NC}"
  echo -e "   블록 개수: ${BLUE}9개${NC}"
  echo -e "   테마: ${BLUE}TecoTeco${NC}"
  
  # 페이지 확인 안내
  echo -e "\n${YELLOW}페이지 확인:${NC}"
  echo -e "   관리 페이지: http://localhost:3000/study/${STUDY_ID}/manage"
  echo -e "   실제 페이지: http://localhost:3000/study/tecoteco"
  
  echo -e "\n${BLUE}💡 특징:${NC}"
  echo -e "   - 블록 기반 구조로 편집 가능"
  echo -e "   - 인라인 스타일링 지원 (색상, 하이라이트)"
  echo -e "   - Callout 블록으로 CTA 강조"
else
  echo -e "${RED}❌ IntroSection 추가 실패${NC}"
  echo -e "응답: $RESPONSE"
  
  # 에러 정보 출력
  ERROR_CODE=$(echo "$RESPONSE" | jq -r '.error.code' 2>/dev/null)
  ERROR_MSG=$(echo "$RESPONSE" | jq -r '.error.message' 2>/dev/null)
  
  if [ "$ERROR_CODE" != "null" ]; then
    echo -e "${RED}에러 코드: $ERROR_CODE${NC}"
    echo -e "${RED}에러 메시지: $ERROR_MSG${NC}"
  fi
  
  exit 1
fi

echo -e "\n${GREEN}✅ 작업 완료!${NC}"
echo -e "${YELLOW}========================================${NC}"