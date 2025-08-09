# 나의 스터디 기능 분석 및 제안

## 1. 문제점

프로필 페이지(`web/src/pages/user/ProfilePage.tsx`)에 표시되는 '나의 스터디' 목록이 현재 하드코딩된 데이터로 채워져 있습니다. 이는 실제 사용자 데이터와 연동되지 않아 기능적인 한계가 있습니다.

## 2. 조사 요약

'나의 스터디' 목록을 실제 데이터와 연동하기 위해 관련 프론트엔드 및 백엔드 코드를 분석했습니다.

*   **`ProfilePage.tsx`**: '나의 스터디' 목록이 `studies`라는 상수로 정의되어 있으며, 이는 테스트 목적으로 하드코딩된 데이터임을 확인했습니다.

*   **`MainPage.tsx` 및 `Studies.tsx`**: 메인 페이지의 스터디 목록은 `web/src/components/sections/Studies/Studies.tsx` 컴포넌트에서 `studyService.getAllStudies()`를 호출하여 가져옵니다. 이 함수는 모든 공개된 스터디를 반환하며, 특정 사용자에게 속한 스터디를 필터링하는 기능은 없습니다.

*   **`studyService.ts` (프론트엔드 API 서비스)**: `web/src/api/studyService.ts` 파일을 분석한 결과, `getAllStudies()`, `getStudyById()`, `getStudyBySlug()` 등 다양한 스터디 조회 함수가 존재하지만, **현재 로그인한 사용자가 참여하거나 리드하는 스터디 목록만을 가져오는 명시적인 함수는 존재하지 않습니다.**

*   **`study-service` 백엔드 (`StudyController.java`)**: `study-service/src/main/java/com/asyncsite/studyservice/study/adapter/in/web/StudyController.java` 파일을 분석했습니다. 이 서비스는 `spring-boot-starter-web` 의존성을 포함하고 있어 웹 API를 제공하는 것이 맞습니다. 하지만 `StudyController.java` 내의 모든 `GET` 엔드포인트를 검토한 결과, **특정 사용자(예: `GET /api/v1/studies/me` 또는 `GET /api/v1/studies/user/{userId}`)의 스터디 목록을 반환하는 API 엔드포인트는 구현되어 있지 않습니다.**

*   **핵심 발견**: '나의 스터디' 기능을 실제 데이터와 연동하는 데 필요한 API 엔드포인트가 백엔드(`study-service`)와 프론트엔드(`studyService.ts`) 모두에 존재하지 않습니다.

## 3. 제안된 해결 방안

'나의 스터디' 기능을 실제 데이터와 연동하기 위해서는 백엔드 API 구현이 선행되어야 합니다.

### 3.1. 백엔드 구현 (우선 순위)

`study-service` 백엔드에 현재 로그인한 사용자의 스터디 목록을 반환하는 새로운 API 엔드포인트를 추가해야 합니다.

*   **API 엔드포인트 예시**: `GET /api/v1/studies/me` (인증된 사용자 기준)
*   **구현 내용**: 
    *   `study-service/src/main/java/com/asyncsite/studyservice/study/domain/port/in/GetStudyUseCase.java` 인터페이스에 `getStudiesForUser(UUID userId)`와 같은 새로운 메서드를 추가합니다.
    *   해당 메서드를 도메인 서비스(`study-service/src/main/java/com/asyncsite/studyservice/study/domain/service/GetStudyService.java` 등)에서 구현하여, 특정 사용자가 참여하거나 리드하는 스터디 데이터를 조회하는 로직을 추가합니다.
    *   `study-service/src/main/java/com/asyncsite/studyservice/study/adapter/in/web/StudyController.java`에 새로운 `@GetMapping` 엔드포인트(예: `/me`)를 추가하여 `GetStudyUseCase`의 새 메서드를 호출하고 결과를 반환합니다.

### 3.2. 프론트엔드 통합

백엔드 API가 구현된 후, 프론트엔드에서 이를 활용하도록 수정합니다.

*   **`studyService.ts` 업데이트**: `web/src/api/studyService.ts` 파일에 새로 추가된 백엔드 API를 호출하는 함수(예: `getMyStudies(): Promise<{ participating: Study[], leading: Study[] }>`)를 추가합니다.
*   **`ProfilePage.tsx` 수정**: 
    *   `web/src/pages/user/ProfilePage.tsx` 컴포넌트에 `useState` 훅을 사용하여 스터디 데이터, 로딩 상태, 에러 상태를 관리할 변수를 선언합니다.
    *   `useEffect` 훅을 추가하여 컴포넌트 마운트 시 `studyService.getMyStudies()` 함수를 호출하고, 가져온 데이터를 상태 변수에 저장합니다.
    *   기존의 하드코딩된 `studies` 상수를 제거하고, 새로 가져온 데이터를 사용하여 스터디 목록을 렌더링하도록 JSX를 수정합니다.
    *   로딩 중이거나 에러 발생 시 사용자에게 적절한 피드백을 제공하는 UI를 추가합니다.

이 작업은 백엔드 API 구현이 선행되어야 진행될 수 있습니다.