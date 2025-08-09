# language: ko

@auth @signup @validation @critical
기능: 회원가입 검증 시스템
  백엔드와 동기화된 검증 규칙이 프론트엔드에서 정확히 작동해야 한다.
  사용자는 실시간으로 입력값에 대한 피드백을 받아야 한다.
  
  배경:
    Given 회원가입 페이지에 접속한다
    And 이메일 회원가입 방식을 선택한다

  @smoke @realtime
  시나리오: 이메일 실시간 검증 - 형식 검사
    When 이메일 필드에 "test@" 를 입력한다
    Then 이메일 에러 메시지 "올바른 이메일 형식을 입력해주세요" 가 표시된다
    
    When 이메일 필드를 "test@example" 로 수정한다
    Then 이메일 에러 메시지 "올바른 이메일 형식을 입력해주세요" 가 표시된다
    
    When 이메일 필드를 "test@example.com" 로 수정한다
    Then 이메일 검증 상태가 "확인 중" 으로 표시된다
    And 1초 후 이메일 검증 상태가 "사용 가능" 으로 표시된다

  @regression @email-security
  시나리오: 이메일 보안 패턴 감지
    When 이메일 필드에 "<script>alert('xss')</script>@example.com" 를 입력한다
    Then 이메일 에러 메시지 "허용되지 않는 문자가 포함되어 있습니다" 가 표시된다
    
    When 이메일 필드를 "../etc/passwd@example.com" 로 수정한다
    Then 이메일 에러 메시지 "허용되지 않는 문자가 포함되어 있습니다" 가 표시된다

  @regression @email-disposable
  시나리오: 일회용 이메일 차단
    When 이메일 필드에 "test@tempmail.com" 를 입력한다
    Then 이메일 경고 메시지 "일회용 이메일 서비스는 권장하지 않습니다" 가 표시된다
    
    When 이메일 필드를 "test@guerrillamail.com" 로 수정한다  
    Then 이메일 경고 메시지 "일회용 이메일 서비스는 권장하지 않습니다" 가 표시된다

  @smoke @password-strength
  시나리오 개요: 비밀번호 강도 실시간 측정
    Given 이메일 "user@example.com" 를 입력하고 다음 단계로 진행한다
    And 이름 "홍길동" 을 입력하고 다음 단계로 진행한다
    
    When 비밀번호 필드에 "<password>" 를 천천히 입력한다
    Then 비밀번호 강도가 "<strength>" 로 표시된다
    And 비밀번호 엔트로피가 <min_entropy> 이상이다
    And 예상 해독 시간이 표시된다
    
    예시:
      | password        | strength   | min_entropy |
      | password        | 매우 약함  | 10          |
      | Password1       | 약함       | 20          |
      | P@ssw0rd        | 보통       | 30          |
      | P@ssw0rd!2024   | 강함       | 40          |
      | X#k9@mN$pQ2!vL  | 매우 강함  | 60          |
      | X#k9@mN$pQ2!vL&zR5*tY | 탁월함 | 80    |

  @regression @password-validation
  시나리오: 비밀번호 검증 규칙
    Given 이메일 "user@example.com" 를 입력하고 다음 단계로 진행한다
    And 이름 "홍길동" 을 입력하고 다음 단계로 진행한다
    
    When 비밀번호 필드에 "short" 를 입력한다
    Then 비밀번호 에러 메시지 "비밀번호는 최소 8자 이상이어야 합니다" 가 표시된다
    
    When 비밀번호 필드를 "12345678" 로 수정한다
    Then 비밀번호 에러 메시지 "대문자를 포함해야 합니다" 가 표시된다
    
    When 비밀번호 필드를 "Abcd1234" 로 수정한다
    Then 비밀번호 에러 메시지 "특수문자를 포함해야 합니다" 가 표시된다
    
    When 비밀번호 필드를 "Abcd1234!" 로 수정한다
    Then 비밀번호 에러 메시지가 표시되지 않는다
    And 비밀번호 강도가 "보통" 이상으로 표시된다

  @regression @password-personal-info
  시나리오: 개인정보 포함 비밀번호 차단
    Given 이메일 "john.doe@example.com" 를 입력하고 다음 단계로 진행한다
    And 이름 "John Doe" 를 입력하고 다음 단계로 진행한다
    
    When 비밀번호 필드에 "John123!" 를 입력한다
    Then 비밀번호 에러 메시지 "개인정보(이름)가 포함되어 있습니다" 가 표시된다
    
    When 비밀번호 필드를 "doe2024!" 로 수정한다
    Then 비밀번호 에러 메시지 "개인정보(이름)가 포함되어 있습니다" 가 표시된다
    
    When 비밀번호 필드를 "example123!" 로 수정한다
    Then 비밀번호 에러 메시지 "이메일 정보가 포함되어 있습니다" 가 표시된다

  @regression @password-common
  시나리오: 일반적인 비밀번호 차단
    Given 이메일 "user@example.com" 를 입력하고 다음 단계로 진행한다
    And 이름 "사용자" 를 입력하고 다음 단계로 진행한다
    
    When 비밀번호 필드에 "Password123!" 를 입력한다
    Then 비밀번호 경고 메시지 "일반적인 단어가 포함되어 있습니다" 가 표시된다
    
    When 비밀번호 필드를 "Qwerty123!" 로 수정한다
    Then 비밀번호 경고 메시지 "키보드 패턴이 감지되었습니다" 가 표시된다

  @smoke @name-validation
  시나리오: 이름 검증
    Given 이메일 "user@example.com" 를 입력하고 다음 단계로 진행한다
    
    When 이름 필드에 "A" 를 입력한다
    Then 이름 에러 메시지 "이름은 최소 2자 이상이어야 합니다" 가 표시된다
    
    When 이름 필드를 "<script>alert('xss')</script>" 로 수정한다
    Then 이름 에러 메시지 "허용되지 않는 문자가 포함되어 있습니다" 가 표시된다
    
    When 이름 필드를 "홍길동" 로 수정한다
    Then 이름 에러 메시지가 표시되지 않는다
    And 계속하기 버튼이 활성화된다

  @smoke @multistep-flow
  시나리오: 다단계 회원가입 플로우
    # 1단계: 이메일
    When 이메일 필드에 "newuser@example.com" 를 입력한다
    Then 현재 단계가 "이메일" 이다
    And 완료된 단계 수가 0 이다
    
    When 계속하기 버튼을 클릭한다
    Then 현재 단계가 "이름" 이다
    And 완료된 단계 수가 1 이다
    
    # 2단계: 이름
    When 이름 필드에 "테스트사용자" 를 입력한다
    And 계속하기 버튼을 클릭한다
    Then 현재 단계가 "비밀번호" 이다
    And 완료된 단계 수가 2 이다
    
    # 3단계: 비밀번호
    When 비밀번호 필드에 "Test@1234567" 를 입력한다
    And 계속하기 버튼을 클릭한다
    Then 현재 단계가 "확인" 이다
    And 완료된 단계 수가 3 이다
    
    # 4단계: 비밀번호 확인
    When 비밀번호 확인 필드에 "Test@1234567" 를 입력한다
    Then 회원가입 완료 버튼이 활성화된다

  @regression @password-mismatch
  시나리오: 비밀번호 불일치 처리
    Given 다음 정보로 회원가입을 진행한다:
      | 필드   | 값                    |
      | 이메일 | user@example.com      |
      | 이름   | 사용자                |
      | 비밀번호 | SecureP@ss123       |
    
    When 비밀번호 확인 필드에 "DifferentP@ss123" 를 입력한다
    Then 비밀번호 확인 에러 메시지 "비밀번호가 일치하지 않습니다" 가 표시된다
    And 회원가입 완료 버튼이 비활성화된다
    
    When 비밀번호 확인 필드를 "SecureP@ss123" 로 수정한다
    Then 비밀번호 확인 에러 메시지가 표시되지 않는다
    And 회원가입 완료 버튼이 활성화된다

  @performance @load-time
  시나리오: 페이지 로딩 성능
    Then 페이지 로딩이 3초 이내에 완료된다
    And First Contentful Paint가 2초 이내이다
    And 콘솔에 에러가 없다

  @accessibility @a11y
  시나리오: 접근성 검증
    Then 페이지 제목이 "회원가입" 를 포함한다
    And 모든 입력 필드에 레이블이 있다
    And Tab 키로 모든 요소를 탐색할 수 있다
    And 에러 메시지가 aria-live 영역에 표시된다