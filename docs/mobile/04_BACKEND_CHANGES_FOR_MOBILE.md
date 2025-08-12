# 모바일 지원을 위한 백엔드 변경 목록

## Gateway
- 모바일 클라이언트 CORS/RateLimit 프로파일 분리
- 결제/출석/딥링크 콜백 **스킴/UL 화이트리스트** 추가
- 민감 헤더/파라미터 마스킹 재점검

## noti-service
- 디바이스 토큰 **등록/해제** API
- 구독 관리(스택/회사/지역/스터디) API
- 알림 인박스 목록/읽음 처리 API
- 예약 발송(세션 리마인드) 지원

## job-navigator-service
- 크롤 완료 → **매칭 → 발송** 오케스트레이션 훅
- 저장함/최근 본 공고 API 정합성 점검

## study-service
- 출석 체크인/체크아웃/회전 QR 발급 API
- 출석 통계/리스트, 라이브 카운트(SSE/WebSocket)
- `Attendance` 스키마 확장(lat, lon, device_id, source)

## payment-core/gateway
- 모바일 콜백 스킴/UL 허용, 멱등/영수증 재점검

## 공통
- Observability: 모바일 주요 경로에 코릴레이션ID, 메트릭
- 보안: 토큰/딥링크 파라미터 서명/검증, 속도 제한
