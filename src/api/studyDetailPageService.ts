import apiClient from './client';

export interface PageTheme {
  primaryColor?: string;
  secondaryColor?: string;
  backgroundColor?: string;
  textColor?: string;
  accentColor?: string;
  fontFamily?: string;
  fontSize?: string;
  lineHeight?: string;
  borderRadius?: string;
  spacing?: string;
  darkMode?: boolean;
  maxWidth?: string;
  containerPadding?: string;
  customCss?: string;
}

export interface PageSection {
  id: string;
  type: SectionType;
  props: any;
  order: number;
}

export enum SectionType {
  RICH_TEXT = 'RICH_TEXT',
  HERO = 'HERO',
  GALLERY = 'GALLERY',
  MEMBERS = 'MEMBERS',
  FAQ = 'FAQ',
  REVIEWS = 'REVIEWS',
  VIDEO_EMBED = 'VIDEO_EMBED',
  TABS = 'TABS',
  ACCORDION = 'ACCORDION',
  STATS = 'STATS',
  TABLE = 'TABLE',
  CUSTOM_HTML = 'CUSTOM_HTML',
  CODE_BLOCK = 'CODE_BLOCK',
  HOW_WE_ROLL = 'HOW_WE_ROLL',
  JOURNEY = 'JOURNEY',
  EXPERIENCE = 'EXPERIENCE',
  LEADER_INTRO = 'LEADER_INTRO'
}

export enum PageStatus {
  DRAFT = 'DRAFT',
  REVIEW = 'REVIEW',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED'
}

export interface StudyDetailPageData {
  id: string;
  studyId: string;
  slug: string;
  status: PageStatus;
  theme: PageTheme;
  sections: PageSection[];
  schemaVersion: string;
  version: number;
  publishedAt?: string;
  publishedBy?: string;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
}

export interface CreatePageRequest {
  slug: string;
}

export interface UpdatePageRequest {
  theme?: PageTheme;
  sections: PageSection[];
}

export interface AddSectionRequest {
  type: SectionType;
  props: any;
  order?: number;  // Optional: 지정하지 않으면 백엔드에서 자동으로 맨 뒤에 추가
}

// Version Management Types
export interface PageVersion {
  id: string;
  studyDetailPageId: string;
  versionNumber: number;
  versionType: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  slug: string;
  theme?: PageTheme;
  sections: PageSection[];
  checksum: string;
  parentVersionId?: string;
  createdAt: string;
  createdBy: string;
  publishedAt?: string;
  publishedBy?: string;
}

export interface PageEditLock {
  id: string;
  studyDetailPageId: string;
  lockedBy: string;
  lockedAt: string;
  expiresAt: string;
  lockType: 'EXCLUSIVE' | 'SHARED';
  reason?: string;
  isValid: boolean;
  remainingSeconds: number;
}

export interface VersionHistoryPage {
  content: VersionHistoryEntry[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export interface VersionHistoryEntry {
  id: string;
  studyDetailPageId: string;
  versionId: string;
  actionType: 'VERSION_CREATED' | 'VERSION_PUBLISHED' | 'VERSION_ARCHIVED' | 'DRAFT_DISCARDED' | 'LOCK_ACQUIRED' | 'LOCK_RELEASED';
  performedBy: string;
  performedAt: string;
  changesSummary?: string;
}

export interface VersionComparison {
  fromVersionId: string;
  toVersionId: string;
  fromVersionNumber: number;
  toVersionNumber: number;
  changes: VersionChange[];
  summary: VersionComparisonSummary;
}

export interface VersionChange {
  type: 'SECTION_ADDED' | 'SECTION_REMOVED' | 'SECTION_MODIFIED' | 'SECTION_REORDERED' | 'THEME_CHANGED';
  sectionId?: string;
  field?: string;
  description: string;
}

export interface VersionComparisonSummary {
  totalChanges: number;
  sectionsAdded: number;
  sectionsRemoved: number;
  sectionsModified: number;
  sectionsReordered: number;
  themeChanged: boolean;
  summaryText: string;
}

const studyDetailPageService = {
  // Public endpoints
  async getPublishedPageBySlug(slug: string): Promise<StudyDetailPageData> {
    const response = await apiClient.get(`/api/study-pages/slug/${slug}`);
    return response.data;
  },

  // Authenticated endpoints
  async getDraftPage(studyId: string): Promise<StudyDetailPageData> {
    const response = await apiClient.get(`/api/study-pages/${studyId}/draft`);
    return response.data;
  },

  // 상태와 무관하게 페이지 조회 (편집 페이지용)
  async getPageForEditing(studyId: string, studySlug: string): Promise<StudyDetailPageData | null> {
    // 1. 먼저 published 페이지 시도 (대부분의 경우)
    try {
      const publishedPage = await this.getPublishedPageBySlug(studySlug);
      if (publishedPage && publishedPage.studyId === studyId) {
        return publishedPage;
      }
    } catch (error) {
      // published 페이지가 없음 - 정상적인 경우
    }
    
    // 2. draft 페이지 시도 (신규 또는 미발행 스터디)
    try {
      return await this.getDraftPage(studyId);
    } catch (error) {
      // draft도 없음 - 페이지가 아예 없는 상태
      return null;
    }
  },

  async createPage(studyId: string, request: CreatePageRequest): Promise<StudyDetailPageData> {
    const response = await apiClient.post(`/api/study-pages/${studyId}`, request);
    return response.data;
  },

  async saveDraft(studyId: string, request: UpdatePageRequest): Promise<StudyDetailPageData> {
    const response = await apiClient.put(`/api/study-pages/${studyId}/draft`, request);
    return response.data;
  },

  async addSection(studyId: string, request: AddSectionRequest): Promise<StudyDetailPageData> {
    const response = await apiClient.post(`/api/study-pages/${studyId}/sections`, request);
    return response.data;
  },

  async removeSection(studyId: string, sectionId: string): Promise<StudyDetailPageData> {
    const response = await apiClient.delete(`/api/study-pages/${studyId}/sections/${sectionId}`);
    return response.data;
  },

  async updateSection(studyId: string, sectionId: string, request: AddSectionRequest): Promise<StudyDetailPageData> {
    const response = await apiClient.put(`/api/study-pages/${studyId}/sections/${sectionId}`, request);
    return response.data;
  },

  async reorderSections(studyId: string, sectionIds: string[]): Promise<StudyDetailPageData> {
    const response = await apiClient.put(`/api/study-pages/${studyId}/sections/reorder`, { sectionIds });
    return response.data;
  },

  async requestReview(studyId: string): Promise<StudyDetailPageData> {
    const response = await apiClient.post(`/api/study-pages/${studyId}/request-review`);
    return response.data;
  },

  async rejectReview(studyId: string, reason?: string): Promise<StudyDetailPageData> {
    const response = await apiClient.post(`/api/study-pages/${studyId}/reject-review`, null, {
      params: { reason }
    });
    return response.data;
  },

  async publish(studyId: string): Promise<StudyDetailPageData> {
    const response = await apiClient.post(`/api/study-pages/${studyId}/publish`);
    return response.data;
  },

  async archive(studyId: string): Promise<StudyDetailPageData> {
    const response = await apiClient.post(`/api/study-pages/${studyId}/archive`);
    return response.data;
  },

  // ============== Version Management APIs ==============
  
  // Create page with version management
  async createPageWithVersion(studyId: string, request: CreatePageRequest): Promise<StudyDetailPageData> {
    const response = await apiClient.post(`/api/study-pages/${studyId}/create-with-version`, request);
    return response.data;
  },

  // Get or create draft version
  async getOrCreateDraftVersion(studyId: string): Promise<PageVersion> {
    const response = await apiClient.get(`/api/study-pages/${studyId}/draft-version`);
    return response.data;
  },

  // Save draft version
  async saveDraftVersion(studyId: string, request: UpdatePageRequest): Promise<PageVersion> {
    const response = await apiClient.put(`/api/study-pages/${studyId}/draft-version`, request);
    return response.data;
  },

  // Publish draft to live
  async publishDraft(studyId: string): Promise<StudyDetailPageData> {
    const response = await apiClient.post(`/api/study-pages/${studyId}/publish`);
    return response.data;
  },

  // Discard draft changes
  async discardDraft(studyId: string): Promise<void> {
    await apiClient.delete(`/api/study-pages/${studyId}/draft-version`);
  },

  // Get version history - updated to match consolidated backend API
  async getVersionHistory(pageId: string): Promise<any[]> {
    const response = await apiClient.get(`/api/study-pages/${pageId}/versions/history`);
    return response.data;
  },

  // Revert to a previous version
  async revertToVersion(pageId: string, versionId: string): Promise<StudyDetailPageData> {
    const response = await apiClient.post(`/api/study-pages/${pageId}/versions/revert/${versionId}`);
    return response.data;
  },

  // Compare versions (keeping for future use)
  async compareVersions(studyId: string, fromVersion: number, toVersion: number): Promise<VersionComparison> {
    const response = await apiClient.get(`/api/study-pages/${studyId}/diff`, {
      params: { fromVersion, toVersion }
    });
    return response.data;
  },

  // ============== Lock Management APIs ==============

  // Acquire edit lock
  async acquireLock(studyId: string, reason?: string): Promise<PageEditLock> {
    const response = await apiClient.post(`/api/study-pages/${studyId}/lock`, { reason });
    return response.data;
  },

  // Release edit lock
  async releaseLock(studyId: string): Promise<void> {
    await apiClient.delete(`/api/study-pages/${studyId}/lock`);
  },

  // Extend lock
  async extendLock(studyId: string, minutes: number = 5): Promise<PageEditLock> {
    const response = await apiClient.put(`/api/study-pages/${studyId}/lock/extend`, null, {
      params: { minutes }
    });
    return response.data;
  },

  // Send heartbeat for lock
  async sendLockHeartbeat(studyId: string): Promise<void> {
    await apiClient.post(`/api/study-pages/${studyId}/lock/heartbeat`);
  },

  // Get current lock status
  async getLockStatus(studyId: string): Promise<PageEditLock | null> {
    try {
      const response = await apiClient.get(`/api/study-pages/${studyId}/lock`);
      return response.data;
    } catch (error) {
      return null;
    }
  },

  // Force release lock (admin only)
  async forceReleaseLock(studyId: string): Promise<void> {
    await apiClient.delete(`/api/study-pages/${studyId}/lock/force`);
  }
};

export default studyDetailPageService;