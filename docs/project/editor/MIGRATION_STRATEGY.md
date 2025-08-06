# Data Migration Strategy for TipTap Integration

## Overview

This document outlines the strategy for migrating existing plain text data to rich text format and managing the transition period where both formats coexist.

## Current Data Analysis

### Study Platform Backoffice
- **Total Studies**: Unknown (need database query)
- **Description Field**: 
  - Type: `VARCHAR(500)` or `TEXT`
  - Content: Plain text only
  - Average length: ~200-300 characters

### Web Frontend
- **User Profiles**:
  - Bio field: **Does not exist** (new feature)
  - No migration needed for bio
  - Will be rich text from day one

## Migration Approaches

### Option 1: Dual-Format Support (RECOMMENDED)
**Keep both plain text and rich text working simultaneously**

#### Implementation:
```typescript
// Utility function to detect content type
export function isRichTextContent(content: string): boolean {
  // Check for HTML tags
  return /<[^>]+>/.test(content);
}

// Display component that handles both formats
export function ContentDisplay({ content }: { content: string }) {
  if (isRichTextContent(content)) {
    return <RichTextDisplay content={content} />;
  }
  
  // Convert plain text to basic HTML
  const htmlContent = plainTextToHtml(content);
  return <RichTextDisplay content={htmlContent} />;
}

// Plain text to HTML converter
export function plainTextToHtml(text: string): string {
  return text
    .split('\n\n')
    .map(paragraph => `<p>${paragraph.replace(/\n/g, '<br>')}</p>`)
    .join('');
}
```

#### Pros:
- No immediate data migration required
- Backward compatible
- Lower risk
- Gradual transition

#### Cons:
- Complexity in handling two formats
- Inconsistent user experience initially

### Option 2: Batch Migration
**Convert all existing data to HTML format**

#### Migration Script:
```sql
-- Backup first
CREATE TABLE study_backup AS SELECT * FROM studies;

-- Update descriptions to HTML format
UPDATE studies 
SET description = CONCAT('<p>', REPLACE(REPLACE(description, '\n\n', '</p><p>'), '\n', '<br>'), '</p>')
WHERE description NOT LIKE '<%>%';  -- Only migrate non-HTML content
```

#### Pros:
- Consistent format everywhere
- Simpler codebase
- Better user experience

#### Cons:
- Risk of data corruption
- Downtime required
- Difficult to rollback

### Option 3: Progressive Migration
**Migrate content as it's edited**

#### Implementation:
```typescript
// In StudyCreateModal/Edit
const handleSave = async (data: StudyData) => {
  // If editing existing plain text, convert it
  if (!isRichTextContent(data.description)) {
    data.description = plainTextToHtml(data.description);
    data.descriptionFormat = 'html'; // Add format flag
  }
  
  await saveStudy(data);
};
```

#### Database Schema Update:
```sql
ALTER TABLE studies 
ADD COLUMN description_format VARCHAR(10) DEFAULT 'text';

-- After migration complete
UPDATE studies 
SET description_format = 'html' 
WHERE description LIKE '<%>%';
```

## Recommended Migration Plan

### Phase 1: Preparation (Week 1)
1. **Deploy dual-format support**
   - Update display components to handle both formats
   - Add content type detection
   - Test with sample data

2. **Database backup**
   ```bash
   pg_dump -U user -d asyncsite -t studies > studies_backup_$(date +%Y%m%d).sql
   ```

3. **Add monitoring**
   ```typescript
   // Log format usage
   logger.info('Content format', {
     format: isRichTextContent(content) ? 'html' : 'text',
     contentId: study.id,
   });
   ```

### Phase 2: Soft Launch (Week 2-3)
1. **Enable TipTap for new content only**
   - New studies use rich text editor
   - Existing studies show plain text
   - Monitor for issues

2. **Feature flag implementation**
   ```typescript
   const ENABLE_RICH_TEXT = process.env.REACT_APP_ENABLE_RICH_TEXT === 'true';
   
   function StudyForm() {
     if (ENABLE_RICH_TEXT) {
       return <RichTextEditor />;
     }
     return <textarea />;
   }
   ```

### Phase 3: Migration (Week 4)
1. **Run migration script**
   ```javascript
   // Node.js migration script
   const migratePlainTextToHtml = async () => {
     const studies = await db.query('SELECT id, description FROM studies WHERE description_format = "text"');
     
     for (const study of studies) {
       const htmlDescription = plainTextToHtml(study.description);
       
       await db.query(
         'UPDATE studies SET description = ?, description_format = ? WHERE id = ?',
         [htmlDescription, 'html', study.id]
       );
       
       console.log(`Migrated study ${study.id}`);
     }
   };
   ```

2. **Verify migration**
   ```sql
   -- Check migration status
   SELECT 
     COUNT(*) as total,
     SUM(CASE WHEN description_format = 'html' THEN 1 ELSE 0 END) as html_count,
     SUM(CASE WHEN description_format = 'text' THEN 1 ELSE 0 END) as text_count
   FROM studies;
   ```

### Phase 4: Cleanup (Week 5)
1. **Remove dual-format support code**
2. **Update all display components**
3. **Remove format detection logic**

## Data Validation

### Pre-Migration Validation
```typescript
interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

function validateForMigration(content: string): ValidationResult {
  const errors: string[] = [];
  
  // Check for special characters that might break HTML
  if (content.includes('<script>')) {
    errors.push('Contains potentially malicious script tags');
  }
  
  // Check length limits (HTML will be longer)
  const estimatedHtmlLength = content.length * 1.5;
  if (estimatedHtmlLength > 10000) {
    errors.push('Content too long for migration');
  }
  
  // Check for null/undefined
  if (!content || content.trim() === '') {
    errors.push('Empty content');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
}
```

### Post-Migration Validation
```typescript
async function validateMigratedContent(studyId: string): Promise<boolean> {
  const study = await getStudy(studyId);
  
  // Verify HTML structure
  try {
    const doc = new DOMParser().parseFromString(study.description, 'text/html');
    const hasValidStructure = doc.body.children.length > 0;
    
    // Verify no content loss
    const plainText = doc.body.textContent || '';
    const originalLength = study.originalDescription?.length || 0;
    const hasContentPreserved = plainText.length >= originalLength * 0.9;
    
    return hasValidStructure && hasContentPreserved;
  } catch (error) {
    console.error('Validation failed for study', studyId, error);
    return false;
  }
}
```

## Rollback Strategy

### Database Rollback
```sql
-- If migration fails, restore from backup
DROP TABLE studies;
ALTER TABLE study_backup RENAME TO studies;

-- Or revert specific records
UPDATE studies s
SET description = b.description, description_format = 'text'
FROM study_backup b
WHERE s.id = b.id
AND s.description_format = 'html';
```

### Application Rollback
```typescript
// Environment variable to disable rich text
if (process.env.DISABLE_RICH_TEXT === 'true') {
  // Force plain text mode
  return <textarea value={stripHtml(content)} />;
}
```

### Emergency Converter
```typescript
// Strip HTML if needed
export function stripHtml(html: string): string {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return doc.body.textContent || '';
}

// Emergency fallback component
export function EmergencyTextDisplay({ content }: { content: string }) {
  try {
    return <RichTextDisplay content={content} />;
  } catch (error) {
    // Fallback to plain text
    const plainText = stripHtml(content);
    return <pre>{plainText}</pre>;
  }
}
```

## Monitoring & Metrics

### Key Metrics to Track
1. **Content Format Distribution**
   ```sql
   SELECT 
     DATE(created_at) as date,
     COUNT(CASE WHEN description LIKE '<%>%' THEN 1 END) as rich_text_count,
     COUNT(CASE WHEN description NOT LIKE '<%>%' THEN 1 END) as plain_text_count
   FROM studies
   GROUP BY DATE(created_at)
   ORDER BY date DESC;
   ```

2. **Error Rates**
   ```typescript
   // Track editor errors
   window.addEventListener('error', (event) => {
     if (event.error?.stack?.includes('tiptap')) {
       analytics.track('RichTextEditorError', {
         error: event.error.message,
         stack: event.error.stack,
       });
     }
   });
   ```

3. **Performance Impact**
   ```typescript
   // Measure render time
   const measureRenderTime = () => {
     const startTime = performance.now();
     
     // After render
     requestAnimationFrame(() => {
       const renderTime = performance.now() - startTime;
       analytics.track('RichTextRenderTime', { duration: renderTime });
     });
   };
   ```

## User Communication

### Before Migration
```typescript
// Notification component
function MigrationNotice() {
  return (
    <Alert type="info">
      <h3>텍스트 에디터 업그레이드 예정</h3>
      <p>더 나은 사용 경험을 위해 리치 텍스트 에디터로 업그레이드됩니다.</p>
      <p>기존 내용은 자동으로 변환되며, 데이터 손실은 없습니다.</p>
    </Alert>
  );
}
```

### During Migration
- Display read-only mode during migration
- Show progress indicator for admins
- Provide status updates

### After Migration
- Announce new features
- Provide tutorial/guide
- Collect user feedback

## Success Criteria

### Technical Success
- [ ] 100% of content migrated successfully
- [ ] No data loss reported
- [ ] Error rate < 0.1%
- [ ] Performance degradation < 10%

### User Success
- [ ] User satisfaction score maintained or improved
- [ ] Support tickets < 10 related to migration
- [ ] Feature adoption rate > 50% in first month

## Timeline

| Week | Phase | Activities |
|------|-------|------------|
| 1 | Preparation | Implement dual-format support, backups |
| 2-3 | Soft Launch | Deploy to production, monitor |
| 4 | Migration | Run migration scripts, validate |
| 5 | Cleanup | Remove legacy code, optimize |
| 6 | Review | Analyze metrics, gather feedback |

## Risk Matrix

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| Data corruption | Low | High | Comprehensive backups, validation |
| Performance degradation | Medium | Medium | Performance testing, optimization |
| User confusion | Medium | Low | Clear communication, tutorials |
| Rollback needed | Low | High | Tested rollback procedures |
| XSS vulnerabilities | Low | High | HTML sanitization, security testing |

## Appendix: SQL Queries

### Backup Queries
```sql
-- Full backup
pg_dump -U username -h localhost asyncsite > backup_full.sql

-- Table-specific backup
pg_dump -U username -h localhost -t studies asyncsite > backup_studies.sql

-- Data only backup
pg_dump -U username -h localhost --data-only -t studies asyncsite > backup_studies_data.sql
```

### Analysis Queries
```sql
-- Content length distribution
SELECT 
  LENGTH(description) as content_length,
  COUNT(*) as count
FROM studies
GROUP BY LENGTH(description)
ORDER BY content_length;

-- Find problematic content
SELECT id, title, description
FROM studies
WHERE description LIKE '%<script>%'
   OR description LIKE '%javascript:%'
   OR LENGTH(description) > 5000;
```

### Migration Queries
```sql
-- Add format column
ALTER TABLE studies 
ADD COLUMN IF NOT EXISTS description_format VARCHAR(10) DEFAULT 'text';

-- Update format for existing HTML content
UPDATE studies 
SET description_format = 'html'
WHERE description ~ '<[^>]+>';

-- Verify migration
SELECT description_format, COUNT(*) 
FROM studies 
GROUP BY description_format;
```