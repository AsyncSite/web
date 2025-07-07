# 패키지 매니저 정리 가이드

## 현재 상황
- npm과 yarn이 동시에 사용 중
- package-lock.json과 yarn.lock이 모두 존재
- .gitignore에 yarn.lock이 있지만 실제로는 추적됨

## 권장사항: npm 사용 (Node.js 22와 함께 제공)

### 정리 방법

```bash
# 1. yarn.lock 삭제
rm yarn.lock

# 2. node_modules 삭제
rm -rf node_modules

# 3. package-lock.json 삭제 후 재생성
rm package-lock.json

# 4. npm으로 깨끗하게 재설치
npm install --legacy-peer-deps

# 5. git에서 yarn.lock 제거
git rm yarn.lock
git commit -m "chore: remove yarn.lock, standardize on npm"
```

### .gitignore 수정
```gitignore
# 이미 yarn.lock이 포함되어 있으므로 수정 불필요
yarn.lock
```

## 팀 공지사항

모든 개발자에게 다음을 공지하세요:

```
프로젝트 패키지 매니저가 npm으로 통일되었습니다.

✅ 사용: npm install --legacy-peer-deps
❌ 사용 금지: yarn install

앞으로 모든 의존성 관리는 npm을 통해서만 진행해주세요.
```

## Vercel 배포 설정

Vercel에서도 npm을 사용하도록 설정:
1. Vercel 대시보드 → Settings → General
2. Build & Development Settings
3. Install Command: `npm install --legacy-peer-deps`
4. Build Command: `npm run build`