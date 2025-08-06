# Editor Integration API 설계

## 1. User Service APIs

### 1.1 프로필 관리

#### 프로필 조회
```http
GET /api/users/{userId}/profile
```

**Response:**
```json
{
  "userId": "user123",
  "email": "user@example.com",
  "name": "홍길동",
  "profileImage": "https://s3.amazonaws.com/asyncsite/profiles/user123.jpg",
  "bio": {
    "format": "editorjs",
    "content": {
      "time": 1638360464112,
      "blocks": [
        {
          "type": "paragraph",
          "data": {
            "text": "안녕하세요, 풀스택 개발자입니다."
          }
        },
        {
          "type": "list",
          "data": {
            "style": "unordered",
            "items": [
              "React/TypeScript",
              "Spring Boot/Java",
              "AWS/Docker"
            ]
          }
        }
      ],
      "version": "2.22.2"
    }
  },
  "bioUpdatedAt": "2025-01-06T10:30:00Z",
  "createdAt": "2024-12-01T09:00:00Z"
}
```

#### 프로필 업데이트
```http
PUT /api/users/me/profile
Authorization: Bearer {token}
```

**Request:**
```json
{
  "name": "홍길동",
  "bio": {
    "format": "editorjs",
    "content": {
      "blocks": [...]
    }
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "프로필이 업데이트되었습니다.",
  "data": {
    "userId": "user123",
    "bioUpdatedAt": "2025-01-06T10:35:00Z"
  }
}
```

#### 프로필 이미지 업로드
```http
POST /api/users/me/profile-image
Authorization: Bearer {token}
Content-Type: multipart/form-data
```

**Request:**
```
file: [binary data]
```

**Response:**
```json
{
  "success": true,
  "data": {
    "imageUrl": "https://s3.amazonaws.com/asyncsite/profiles/user123_1704532200.jpg",
    "thumbnailUrl": "https://s3.amazonaws.com/asyncsite/profiles/user123_1704532200_thumb.jpg"
  }
}
```

### 1.2 콘텐츠 자원 관리

#### 에디터 이미지 업로드
```http
POST /api/users/editor/upload-image
Authorization: Bearer {token}
Content-Type: multipart/form-data
```

**Request:**
```
file: [binary data]
context: "profile" | "study"
```

**Response:**
```json
{
  "success": 1,
  "file": {
    "url": "https://s3.amazonaws.com/asyncsite/editor/img_12345.jpg",
    "size": 91234,
    "name": "image.jpg",
    "title": "업로드된 이미지"
  }
}
```

## 2. Study Service APIs

### 2.1 스터디 콘텐츠 관리

#### 스터디 상세 정보 조회
```http
GET /api/studies/v1/studies/{studyId}/details
```

**Response:**
```json
{
  "studyId": 123,
  "title": "React 심화 스터디",
  "category": "FRONTEND",
  "details": {
    "format": "tiptap",
    "content": {
      "type": "doc",
      "content": [
        {
          "type": "heading",
          "attrs": { "level": 2 },
          "content": [
            { "type": "text", "text": "스터디 소개" }
          ]
        },
        {
          "type": "paragraph",
          "content": [
            { "type": "text", "text": "React의 고급 패턴과 성능 최적화를 학습합니다." }
          ]
        },
        {
          "type": "bulletList",
          "content": [
            {
              "type": "listItem",
              "content": [
                { "type": "text", "text": "Custom Hooks 패턴" }
              ]
            }
          ]
        }
      ]
    }
  },
  "curriculum": {
    "format": "tiptap",
    "content": {
      "type": "doc",
      "content": [
        {
          "type": "table",
          "content": [
            {
              "type": "tableRow",
              "content": [
                { "type": "tableCell", "content": [{ "type": "text", "text": "주차" }] },
                { "type": "tableCell", "content": [{ "type": "text", "text": "주제" }] },
                { "type": "tableCell", "content": [{ "type": "text", "text": "과제" }] }
              ]
            }
          ]
        }
      ]
    }
  },
  "updatedAt": "2025-01-06T11:00:00Z"
}
```

#### 스터디 생성 (상세 정보 포함)
```http
POST /api/studies/v1/studies
Authorization: Bearer {token}
```

**Request:**
```json
{
  "title": "React 심화 스터디",
  "category": "FRONTEND",
  "maxMembers": 8,
  "duration": {
    "startDate": "2025-02-01",
    "endDate": "2025-04-30"
  },
  "details": {
    "format": "tiptap",
    "content": {...}
  },
  "curriculum": {
    "format": "tiptap",
    "content": {...}
  },
  "applicationForm": {
    "questions": [
      {
        "question": "React 경험을 알려주세요.",
        "required": true,
        "type": "text"
      }
    ]
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "studyId": 124,
    "status": "PENDING",
    "message": "스터디가 생성되었습니다. 관리자 승인 대기 중입니다."
  }
}
```

#### 스터디 업데이트
```http
PUT /api/studies/v1/studies/{studyId}
Authorization: Bearer {token}
```

**Request:**
```json
{
  "details": {
    "format": "tiptap",
    "content": {...}
  },
  "curriculum": {
    "format": "tiptap",
    "content": {...}
  }
}
```

### 2.2 스터디 리소스 관리

#### 스터디 파일 업로드
```http
POST /api/studies/v1/studies/{studyId}/resources
Authorization: Bearer {token}
Content-Type: multipart/form-data
```

**Request:**
```
file: [binary data]
resourceType: "document" | "image" | "video"
description: "Week 1 강의 자료"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "resourceId": 456,
    "resourceUrl": "https://s3.amazonaws.com/asyncsite/studies/124/week1.pdf",
    "resourceType": "document",
    "uploadedAt": "2025-01-06T11:30:00Z"
  }
}
```

## 3. 공통 API 규격

### 3.1 에러 응답 형식
```json
{
  "success": false,
  "error": {
    "code": "CONTENT_TOO_LONG",
    "message": "콘텐츠가 최대 허용 길이를 초과했습니다.",
    "details": {
      "maxLength": 20000,
      "actualLength": 25432
    }
  }
}
```

### 3.2 에러 코드
| 코드 | 설명 | HTTP Status |
|------|------|-------------|
| `CONTENT_TOO_LONG` | 콘텐츠 길이 초과 | 400 |
| `INVALID_FORMAT` | 지원하지 않는 콘텐츠 형식 | 400 |
| `MALICIOUS_CONTENT` | 악성 스크립트 감지 | 400 |
| `UNAUTHORIZED` | 인증 필요 | 401 |
| `FORBIDDEN` | 권한 없음 | 403 |
| `NOT_FOUND` | 리소스 없음 | 404 |
| `FILE_TOO_LARGE` | 파일 크기 초과 | 413 |
| `UNSUPPORTED_MEDIA_TYPE` | 지원하지 않는 파일 형식 | 415 |

### 3.3 콘텐츠 형식 (Content Format)

#### Editor.js Format
```json
{
  "format": "editorjs",
  "content": {
    "time": 1638360464112,
    "blocks": [...],
    "version": "2.22.2"
  }
}
```

#### TipTap Format
```json
{
  "format": "tiptap",
  "content": {
    "type": "doc",
    "content": [...]
  }
}
```

#### Plain Text Format (기존 데이터)
```json
{
  "format": "plain",
  "content": "일반 텍스트 내용입니다."
}
```

### 3.4 파일 업로드 제한

| 타입 | 최대 크기 | 허용 형식 |
|------|-----------|-----------|
| 프로필 이미지 | 5MB | jpg, png, webp |
| 에디터 이미지 | 2MB | jpg, png, gif, webp |
| 문서 | 10MB | pdf, doc, docx, ppt, pptx |
| 비디오 | 100MB | mp4, webm |

### 3.5 콘텐츠 길이 제한

| 필드 | 최대 길이 | 비고 |
|------|-----------|------|
| 프로필 bio | 5,000자 | 렌더링된 텍스트 기준 |
| 스터디 details | 20,000자 | 렌더링된 텍스트 기준 |
| 스터디 curriculum | 10,000자 | 렌더링된 텍스트 기준 |

## 4. 보안 고려사항

### 4.1 XSS 방지
- 모든 사용자 입력은 DOMPurify로 정화
- 허용된 HTML 태그만 저장
- CSP(Content Security Policy) 헤더 적용

### 4.2 CSRF 방지
- 모든 변경 요청에 CSRF 토큰 필요
- SameSite 쿠키 정책 적용

### 4.3 파일 업로드 보안
- 파일 확장자 화이트리스트
- 파일 내용 검증 (Magic Number)
- 업로드된 파일 바이러스 스캔
- S3 버킷 정책으로 직접 접근 제한

## 5. 성능 최적화

### 5.1 캐싱 전략
```http
Cache-Control: public, max-age=3600
ETag: "33a64df551425fcc55e4d42a148795d9f25f89d4"
```

### 5.2 이미지 최적화
- 업로드 시 자동 리사이징
- WebP 형식 자동 변환
- CDN을 통한 배포

### 5.3 콘텐츠 압축
```http
Content-Encoding: gzip
```

## 6. 버전 관리

### 6.1 API 버전
- URL Path: `/api/studies/v1/...`
- Header: `X-API-Version: 1.0`

### 6.2 콘텐츠 버전
- Editor.js: version 필드 포함
- TipTap: schema version 관리

## 7. 마이그레이션 API

### 7.1 기존 콘텐츠 변환
```http
POST /api/admin/content/migrate
Authorization: Bearer {admin_token}
```

**Request:**
```json
{
  "targetService": "user" | "study",
  "fromFormat": "plain",
  "toFormat": "editorjs",
  "dryRun": true
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalRecords": 1234,
    "convertedRecords": 1230,
    "failedRecords": 4,
    "errors": [...]
  }
}
```

*최종 업데이트: 2025년 1월 6일*