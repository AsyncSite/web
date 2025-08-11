#!/bin/bash

# Check and remove duplicate FAQ sections
# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${YELLOW}========================================${NC}"
echo -e "${YELLOW}Checking for duplicate FAQ sections${NC}"
echo -e "${YELLOW}========================================${NC}"

STUDY_ID="731f8bce-6b5d-404d-a17e-d6d3df7cfaf0"
TOKEN=$(cat /tmp/token.txt)

echo -e "\n${GREEN}Fetching draft page data...${NC}"

# Get the draft page
RESPONSE=$(curl -s -X GET "http://localhost:8080/api/study-pages/${STUDY_ID}/draft" \
  -H "Authorization: Bearer $TOKEN")

# Check if response has error
if echo "$RESPONSE" | jq -e '.sections' > /dev/null 2>&1; then
  # Count FAQ sections
  FAQ_COUNT=$(echo "$RESPONSE" | jq '[.sections[] | select(.type == "FAQ")] | length')
  echo -e "${BLUE}Found ${FAQ_COUNT} FAQ section(s)${NC}"
  
  if [ "$FAQ_COUNT" -gt 1 ]; then
    echo -e "${YELLOW}Multiple FAQ sections detected!${NC}"
    echo -e "\n${BLUE}FAQ Sections:${NC}"
    echo "$RESPONSE" | jq -r '.sections[] | select(.type == "FAQ") | "ID: \(.id), Order: \(.order), Title: \(.props.title)"'
    
    # Get all FAQ section IDs except the first one
    FAQ_IDS=$(echo "$RESPONSE" | jq -r '.sections[] | select(.type == "FAQ") | .id' | tail -n +2)
    
    if [ ! -z "$FAQ_IDS" ]; then
      echo -e "\n${YELLOW}The following duplicate FAQ sections will be deleted:${NC}"
      echo "$FAQ_IDS"
      
      echo -e "\n${RED}Do you want to delete these duplicate sections? (y/n)${NC}"
      read -r CONFIRM
      
      if [ "$CONFIRM" = "y" ] || [ "$CONFIRM" = "Y" ]; then
        for SECTION_ID in $FAQ_IDS; do
          echo -e "${YELLOW}Deleting section: $SECTION_ID${NC}"
          DELETE_RESPONSE=$(curl -s -X DELETE "http://localhost:8080/api/study-pages/${STUDY_ID}/sections/${SECTION_ID}" \
            -H "Authorization: Bearer $TOKEN")
          
          if echo "$DELETE_RESPONSE" | jq -e '.id' > /dev/null 2>&1; then
            echo -e "${GREEN}✅ Successfully deleted section $SECTION_ID${NC}"
          else
            echo -e "${RED}❌ Failed to delete section $SECTION_ID${NC}"
            echo "$DELETE_RESPONSE" | jq '.'
          fi
        done
      else
        echo -e "${YELLOW}Deletion cancelled${NC}"
      fi
    fi
  else
    echo -e "${GREEN}✅ No duplicate FAQ sections found${NC}"
  fi
else
  echo -e "${RED}❌ Failed to fetch page data${NC}"
  echo "$RESPONSE" | jq '.'
fi

echo -e "\n${GREEN}Done!${NC}"
echo -e "${YELLOW}========================================${NC}"