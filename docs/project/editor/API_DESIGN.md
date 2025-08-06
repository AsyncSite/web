# Editor Integration API 설계 (구현 완료)

## 1. User Service APIs (✅ 구현됨)

### 1.1 프로필 관리

#### 현재 사용자 프로필 조회
```http
GET /api/users/me
Authorization: Bearer {token}
```

**Response:**
```json
{
  "email": "asyncsite@gmail.com",
  "name": "Super Administrator",
  "role": "Platform Architect",
  "quote": "함께 성장하는 개발자 커뮤니티를 만들어갑니다",
  "bio": "<p>열정적으로 사람들을 돕고 싶다구 ~</p>",
  "phoneNumber": "+82-10-1234-5678",
  "profileImage": null,
  "systemRole": "ROLE_ADMIN",
  "status": "ACTIVE",
  "createdAt": "2025-07-18T03:39:53Z",
  "updatedAt": "2025-08-06T09:14:10Z",
  "lastLoginAt": "2025-08-06T09:11:46Z"
}
```

#### 프로필 업데이트
```http
PUT /api/users/me
Authorization: Bearer {token}
```

**Request:**
```json
{
  "name": "사용자 이름",
  "role": "역할/직책",
  "quote": "인용구/좌우명",
  "bio": "<p>HTML 형식의 자기소개</p>",
  "profileImage": "https://example.com/image.jpg"
}
```

**Response:**
```json
{
  "email": "user@example.com",
  "name": "사용자 이름",
  "role": "역할/직책",
  "quote": "인용구/좌우명",
  "bio": "<p>HTML 형식의 자기소개</p>",
  "profileImage": "https://example.com/image.jpg",
  "systemRole": "ROLE_USER",
  "status": "ACTIVE",
  "createdAt": "2025-07-18T03:39:53Z",
  "updatedAt": "2025-08-06T10:00:00Z"
}
```

### 1.2 공개 API

#### WhoWeAre 멤버 조회
```http
GET /api/public/users/whoweare-members
```

**Response:**
```json
[
  {
    "name": "Admin User",
    "role": "System Administrator",
    "quote": "기술로 더 나은 세상을 만들어갑니다",
    "bio": "<p>시스템을 관리하는 관리자입니다.</p>",
    "profileImage": null
  },
  {
    "name": "Super Administrator",
    "role": "Platform Architect",
    "quote": "함께 성장하는 개발자 커뮤니티를 만들어갑니다",
    "bio": "<p>열정적으로 사람들을 돕고 싶다구 ~</p>",
    "profileImage": null
  }
]
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

## 3. 실제 구현 사항

### 3.1 데이터 형식

#### HTML 형식 (실제 구현)
```json
{
  "bio": "<p>안녕하세요, <strong>풀스택 개발자</strong>입니다.</p><ul><li>React</li><li>Spring Boot</li></ul>"
}
```

- TipTap 에디터가 직접 HTML을 생성/파싱
- DOMPurify로 XSS 방지
- 데이터베이스에 HTML 형식으로 저장

### 3.2 필드 제한사항 (구현됨)

| 필드 | 최대 길이 | 타입 | 설명 |
|------|-----------|------|------|
| role | 100자 | VARCHAR(100) | 역할/직책 |
| quote | 255자 | VARCHAR(255) | 인용구/좌우명 |
| bio | 2000자 | TEXT | HTML 형식 자기소개 |

### 3.3 Frontend 컴포넌트

#### RichTextEditor
- 위치: `src/components/common/RichTextEditor.tsx`
- 기능: TipTap 기반 편집기
- 지원 기능: 굵게, 이탤릭, 취소선, 링크, 목록
- 문자 수 카운트 및 제한

#### RichTextDisplay
- 위치: `src/components/common/RichTextDisplay.tsx`
- 기능: 안전한 HTML 렌더링
- 보안: DOMPurify 적용

### 3.4 Backend 구조

#### Domain Entity
```kotlin
data class UserProfile(
    val email: String,
    val name: String,
    val role: String? = null,
    val quote: String? = null,
    val bio: String? = null,
    val profileImage: String? = null,
    // ...
)
```

#### JPA Entity
```kotlin
@Entity
@Table(name = "users")
class UserJpaEntity {
    @Column(name = "role", length = 100)
    var role: String? = null
    
    @Column(name = "quote", length = 255)
    var quote: String? = null
    
    @Column(name = "bio", columnDefinition = "TEXT")
    var bio: String? = null
    // ...
}
```

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