# Page snapshot

```yaml
- button "뒤로가기":
  - img
- heading "새 비밀번호 설정" [level=1]
- paragraph: "te**@example.com 계정의 새로운 비밀번호를 입력해주세요. 남은 시간: 58분"
- text: 새 비밀번호
- textbox "새 비밀번호"
- button "비밀번호 표시": 표시
- text: 비밀번호 확인
- textbox "비밀번호 확인"
- button "비밀번호 표시": 표시
- button "비밀번호 변경"
- paragraph:
  - text: 도움이 필요하신가요?
  - link "비밀번호 재설정 다시 요청":
    - /url: /forgot-password
```