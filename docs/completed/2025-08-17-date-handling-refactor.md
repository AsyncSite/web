# Date Handling Refactoring - 2025-08-17

## 📋 Summary
Consolidated date parsing logic across the application using a centralized `parseDate` utility function to handle multiple date formats from the backend API.

## 🎯 Problem
The backend API returns dates in various formats:
- **Array format**: `[2025, 8, 17, 2, 2, 32, 333732847]` (year, month, day, hour, minute, second, nanoseconds)
- **String format**: `"2025-08-17T00:00:00"`
- **Date object**: JavaScript Date instances

This inconsistency was causing "Invalid Date" errors throughout the application when components expected string dates but received arrays.

## 🔧 Solution

### 1. Centralized parseDate Utility
Located in `/src/utils/studyScheduleUtils.ts`:
```typescript
export function parseDate(dateValue: string | number[] | Date | undefined | null): Date | null {
  if (!dateValue) return null;
  
  // Already a Date object
  if (dateValue instanceof Date) {
    return isNaN(dateValue.getTime()) ? null : dateValue;
  }
  
  // Array format [year, month, day, hour?, minute?, second?]
  if (Array.isArray(dateValue)) {
    const [year, month, day, hour = 0, minute = 0, second = 0] = dateValue;
    return new Date(year, month - 1, day, hour, minute, second);
  }
  
  // String format
  try {
    const date = new Date(dateValue);
    return isNaN(date.getTime()) ? null : date;
  } catch {
    return null;
  }
}
```

### 2. Refactored Components

#### Phase 1: Core Logic Consolidation
**Files Modified (5):**
- `src/utils/studyStatusUtils.ts` - Removed duplicate parseDate, imported from studyScheduleUtils
- `src/api/studyService.ts` - Removed duplicate parseDate, imported from studyScheduleUtils
- `src/pages/StudyPage.tsx` - Removed duplicate parseDate, imported from studyScheduleUtils
- `src/components/layout/Header.tsx` - Removed duplicate parseDate, imported from studyScheduleUtils
- `src/components/sections/Studies/Studies.tsx` - Removed duplicate parseDate, imported from studyScheduleUtils

**Impact:** -53 lines of duplicate code

#### Phase 2: Filter Logic Enhancement
**Files Modified (3):**
- `src/pages/StudyPage.tsx` - Added "upcoming" studies filter (募集マ感 but not started yet)
- `src/components/layout/Header.tsx` - Added upcoming studies to dropdown
- `src/components/sections/Studies/Studies.tsx` - Added upcoming studies to main page

#### Phase 3: Bug Fixes
**Files Modified (4):**
- `src/pages/StudyManagementPage.tsx` - Fixed formatDate to handle array dates
- `src/pages/user/ProfilePage.tsx` - Fixed 3 date displays (createdAt, appliedAt, joinedAt)
- `src/components/review/ReviewItem.tsx` - Fixed formatDate to handle array dates
- `src/components/study/PreviewModal.tsx` - Fixed formatDate to handle array dates

## 📊 Results

### Before
```typescript
// Each file had its own parseDate implementation
const parseDate = (date: string | number[] | null): Date | null => {
  // Duplicate logic in 5+ files
}

// Components breaking with array dates
new Date(study.joinedAt).toLocaleDateString() // Error when joinedAt is array
```

### After
```typescript
// Single source of truth
import { parseDate } from '../utils/studyScheduleUtils';

// Safe date handling everywhere
parseDate(study.joinedAt)?.toLocaleDateString() || 'Invalid Date'
```

## ✅ Benefits
1. **DRY Principle**: Single parseDate implementation
2. **Type Safety**: Handles all date formats from backend
3. **Error Prevention**: No more "Invalid Date" displays
4. **Maintainability**: Changes to date parsing logic only need to be made in one place
5. **Consistency**: All components handle dates the same way

## 🔍 Testing Checklist
- [x] TypeScript compilation passes without errors
- [x] StudyPage filters work correctly (All/Recruiting/Upcoming/Ongoing/Completed)
- [x] Header dropdown shows correct studies
- [x] Main page Studies section displays properly
- [x] Study management page shows dates correctly
- [x] Profile page displays study dates
- [x] Review timestamps work correctly
- [x] Preview modal date formatting works

## 📝 Commits
1. `refactor: consolidate parseDate utility function to eliminate code duplication across 5 files`
2. `fix: include upcoming studies in header dropdown filter to match StudyPage logic`
3. `fix: include upcoming studies in main page Studies section to match filter logic across all pages`
4. `fix: handle array date format in StudyManagementPage formatDate using parseDate util`
5. `fix: handle array date formats in ProfilePage, ReviewItem, and PreviewModal using parseDate util`

## 🚀 Future Considerations
- Consider creating a dedicated date formatting utility that wraps parseDate
- Add unit tests for parseDate function with all possible input formats
- Consider using a date library like date-fns for more complex date operations
- Backend API should ideally standardize on a single date format

## 📌 Related Documentation
- [CLAUDE.md](../../CLAUDE.md) - Updated with DRY principles and incremental commit practices
- Backend API documentation should be updated to document date format variations