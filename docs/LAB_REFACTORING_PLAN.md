# Lab 프로젝트 대규모 리팩토링 계획서

## 📋 목차
1. [현황 분석 요약](#현황-분석-요약)
2. [핵심 문제점](#핵심-문제점)
3. [리팩토링 목표](#리팩토링-목표)
4. [세부 실행 계획](#세부-실행-계획)
5. [위험 요소 및 대응 방안](#위험-요소-및-대응-방안)
6. [실행 우선순위](#실행-우선순위)

---

## 현황 분석 요약

### 1. 프로젝트 구조 현황

```
src/
├── components/lab/
│   ├── playground/
│   │   ├── Tetris/
│   │   └── DeductionGame/
│   └── utilities/
│       ├── TeamShuffle/
│       └── spotlight-arena/
│           └── games/
│               └── SnailRace/  ⚠️ 여기만 있음
├── utilities/spotlight-arena/
│   └── games/
│       ├── DartWheel/        ⚠️ 분리됨
│       └── SlotCascade/      ⚠️ 분리됨
└── pages/
    ├── LabPage.tsx
    ├── LabDetailPage.tsx
    └── lab/spotlight-arena/
        └── SpotlightArenaPage.tsx
```

### 2. 발견된 미사용 코드
- Journey 백업 폴더 3개 (Journey-backup, Journey-cinematic-backup, Journey-pinned-backup)
- Stats 백업 파일 2개 (Stats.tsx.portal-backup, Stats.css.portal-backup)
- tecoteco/archive 전체 폴더
- 사용되지 않는 섹션 컴포넌트들 (Activities, Calendar, Flow, ModernCalendar, Roadmap)
- 미구현 게임들 (circus-cannon, bubble-pop, masquerade)

---

## 핵심 문제점

### 1. 구조적 일관성 부재
- **Spotlight Arena 게임들의 분산**: SnailRace는 `components/lab/utilities/spotlight-arena/games/`에, DartWheel과 SlotCascade는 `utilities/spotlight-arena/games/`에 위치
- **복잡한 상대 경로**: `../../../../components/lab/utilities/spotlight-arena/shared/types` 같은 긴 import 경로

### 2. 코드 응집도 문제
- 동일한 기능(Spotlight Arena 게임들)이 서로 다른 위치에 분산
- shared 리소스에 대한 접근 경로가 일관되지 않음

### 3. 유지보수성 저하
- 폴더 구조 변경 시 여러 파일의 import 경로를 수동으로 수정해야 함
- 새로운 게임 추가 시 어디에 위치시켜야 할지 불명확

---

## 리팩토링 목표

### 1. 명확한 구조 확립
```
src/components/lab/
├── playground/              # 독립 실행 가능한 게임들
│   ├── tetris/
│   └── deduction-game/
└── utilities/               # 유틸리티 도구들
    ├── team-shuffle/
    └── spotlight-arena/     # 추첨 게임 플랫폼
        ├── games/           # 모든 미니게임 통합
        │   ├── snail-race/
        │   ├── dart-wheel/
        │   └── slot-cascade/
        ├── shared/          # 공통 리소스
        └── core/            # 핵심 로직
```

### 2. 일관된 네이밍 컨벤션
- 폴더명: kebab-case
- 컴포넌트 파일: PascalCase.tsx
- 유틸리티/훅: camelCase.ts

### 3. 최적화된 import 경로
- TypeScript path mapping 활용
- 절대 경로 import 도입

---

## 세부 실행 계획

### Phase 1: 사전 준비 (위험도: 낮음)

#### 1.1 백업 생성
```bash
# 전체 프로젝트 백업
cp -r src src_backup_$(date +%Y%m%d)
```

#### 1.2 미사용 코드 제거
- [ ] Journey 백업 폴더 3개 삭제
- [ ] Stats 백업 파일 2개 삭제
- [ ] tecoteco/archive 폴더 삭제
- [ ] sections/index.ts에서 미사용 export 제거

### Phase 2: TypeScript 설정 (위험도: 중간)

#### 2.1 tsconfig.json 수정
```json
{
  "compilerOptions": {
    "baseUrl": "src",
    "paths": {
      "@/lab/*": ["components/lab/*"],
      "@/playground/*": ["components/lab/playground/*"],
      "@/utilities/*": ["components/lab/utilities/*"],
      "@/spotlight-arena/*": ["components/lab/utilities/spotlight-arena/*"]
    }
  }
}
```

#### 2.2 Jest 설정 업데이트
```javascript
// jest.config.js
module.exports = {
  moduleNameMapper: {
    '^@/lab/(.*)$': '<rootDir>/src/components/lab/$1',
    '^@/playground/(.*)$': '<rootDir>/src/components/lab/playground/$1',
    '^@/utilities/(.*)$': '<rootDir>/src/components/lab/utilities/$1',
    '^@/spotlight-arena/(.*)$': '<rootDir>/src/components/lab/utilities/spotlight-arena/$1'
  }
};
```

### Phase 3: 폴더 구조 정리 (위험도: 높음)

#### 3.1 Spotlight Arena 게임 통합
```bash
# DartWheel 이동
mv src/utilities/spotlight-arena/games/DartWheel \
   src/components/lab/utilities/spotlight-arena/games/

# SlotCascade 이동
mv src/utilities/spotlight-arena/games/SlotCascade \
   src/components/lab/utilities/spotlight-arena/games/

# 빈 폴더 제거
rm -rf src/utilities/spotlight-arena
```

#### 3.2 네이밍 정규화
```bash
# PascalCase to kebab-case
mv src/components/lab/playground/Tetris src/components/lab/playground/tetris
mv src/components/lab/playground/DeductionGame src/components/lab/playground/deduction-game
mv src/components/lab/utilities/TeamShuffle src/components/lab/utilities/team-shuffle
# ... 기타 폴더들
```

### Phase 4: Import 경로 수정 (위험도: 높음)

#### 4.1 게임 컴포넌트 import 수정

**GameStep.tsx 수정 전:**
```typescript
import SnailRaceGame from '../../../../components/lab/utilities/spotlight-arena/games/SnailRace/SnailRaceGame';
import { DartWheelGame } from '../../../../utilities/spotlight-arena/games/DartWheel';
import { SlotCascadeGame } from '../../../../utilities/spotlight-arena/games/SlotCascade';
```

**GameStep.tsx 수정 후:**
```typescript
import { SnailRaceGame } from '@/spotlight-arena/games/snail-race';
import { DartWheelGame } from '@/spotlight-arena/games/dart-wheel';
import { SlotCascadeGame } from '@/spotlight-arena/games/slot-cascade';
```

#### 4.2 Shared 리소스 import 수정

**수정 전:**
```typescript
import { Participant } from '../../../../components/lab/utilities/spotlight-arena/shared/types';
```

**수정 후:**
```typescript
import { Participant } from '@/spotlight-arena/shared/types';
```

### Phase 5: 라우터 및 페이지 업데이트 (위험도: 중간)

#### 5.1 LabDetailPage.tsx 수정
```typescript
// 수정 전
import { Tetris, DeductionGame } from '../components/lab/playground';

// 수정 후
import { Tetris } from '@/playground/tetris';
import { DeductionGame } from '@/playground/deduction-game';
```

#### 5.2 subRouter.tsx 수정
```typescript
// 수정 전
const TeamShuffle = lazy(() => import('../components/lab/utilities/TeamShuffle'));

// 수정 후
const TeamShuffle = lazy(() => import('@/utilities/team-shuffle'));
```

### Phase 6: 검증 및 테스트 (필수)

#### 6.1 단위 테스트
- [ ] 각 게임 컴포넌트의 기존 테스트 실행
- [ ] Import 경로 변경에 따른 테스트 수정
- [ ] 새로운 경로에서의 테스트 통과 확인

#### 6.2 통합 테스트
- [ ] Lab 페이지 접근 및 렌더링 확인
- [ ] 각 게임/유틸리티 실행 확인
- [ ] 라우팅 동작 확인

#### 6.3 빌드 검증
```bash
npm run build
npm run test -- --watchAll=false
```

---

## 위험 요소 및 대응 방안

### 1. Import 경로 누락
- **위험**: 일부 import 경로를 놓칠 수 있음
- **대응**: 
  - ESLint의 import/no-unresolved 규칙 활용
  - TypeScript 컴파일러 에러 체크
  - 전체 텍스트 검색으로 이전 경로 패턴 확인

### 2. 런타임 에러
- **위험**: 동적 import나 lazy loading 실패
- **대응**:
  - 개발 서버에서 모든 라우트 수동 테스트
  - 브라우저 콘솔 에러 모니터링
  - Sentry 등 에러 트래킹 도구 활용

### 3. Git 히스토리 손실
- **위험**: 파일 이동으로 인한 히스토리 추적 어려움
- **대응**:
  - `git mv` 명령 사용으로 히스토리 보존
  - 이동 전후 커밋 분리
  - 상세한 커밋 메시지 작성

---

## 실행 우선순위

### 즉시 실행 (1일차)
1. 미사용 코드 제거 (Phase 1.2)
2. TypeScript 설정 추가 (Phase 2)

### 단계적 실행 (2-3일차)
1. Spotlight Arena 게임 통합 (Phase 3.1)
2. 관련 import 경로 수정 (Phase 4)
3. 각 단계별 테스트

### 후속 작업 (4-5일차)
1. 네이밍 정규화 (Phase 3.2)
2. 전체 검증 및 테스트 (Phase 6)
3. 문서 업데이트

---

## 예상 결과

### 1. 구조적 개선
- 명확하고 일관된 폴더 구조
- 직관적인 코드 위치
- 쉬운 신규 기능 추가

### 2. 개발 생산성 향상
- 짧고 명확한 import 경로
- IDE 자동완성 개선
- 빠른 파일 네비게이션

### 3. 유지보수성 향상
- 변경 영향도 최소화
- 명확한 의존성 관계
- 쉬운 리팩토링

---

## 주의사항

1. **점진적 접근**: 한 번에 모든 변경을 시도하지 말고 단계별로 진행
2. **백업 필수**: 각 단계 시작 전 백업 생성
3. **팀 공유**: 변경 사항을 팀원들과 충분히 공유
4. **롤백 계획**: 문제 발생 시 즉시 이전 상태로 복원할 수 있는 계획 수립

이 계획서는 실행 과정에서 발견되는 추가 이슈에 따라 업데이트될 수 있습니다.