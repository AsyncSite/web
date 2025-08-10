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
  SCHEDULE = 'SCHEDULE',
  FAQ = 'FAQ',
  REVIEWS = 'REVIEWS',
  VIDEO_EMBED = 'VIDEO_EMBED',
  TIMELINE = 'TIMELINE',
  CTA = 'CTA',
  TABS = 'TABS',
  ACCORDION = 'ACCORDION',
  STATS = 'STATS',
  TABLE = 'TABLE',
  CUSTOM_HTML = 'CUSTOM_HTML',
  CODE_BLOCK = 'CODE_BLOCK'
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
}

const studyDetailPageService = {
  // Public endpoints
  async getPublishedPageBySlug(slug: string): Promise<StudyDetailPageData> {
    const response = await apiClient.get(`/api/v1/study-pages/slug/${slug}`);
    return response.data;
  },

  // Authenticated endpoints
  async getDraftPage(studyId: string): Promise<StudyDetailPageData> {
    const response = await apiClient.get(`/api/v1/study-pages/${studyId}/draft`);
    return response.data;
  },

  async createPage(studyId: string, request: CreatePageRequest): Promise<StudyDetailPageData> {
    const response = await apiClient.post(`/api/v1/study-pages/${studyId}`, request);
    return response.data;
  },

  async saveDraft(studyId: string, request: UpdatePageRequest): Promise<StudyDetailPageData> {
    const response = await apiClient.put(`/api/v1/study-pages/${studyId}/draft`, request);
    return response.data;
  },

  async addSection(studyId: string, request: AddSectionRequest): Promise<StudyDetailPageData> {
    const response = await apiClient.post(`/api/v1/study-pages/${studyId}/sections`, request);
    return response.data;
  },

  async removeSection(studyId: string, sectionId: string): Promise<StudyDetailPageData> {
    const response = await apiClient.delete(`/api/v1/study-pages/${studyId}/sections/${sectionId}`);
    return response.data;
  },

  async updateSection(studyId: string, sectionId: string, request: AddSectionRequest): Promise<StudyDetailPageData> {
    const response = await apiClient.put(`/api/v1/study-pages/${studyId}/sections/${sectionId}`, request);
    return response.data;
  },

  async reorderSections(studyId: string, sectionIds: string[]): Promise<StudyDetailPageData> {
    const response = await apiClient.put(`/api/v1/study-pages/${studyId}/sections/reorder`, { sectionIds });
    return response.data;
  },

  async requestReview(studyId: string): Promise<StudyDetailPageData> {
    const response = await apiClient.post(`/api/v1/study-pages/${studyId}/request-review`);
    return response.data;
  },

  async rejectReview(studyId: string, reason?: string): Promise<StudyDetailPageData> {
    const response = await apiClient.post(`/api/v1/study-pages/${studyId}/reject-review`, null, {
      params: { reason }
    });
    return response.data;
  },

  async publish(studyId: string): Promise<StudyDetailPageData> {
    const response = await apiClient.post(`/api/v1/study-pages/${studyId}/publish`);
    return response.data;
  },

  async archive(studyId: string): Promise<StudyDetailPageData> {
    const response = await apiClient.post(`/api/v1/study-pages/${studyId}/archive`);
    return response.data;
  }
};

export default studyDetailPageService;