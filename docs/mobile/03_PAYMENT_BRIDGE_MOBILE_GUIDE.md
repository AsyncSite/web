# 모바일 결제 브릿지 가이드

## 1. 개념
- 앱 화면과 PG사(토스/카카오) 결제 흐름을 **안전하게 연결**하는 중간 레이어.
- 앱 → prepare → (시스템 브라우저/PG SDK) → 콜백 복귀 → confirm(S2S 검증) → 결과.

## 2. 앱 구현 핵심
- iOS: **ASWebAuthenticationSession** / Android: **Custom Tabs** 우선.
- 딥링크/Universal Link 등록: `asyncsite://payments/callback` 등.
- 취소/중복/타임아웃/백그라운드 복귀 UX 명확화.

## 3. 백엔드 요구사항
- payment-core: prepare/confirm/refund **멱등키**, 상태머신, 영수증/API 일관성.
- payment-gateway: PG 서명 검증, 모바일 콜백 **스킴 화이트리스트**.
- Gateway: 모바일 클라이언트 RateLimit/CORS, 민감 파라미터 마스킹.

## 4. 정책(특히 iOS)
- **오프라인 서비스**(오프라인 스터디 참가권 등): 외부 PG 허용.
- **디지털 재화**: 원칙적으로 IAP 필요.

## 5. 테스트 시나리오
- 성공/실패/취소/재시도/중복 승인 방지/네트워크 끊김/복귀/딥링크 변조 방지.
