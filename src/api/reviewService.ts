import apiClient, { handleApiError } from './client';

// Review Types
export enum ReviewType {
  OVERALL = 'OVERALL',
  CONTENT = 'CONTENT',
  OPERATION = 'OPERATION',
  // 백엔드 실제 타입들
  STUDY_EXPERIENCE = 'STUDY_EXPERIENCE',
  WEEKLY_REFLECTION = 'WEEKLY_REFLECTION', 
  IMPROVEMENT_SUGGESTION = 'IMPROVEMENT_SUGGESTION',
  LEARNING_OUTCOME = 'LEARNING_OUTCOME',
  FINAL_REVIEW = 'FINAL_REVIEW'
}

export enum ReviewStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  DELETED = 'DELETED'
}

// DTOs
export interface CreateReviewRequest {
  type: ReviewType;
  title: string;
  content: string;
  rating: number;
  tags?: string[];
}

export interface UpdateReviewRequest {
  title?: string;
  content?: string;
  rating?: number;
  tags?: string[];
}

export interface ReviewResponse {
  id: string;
  studyId: string;
  studyTitle?: string;
  reviewerId: string;
  reviewerName: string;
  type: ReviewType;
  title: string;
  content: string;
  rating: number;
  tags: string[];
  likeCount: number;
  isLikedByMe?: boolean;
  attendanceCount: number;
  status: ReviewStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewStatistics {
  totalReviews: number;
  averageRating: number;
  ratingDistribution: {
    [key: number]: number; // 1-5 star counts
  };
  typeDistribution: {
    [key in ReviewType]?: number;
  };
}

export interface ReviewSearchParams {
  type?: ReviewType;
  minRating?: number;
  page?: number;
  size?: number;
  sort?: string;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

class ReviewService {
  private readonly basePath = '/api/reviews';

  /**
   * Create a new review for a study
   */
  async createReview(studyId: string, data: CreateReviewRequest): Promise<ReviewResponse> {
    try {
      const response = await apiClient.post<{ data: ReviewResponse }>(
        `${this.basePath}/studies/${studyId}`,
        data
      );
      return response.data.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get reviews for a study with optional filters
   */
  async getReviews(studyId: string, params?: ReviewSearchParams): Promise<PageResponse<ReviewResponse>> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.type) queryParams.append('type', params.type);
      if (params?.minRating) queryParams.append('minRating', params.minRating.toString());
      if (params?.page !== undefined) queryParams.append('page', params.page.toString());
      if (params?.size) queryParams.append('size', params.size.toString());
      if (params?.sort) queryParams.append('sort', params.sort);

      const url = `${this.basePath}/studies/${studyId}${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
      const response = await apiClient.get<{ data: PageResponse<ReviewResponse> }>(url);
      return response.data.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get a specific review by ID
   */
  async getReview(reviewId: string): Promise<ReviewResponse> {
    try {
      const response = await apiClient.get<{ data: ReviewResponse }>(
        `${this.basePath}/${reviewId}`
      );
      return response.data.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Update an existing review
   */
  async updateReview(reviewId: string, data: UpdateReviewRequest): Promise<ReviewResponse> {
    try {
      const response = await apiClient.put<{ data: ReviewResponse }>(
        `${this.basePath}/${reviewId}`,
        data
      );
      return response.data.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Delete a review
   */
  async deleteReview(reviewId: string): Promise<void> {
    try {
      await apiClient.delete(`${this.basePath}/${reviewId}`);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get my reviews
   */
  async getMyReviews(): Promise<ReviewResponse[]> {
    try {
      const response = await apiClient.get<{ data: ReviewResponse[] }>(
        `${this.basePath}/my`
      );
      return response.data.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get review statistics for a study
   */
  async getReviewStatistics(studyId: string): Promise<ReviewStatistics> {
    try {
      const response = await apiClient.get<{ data: ReviewStatistics }>(
        `${this.basePath}/studies/${studyId}/statistics`
      );
      return response.data.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Like a review
   */
  async likeReview(reviewId: string): Promise<number> {
    try {
      const response = await apiClient.put<{ data: number }>(
        `${this.basePath}/${reviewId}/like`
      );
      return response.data.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Unlike a review
   */
  async unlikeReview(reviewId: string): Promise<number> {
    try {
      const response = await apiClient.delete<{ data: number }>(
        `${this.basePath}/${reviewId}/like`
      );
      return response.data.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Check if user can write a review for a study
   * (User must be a member and haven't written a review of the same type)
   */
  async canWriteReview(studyId: string, type: ReviewType): Promise<boolean> {
    try {
      // Get my reviews for this study
      const myReviews = await this.getMyReviews();
      const studyReviews = myReviews.filter(r => r.studyId === studyId);
      
      // Check if already wrote a review of this type
      return !studyReviews.some(r => r.type === type);
    } catch (error) {
      console.error('Error checking review permission:', error);
      return false;
    }
  }
}

// Export singleton instance
const reviewService = new ReviewService();
export default reviewService;