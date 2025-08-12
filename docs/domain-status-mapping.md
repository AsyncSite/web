# 스터디 도메인 상태 매핑 문서

## 1. 백엔드 도메인 모델

### Study Lifecycle Status (스터디 라이프사이클 상태)
백엔드에서 관리하는 스터디의 생명주기 상태:

- **PENDING**: 스터디 제안이 관리자 승인 대기 중
- **APPROVED**: 스터디 제안이 승인됨 (모집 가능 상태)
- **REJECTED**: 스터디 제안이 거절됨
- **IN_PROGRESS**: 스터디가 현재 진행 중
- **COMPLETED**: 스터디가 성공적으로 완료됨
- **TERMINATED**: 스터디가 중도 종료됨

### Application Status (개인 신청 상태)
개인이 스터디에 신청했을 때의 상태:

- **PENDING**: 신청 심사 대기 중
- **ACCEPTED**: 신청이 승인됨 (멤버가 됨)
- **REJECTED**: 신청이 거절됨
- **CANCELLED**: 신청을 취소함

## 2. 프론트엔드 표시 요구사항

### 사용자가 이해해야 하는 정보:

1. **모집 상태** (Recruitment Status)
   - 현재 이 스터디에 지원 가능한가?
   - 모집 마감일이 언제인가?

2. **진행 상태** (Progress Status)
   - 스터디가 아직 시작 안 했는가?
   - 현재 진행 중인가?
   - 이미 끝났는가?

3. **나의 참여 상태** (My Participation Status)
   - 내가 신청했는가?
   - 승인/거절 되었는가?
   - 현재 멤버인가?

## 3. 매핑 전략

### 백엔드 상태 → 사용자 친화적 표시

```typescript
// 스터디 카드에 표시할 레이블
function getStudyDisplayStatus(study: Study): DisplayStatus {
  const now = new Date();
  
  switch(study.status) {
    case 'PENDING':
      return { label: '승인 대기', color: 'gray', canApply: false };
    
    case 'APPROVED':
      // 모집 마감일 체크
      if (study.recruitDeadline && new Date(study.recruitDeadline) > now) {
        return { label: '모집 중', color: 'green', canApply: true };
      } else {
        return { label: '모집 마감', color: 'orange', canApply: false };
      }
    
    case 'IN_PROGRESS':
      return { label: '진행 중', color: 'blue', canApply: false };
    
    case 'COMPLETED':
      return { label: '완료', color: 'gray', canApply: false };
    
    case 'TERMINATED':
      return { label: '중단됨', color: 'red', canApply: false };
    
    default:
      return { label: '알 수 없음', color: 'gray', canApply: false };
  }
}
```

## 4. 컴포넌트별 사용

### StudyCard (스터디 목록)
- 백엔드 status + recruitDeadline을 조합하여 "모집 중/모집 마감/진행 중/완료" 표시

### ProfilePage (마이페이지)
- 내가 참여 중인 스터디: IN_PROGRESS 상태인 스터디 중 내가 멤버인 것
- 대기 중인 신청: Application이 PENDING인 것
- 완료한 스터디: COMPLETED 상태인 스터디 중 내가 멤버였던 것

### StudyDetailPage (상세 페이지)
- Status Banner: 백엔드 status에 따라 적절한 안내 메시지
- Review Section: COMPLETED 상태일 때만 리뷰 작성 가능
- Apply Button: APPROVED + 모집 마감일 전일 때만 표시

## 5. 주의사항

❌ **하지 말아야 할 것:**
- `recruiting`, `ongoing`, `closed` 같은 프론트엔드 전용 상태값을 백엔드 상태와 혼용
- 백엔드가 모르는 상태값을 API에 전송
- 여러 곳에서 다른 방식으로 상태 변환

✅ **해야 할 것:**
- 백엔드 상태값을 그대로 저장하고 표시 시점에만 변환
- 한 곳에서 일관되게 상태 변환 로직 관리
- 명확한 도메인 경계 유지