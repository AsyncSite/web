# Study 출석 모바일 MVP

## 1. 사용자 여정
- 호스트: 세션 시작 → **회전 QR** 화면 표시(10–30초 주기 갱신)
- 참가자: 앱에서 **QR 스캔 → 체크인**(옵션: 체크아웃)
- 푸시: 세션 T-15m 리마인드, 미체크인 1회 리마인드

## 2. API 설계(초안)
- 호스트
  - POST `/api/studies/{studyId}/sessions/{sessionId}/attendance/code` → 회전 코드 발급(JWT/HMAC, exp≤30s)
  - GET  `/api/studies/{studyId}/sessions/{sessionId}/attendance/live` → 실시간 카운트(SSE/WebSocket)
- 참가자
  - POST `/api/studies/{studyId}/sessions/{sessionId}/attendance/checkin`
    - body: `{ code: string, lat?:number, lon?:number, deviceId?:string }`
  - POST `/api/studies/{studyId}/sessions/{sessionId}/attendance/checkout` (선택)
- 조회/관리
  - GET `/api/studies/{studyId}/sessions/{sessionId}/attendance`
  - GET `/api/members/me/attendance/summary`

## 3. 데이터 모델 확장
- Attendance: `status, check_in_time, check_out_time, source(MOBILE_QR), lat, lon, device_id`
- 세션: `planned_start/end`, 허용 윈도우(±N분)

## 4. 부정 방지/보안
- **회전 QR**: 짧은 만료, 서명 토큰, 재사용 불가 멱등
- 시간/위치 제약, 반경(예: 100m) 검증
- `unique(memberId, sessionId)` 인덱스, 레이트리밋

## 5. 앱 구현(Flutter 기준)
- 스캐너(카메라 권한), 실패 사유 UX(만료/중복/시간/위치)
- 오프라인 큐(일시 저장 후 재시도)
- 푸시/딥링크: `asyncsite://studies/{id}/sessions/{id}`

## 6. 운영/지표
- 출석률, 평균 체크인 지연, 실패 사유 분포, 푸시→체크인 전환율
