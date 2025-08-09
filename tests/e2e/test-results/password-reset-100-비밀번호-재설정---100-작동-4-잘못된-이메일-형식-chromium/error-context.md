# Page snapshot

```yaml
- button "뒤로가기":
  - img
- heading "비밀번호 재설정" [level=1]
- paragraph: 가입하신 이메일 주소를 입력해주세요. 비밀번호 재설정 링크를 보내드립니다.
- text: 이메일
- textbox "이메일": not-an-email
- button "재설정 링크 전송"
- paragraph:
  - text: 비밀번호를 기억하셨나요?
  - link "로그인":
    - /url: /login
- paragraph:
  - text: 계정이 없으신가요?
  - link "회원가입":
    - /url: /signup
```