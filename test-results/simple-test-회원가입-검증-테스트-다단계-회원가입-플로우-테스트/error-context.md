# Page snapshot

```yaml
- button "뒤로가기":
  - img
- text: AS
- heading "회원가입 회원가입" [level=1]
- paragraph: AsyncSite의 새로운 멤버가 되어주세요
- text: 1 이메일 2 이름 3 비밀번호 4 확인 이메일 주소
- textbox "이메일 주소": newuser@example.com
- text: ✓ 0
- button "계속하기"
- text: 이름
- textbox "이름": 테스트사용자
- button "계속하기"
- text: 비밀번호
- textbox "비밀번호"
- button "보기"
- button "계속하기" [disabled]
- text: 비밀번호 확인
- textbox "비밀번호 확인"
- button "보기"
- button "회원가입 완료" [disabled]
- paragraph:
  - text: 이미 계정이 있으신가요?
  - link "로그인":
    - /url: /login
```