#!/bin/bash

# ===================================================
# Test Studies Creation Script
# Creates multiple studies with different schedules
# ===================================================

# Configuration
GATEWAY_URL="http://localhost:8080"
USER_EMAIL="asyncsite@gmail.com"
USER_PASSWORD="qlehdrl@20250626"

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Login to get token
print_info "Logging in..."
LOGIN_RESPONSE=$(curl -s -X POST "$GATEWAY_URL/api/auth/login" \
    -H "Content-Type: application/json" \
    -d "{\"username\":\"$USER_EMAIL\",\"password\":\"$USER_PASSWORD\"}")

TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"accessToken":"[^"]*' | grep -o '[^"]*$')

if [ -z "$TOKEN" ]; then
    print_error "Login failed. Please check credentials."
    echo "$LOGIN_RESPONSE"
    exit 1
fi

print_success "Login successful!"

# Get dates
TODAY=$(date +%Y-%m-%d)
TOMORROW=$(date -v+1d +%Y-%m-%d 2>/dev/null || date -d "+1 day" +%Y-%m-%d)
NEXT_WEEK=$(date -v+7d +%Y-%m-%d 2>/dev/null || date -d "+7 days" +%Y-%m-%d)
NEXT_MONTH=$(date -v+30d +%Y-%m-%d 2>/dev/null || date -d "+30 days" +%Y-%m-%d)
THREE_MONTHS=$(date -v+90d +%Y-%m-%d 2>/dev/null || date -d "+90 days" +%Y-%m-%d)

# Function to create a study
create_study() {
    local title="$1"
    local slug="$2"
    local generation="$3"
    local schedule="$4"
    local duration="$5"
    local recurrenceType="$6"
    local capacity="$7"
    local type="${8:-PARTICIPATORY}"
    local tagline="${9:-함께 성장하는 스터디}"
    
    print_info "Creating study: $title"
    
    local response=$(curl -s -X POST "$GATEWAY_URL/api/studies" \
        -H "Authorization: Bearer $TOKEN" \
        -H "Content-Type: application/json" \
        -d "{
            \"title\": \"$title\",
            \"generation\": $generation,
            \"type\": \"$type\",
            \"tagline\": \"$tagline\",
            \"schedule\": \"$schedule\",
            \"duration\": \"$duration\",
            \"capacity\": $capacity,
            \"recruitDeadline\": \"${TOMORROW}T23:59:59\",
            \"startDate\": \"$NEXT_WEEK\",
            \"endDate\": \"$THREE_MONTHS\",
            \"recurrenceType\": \"$recurrenceType\",
            \"proposerId\": \"$USER_EMAIL\"
        }")
    
    if echo "$response" | grep -q "success.*true"; then
        print_success "✓ Created: $title"
    else
        print_error "✗ Failed to create: $title"
        echo "$response"
    fi
    
    sleep 0.5
}

# Create various studies with different schedules

# WEEKLY studies - different days
create_study "테코테코" "tecoteco-2025-01" 3 "매주 금요일" "19:30-21:30" "WEEKLY" 8 "PARTICIPATORY" "알고리즘 스터디"
create_study "11루틴" "11routine-2025-01" 2 "매주 수요일" "23:00-24:00" "WEEKLY" 10 "PARTICIPATORY" "심야 코딩 모임"
create_study "React 마스터" "react-master-2025-01" 1 "매주 월요일" "20:00-22:00" "WEEKLY" 6 "EDUCATIONAL" "React 심화 학습"
create_study "백엔드 심화" "backend-deep-2025-01" 1 "매주 화요일" "19:00-21:00" "WEEKLY" 8 "EDUCATIONAL" "Spring Boot 마스터"
create_study "모각코" "mogakko-2025-01" 5 "매주 토요일" "14:00-18:00" "WEEKLY" 20 "PARTICIPATORY" "주말 코딩 모임"
create_study "CS 스터디" "cs-study-2025-01" 2 "매주 목요일" "20:00-22:00" "WEEKLY" 10 "EDUCATIONAL" "컴퓨터 과학 기초"

# BIWEEKLY studies
create_study "데브로그" "devlog-2025-01" 1 "격주 토요일" "14:00-16:00" "BIWEEKLY" 8 "PARTICIPATORY" "기술 블로그 작성"
create_study "오픈소스 기여" "opensource-2025-01" 1 "격주 일요일" "15:00-18:00" "BIWEEKLY" 12 "PARTICIPATORY" "오픈소스 컨트리뷰션"
create_study "AWS 실습" "aws-practice-2025-01" 1 "격주 금요일" "20:00-22:00" "BIWEEKLY" 6 "EDUCATIONAL" "클라우드 아키텍처"

# DAILY studies
create_study "매일 알고리즘" "daily-algo-2025-01" 1 "평일 매일" "07:00-08:00" "DAILY" 30 "PARTICIPATORY" "1일 1알고리즘"
create_study "영어 스터디" "english-study-2025-01" 3 "매일" "06:30-07:30" "DAILY" 15 "EDUCATIONAL" "개발 영어 학습"

# MONTHLY studies
create_study "월간 세미나" "monthly-seminar-2025-01" 12 "매월 첫째 주 금요일" "19:00-22:00" "MONTHLY" 50 "EDUCATIONAL" "기술 세미나"
create_study "네트워킹 데이" "networking-day-2025-01" 6 "매월 셋째 주 토요일" "16:00-19:00" "MONTHLY" 30 "PARTICIPATORY" "개발자 네트워킹"

# ONE_TIME events
create_study "해커톤 2025" "hackathon-2025" 1 "2025년 2월 15일" "09:00-21:00" "ONE_TIME" 100 "PARTICIPATORY" "24시간 해커톤"
create_study "컨퍼런스 준비" "conference-prep-2025" 1 "2025년 3월 1일" "14:00-18:00" "ONE_TIME" 20 "EDUCATIONAL" "발표 준비 워크샵"

# More WEEKLY studies to fill calendar
create_study "Python 기초" "python-basic-2025-01" 1 "매주 월요일" "18:00-20:00" "WEEKLY" 12 "EDUCATIONAL" "파이썬 입문"
create_study "JavaScript 심화" "js-advanced-2025-01" 2 "매주 화요일" "20:00-22:00" "WEEKLY" 10 "EDUCATIONAL" "모던 자바스크립트"
create_study "Docker 실습" "docker-practice-2025-01" 1 "매주 수요일" "19:00-21:00" "WEEKLY" 8 "EDUCATIONAL" "컨테이너 기술 학습"
create_study "Kubernetes" "k8s-study-2025-01" 1 "매주 목요일" "18:30-20:30" "WEEKLY" 6 "EDUCATIONAL" "쿠버네티스 마스터"
create_study "면접 준비" "interview-prep-2025-01" 3 "매주 금요일" "18:00-20:00" "WEEKLY" 15 "PARTICIPATORY" "기술 면접 스터디"

print_info "======================================"
print_success "Study creation completed!"
print_info "Total studies created: 20"