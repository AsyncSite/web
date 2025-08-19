# Async Profile Image Upload Flow Documentation

## Overview

The profile image upload system uses an asynchronous architecture to provide immediate user feedback while processing images in the background. This document details the complete flow from frontend upload to final image display.

## Architecture Components

### Frontend (Web)
- **ProfileEditPage**: Main component for profile editing
- **ProfileImageUpload**: Image selection and upload component
- **useImageUploadPolling**: Custom hook for polling upload status
- **ProfileImageUploadProgress**: Progress indicator component
- **AuthContext**: User state management

### Backend Services
- **Gateway**: Routes requests to appropriate services
- **Asset Service**: Handles image upload and processing
- **User Service**: Manages user profile data
- **Kafka**: Event bus for async communication

## Detailed Upload Flow

### 1. Image Upload Initiation

```typescript
// ProfileEditPage.tsx
const handleProfileImageChange = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('userId', user.id);
  formData.append('type', 'PROFILE_IMAGE');

  const response = await fetch('/api/assets/upload', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  });

  // Response contains pending URL
  const data = await response.json();
  // data.publicUrl = "/public/assets/upload/pending/abc123.jpg"
  // data.status = "PENDING"
}
```

### 2. Asset Service Processing

The Asset Service immediately returns a pending URL while processing the image asynchronously:

1. **Immediate Response**: Returns pending URL for user feedback
2. **Background Processing**: 
   - Validates image format and size
   - Creates optimized versions (thumbnails, etc.)
   - Stores in permanent location
3. **Event Publishing**: Publishes completion event to Kafka

**Critical Security Configuration**:
```kotlin
// Asset Service SecurityConfig.kt
.requestMatchers("/public/**").permitAll()
// NOT just "/public/assets/**" - must include pending paths
```

### 3. Frontend Polling Strategy

The frontend implements intelligent polling to handle the async nature:

```typescript
// useImageUploadPolling.ts
export function useImageUploadPolling({
  maxAttempts = 30,      // Max 60 seconds total
  pollInterval = 2000    // Check every 2 seconds
}) {
  // Polling logic checks for:
  // 1. HTTP redirect (302/301) to final asset
  // 2. Image content-type in response
  // 3. JSON status: COMPLETED
  // 4. Timeout after maxAttempts
}
```

### 4. Waiting Before Navigation

To prevent showing broken images, the ProfileEditPage waits up to 5 seconds for upload completion:

```typescript
// ProfileEditPage.tsx
const waitForUploadCompletion = async () => {
  return new Promise((resolve) => {
    const maxWaitTime = 5000; // 5 seconds
    const checkInterval = 500; // Check every 500ms
    let checkCount = 0;
    
    const checkPollingStatus = setInterval(async () => {
      checkCount++;
      
      // Fetch fresh profile data
      const freshProfile = await userService.getProfile();
      
      // Check if image is no longer pending
      if (freshProfile.profileImage && 
          !freshProfile.profileImage.includes('/pending/')) {
        // Update AuthContext with fresh data
        setUserState(freshProfile);
        clearInterval(checkPollingStatus);
        resolve();
      }
      
      // Force resolve after max time
      if (checkCount * checkInterval >= maxWaitTime) {
        clearInterval(checkPollingStatus);
        resolve();
      }
    }, checkInterval);
  });
};

// Usage in save handler
const handleSave = async () => {
  // ... save profile data ...
  
  if (hasImageUpload) {
    await waitForUploadCompletion();
  }
  
  // Navigate to MyPage
  navigate('/user/my');
};
```

### 5. AuthContext State Management

The AuthContext provides a `setUserState` method to manually update user data:

```typescript
// AuthContext.tsx
interface AuthContextType {
  user: User | null;
  setUserState: (user: User | null) => void;
  // ... other methods
}

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  
  const setUserState = useCallback((newUser: User | null) => {
    setUser(newUser);
  }, []);
  
  // ... rest of implementation
};
```

### 6. Event-Driven Backend Updates

When image processing completes, Asset Service publishes an event:

```kotlin
// Asset Service
data class ProfileImageUpdatedEvent(
    val userId: String,
    val profileImageUrl: String,
    val uploadedAt: Instant
)

// Publish to Kafka topic: asyncsite.asset.events
```

User Service consumes this event and updates the profile:

```kotlin
// User Service
@KafkaListener(topics = ["asyncsite.asset.events"])
fun handleProfileImageUpdate(event: ProfileImageUpdatedEvent) {
    userService.updateProfileImage(event.userId, event.profileImageUrl)
}
```

## UI Components

### ProfileImageUpload Component

Handles file selection and upload initiation:

```typescript
// ProfileImageUpload.tsx
<div className="profile-image-upload">
  <img src={currentImage || '/default-avatar.png'} />
  <input 
    type="file" 
    accept="image/*"
    onChange={handleFileSelect}
  />
  <button onClick={handleUpload}>Upload</button>
</div>
```

### ProfileImageUploadProgress Component

Shows upload progress with CSS modules for styling:

```typescript
// ProfileImageUploadProgress.tsx
function ProfileImageUploadProgress({
  isVisible,
  progress,
  status, // 'uploading' | 'processing' | 'success' | 'error'
  errorMessage
}) {
  // Renders floating notification with:
  // - Progress bar (0-100%)
  // - Status text
  // - Success/error indicators
}
```

**CSS Module Structure**:
```css
/* ProfileImageUploadProgress.module.css */
.profileImageUploadProgress-overlay-container { }
.profileImageUploadProgress-spinner-ring { }
.profileImageUploadProgress-bar-container { }
.profileImageUploadProgress-success-icon { }
.profileImageUploadProgress-error-icon { }
```

## Common Issues and Solutions

### Issue 1: 401 Unauthorized on Pending URLs

**Symptom**: Pending image URLs return 401 error

**Cause**: Asset Service security configuration too restrictive

**Solution**: 
```kotlin
// Change from:
.requestMatchers("/public/assets/**").permitAll()
// To:
.requestMatchers("/public/**").permitAll()
```

### Issue 2: Broken Image on MyPage After Upload

**Symptom**: Question mark icon shows after redirect to MyPage

**Cause**: Navigation happens before upload processing completes

**Solution**: Implement 5-second polling wait before navigation (see Section 4)

### Issue 3: AuthContext Not Updating

**Symptom**: Old profile image shows even after successful upload

**Cause**: AuthContext user state not refreshed

**Solution**: Add and use `setUserState` method in AuthContext to manually update user data

### Issue 4: 500 Error on Initial Upload

**Symptom**: First upload attempt after service restart fails

**Cause**: Spring Boot initialization delay

**Solution**: Service self-heals after ~5 minutes; implement retry logic in frontend

## Testing the Upload Flow

### Local Development Testing

```bash
# 1. Start all services
docker-compose up -d

# 2. Monitor Asset Service logs
docker logs -f asyncsite-asset-service | grep -E "UPLOAD|PENDING|COMPLETED"

# 3. Check Kafka events
docker exec asyncsite-kafka kafka-console-consumer.sh \
  --bootstrap-server localhost:9092 \
  --topic asyncsite.asset.events \
  --from-beginning

# 4. Verify User Service consumption
docker logs -f asyncsite-user-service | grep "ProfileImageUpdatedEvent"
```

### Frontend Testing

1. Navigate to Profile Edit page (`/user/profile/edit`)
2. Select and upload an image
3. Watch for progress indicator
4. Verify image appears correctly after save
5. Check MyPage shows updated image without refresh

### API Testing with curl

```bash
# Upload profile image
curl -X POST http://localhost:8080/api/assets/upload \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@/path/to/image.jpg" \
  -F "userId=$USER_ID" \
  -F "type=PROFILE_IMAGE"

# Check pending URL status
curl http://localhost:8080/public/assets/upload/pending/abc123.jpg

# Get updated profile
curl http://localhost:8080/api/users/me \
  -H "Authorization: Bearer $TOKEN"
```

## Configuration Requirements

### Frontend Environment Variables

```env
REACT_APP_API_URL=http://localhost:8080          # Gateway URL
REACT_APP_ASSET_SERVICE_URL=http://localhost:8084 # Direct Asset Service
```

### Asset Service Configuration

```yaml
# application.yml
security:
  public-paths:
    - /public/**  # Must include all public paths
    
upload:
  pending-dir: /tmp/pending
  assets-dir: /var/assets
  max-file-size: 10MB
```

### User Service Kafka Configuration

```yaml
spring:
  kafka:
    consumer:
      group-id: user-service
      topics:
        - asyncsite.asset.events
```

## Performance Considerations

### Upload Size Limits
- Maximum file size: 10MB
- Supported formats: JPG, PNG, GIF, WebP
- Automatic compression for images > 1MB

### Polling Optimization
- Initial poll after 2 seconds
- Maximum 30 attempts (60 seconds total)
- Exponential backoff for failed requests

### Caching Strategy
- Pending URLs cached for 5 minutes
- Final asset URLs cached indefinitely
- Browser cache headers set appropriately

## Security Considerations

### Authentication
- All upload requests require valid JWT token
- User can only upload their own profile image
- Token validated at Gateway and Asset Service

### File Validation
- MIME type verification
- File extension validation
- Image content verification (not just headers)
- Virus scanning (if configured)

### Access Control
- Pending URLs are public (temporary)
- Final assets require authentication for private images
- Public profile images accessible without auth

## Future Enhancements

### Planned Improvements
1. **Image Cropping**: Allow users to crop images before upload
2. **Multiple Sizes**: Generate multiple resolutions for responsive display
3. **CDN Integration**: Serve images through CDN for better performance
4. **Progress Websockets**: Replace polling with WebSocket for real-time updates
5. **Batch Upload**: Support multiple image uploads for galleries

### Technical Debt
1. Refactor polling logic to use exponential backoff
2. Add comprehensive error recovery mechanisms
3. Implement image format conversion (e.g., HEIC to JPG)
4. Add telemetry for upload success/failure rates

## Related Documentation

- [User Service Event Architecture](../../user-service/docs/EVENT_DRIVEN_ARCHITECTURE.md)
- [Asset Service README](../../asset-service/README.md)
- [AuthContext Implementation](../src/contexts/AuthContext.tsx)
- [Profile Edit Page](../src/pages/user/ProfileEditPage.tsx)

## Version History

- **2025-08-19**: Initial documentation of async profile upload flow
- **2025-08-19**: Added polling strategy and AuthContext state management
- **2025-08-19**: Security configuration fix for pending URLs