const fs = require('fs');

// 파일 읽기
let content = fs.readFileSync('src/pages/user/ProfilePageNew.tsx', 'utf8');

// 간단한 className 변환 (예: className="something")
content = content.replace(/className="([^"]+)"/g, (match, className) => {
  // 이미 styles를 사용하는 경우 건너뛰기
  if (match.includes('styles')) return match;
  
  // 여러 클래스가 있는 경우
  if (className.includes(' ')) {
    const classes = className.split(' ');
    return `className={${classes.map(c => `styles['${c}']`).join(' + \' \' + ')}}`;
  }
  
  // 단일 클래스
  return `className={styles['${className}']}`;
});

// 템플릿 리터럴 케이스 (예: className={`something ${variable}`})
content = content.replace(/className=\{`([^`]+)`\}/g, (match, template) => {
  // 이미 styles를 사용하는 경우 건너뛰기
  if (match.includes('styles')) return match;
  
  // status-badge 특별 처리
  if (template.includes('status-badge')) {
    return match.replace('status-badge', `\${styles['status-badge']}`);
  }
  
  return match;
});

// 파일 쓰기
fs.writeFileSync('src/pages/user/ProfilePageNew.tsx', content);
console.log('Conversion complete!');