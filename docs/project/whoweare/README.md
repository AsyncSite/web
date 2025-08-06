# WhoWeAre Documentation Hub

AsyncSite의 'Who We Are' 섹션에 대한 모든 문서를 체계적으로 관리하는 허브입니다.

## 📚 문서 구조

```
docs/project/whoweare/
│
├── README.md (현재 문서)
├── INTEGRATED_STATUS_REPORT.md ⭐ (통합 현황 - 먼저 읽기)
│
├── 01_initial_planning/        # 초기 기획
│   └── INITIAL_3D_IMPROVEMENT_PLAN.md
│
├── 02_prototypes/              # 프로토타입 개발
│   └── PROTOTYPE_OVERVIEW.md
│
├── 03_current_status/          # 현재 상태
│   └── CURRENT_STATUS_2025_08_04.md
│
├── 04_done/                    # 완료 작업
│   └── COMPLETED_TASKS.md
│
└── 05_todo/                    # 진행 예정
    └── PENDING_TASKS.md
```

## 🎯 Quick Links

- **현재 상황 파악**: [INTEGRATED_STATUS_REPORT.md](./INTEGRATED_STATUS_REPORT.md) 
- **긴급 이슈**: [PENDING_TASKS.md](./05_todo/PENDING_TASKS.md#우선순위-높음-critical-issues)
- **완료 내역**: [COMPLETED_TASKS.md](./04_done/COMPLETED_TASKS.md)
- **프로토타입 역사**: [PROTOTYPE_OVERVIEW.md](./02_prototypes/PROTOTYPE_OVERVIEW.md)

## 🚀 즉시 실행 가능한 작업들

### 오늘 할 수 있는 것 (30분 이내)
```bash
# 1. 팀 멤버 프로필 이미지 업데이트
- [ ] public/images/face/ 디렉토리에 실제 멤버 사진 추가
- [ ] whoweareTeamMembers.ts에서 profileImage 경로 업데이트

# 2. 소셜 링크 연결
- [ ] WhoWeArePage.tsx 223-225 라인의 더미 링크를 실제 URL로 변경
- [ ] 각 멤버별 GitHub, Blog, LinkedIn URL 추가
```

### 이번 주 목표 (Critical Bug Fix)
```bash
# WebGL Context 문제 해결 - 최우선!
- [ ] ThreeSceneFloatingStory.tsx cleanup 함수 점검
- [ ] useEffect return에서 모든 리소스 해제 확인
- [ ] renderer.dispose() 제대로 호출되는지 확인
- [ ] 임시 해결책: 줌 횟수 제한 (5회까지만)
```

### 다음 스프린트 (1-2주)
```bash
# 애니메이션 개선
- [ ] 줌아웃 시 같은 방향 회전 구현
- [ ] GSAP 라이브러리 도입 검토
- [ ] 카메라 경로 스무딩

# 접근성 개선
- [ ] 키보드 네비게이션 (Tab, Enter, ESC)
- [ ] ARIA labels 추가
- [ ] 포커스 관리
```

## 🔧 개발 환경 설정

### 로컬 테스트
```bash
# 개발 서버 실행
npm start

# WhoWeAre 페이지 접속
http://localhost:3000/whoweare

# 프로토타입 테스트 (라우터 변경 필요)
# src/router/subRouter.tsx 수정
```

### 디버깅 팁
```javascript
// Chrome DevTools Console에서
// WebGL 컨텍스트 수 확인
console.log(document.querySelectorAll('canvas').length);

// Three.js 메모리 사용량
console.log(renderer.info.memory);

// FPS 모니터링
stats.showPanel(0); // FPS
```

## 📊 현재 상태 요약

| 항목 | 상태 | 우선순위 |
|------|------|----------|
| WebGL Context 버그 | 🔴 진행중 | 최고 |
| 텍스트 선명도 | ✅ 완료 | - |
| 프로필 이미지 | ⚠️ 부분완료 | 중간 |
| 소셜 링크 | ❌ 미구현 | 낮음 |
| 모바일 대응 | ✅ 완료 | - |
| 사운드 효과 | ❌ 미구현 | 낮음 |

## 💬 커뮤니케이션

### 이슈 리포팅
- WebGL 버그 재현 시: 브라우저, OS, 줌 횟수 기록
- 성능 문제: Chrome Performance 프로파일 첨부
- UI/UX 개선: 스크린샷과 함께 제안

### 코드 리뷰 체크리스트
- [ ] WebGL 리소스 정리 확인
- [ ] 메모리 누수 체크
- [ ] 모바일 테스트
- [ ] 접근성 고려

## 📈 다음 마일스톤

### v2.0 목표 (2025 Q1)
1. WebGL 안정성 100% 달성
2. 전체 팀 멤버 실제 데이터 완성
3. 접근성 WCAG AA 달성
4. 성능 60fps 안정화

### v3.0 비전 (2025 Q2)
1. React Three Fiber 마이그레이션
2. 실시간 활동 피드 연동
3. 팀 프로젝트 쇼케이스
4. 인터랙티브 스토리텔링

---

*문서 최종 업데이트: 2025년 1월 6일*
*담당: AsyncSite Development Team*