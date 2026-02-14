import apiClient from './client';

export interface ResumeRequestResponse {
  id: number;
  userName: string;
  userEmail: string | null;
  inputData: string;
  formattedText: string | null;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  templateId: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface ResumeResponse {
  id: number;
  requestId: number | null;
  title: string;
  pdfUrl: string | null;
  pdfKey: string | null;
  fileSizeBytes: number;
  generationMode: 'MANUAL' | 'AUTO';
  status: 'GENERATED' | 'DELIVERED' | 'ARCHIVED';
  createdAt: string;
  updatedAt: string;
}

export interface PdfUploadResponse {
  requestId: number;
  pdfUrl: string;
}

const REQUEST_URL = '/api/grit-service/grit/resume/requests';
const RESUME_URL = '/api/grit-service/grit/resume/resumes';

class ResumeService {
  async uploadPdf(file: File, userName: string, userEmail?: string): Promise<PdfUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('userName', userName);
    if (userEmail) {
      formData.append('userEmail', userEmail);
    }
    const response = await apiClient.post<PdfUploadResponse>(`${REQUEST_URL}/upload-pdf`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  }

  async getMyResumeRequests(userEmail: string): Promise<ResumeRequestResponse[]> {
    const response = await apiClient.get<ResumeRequestResponse[]>(REQUEST_URL, {
      params: { userEmail },
    });
    return response.data;
  }

  async getResumesByRequestId(requestId: number): Promise<ResumeResponse[]> {
    const response = await apiClient.get<ResumeResponse[]>(`${RESUME_URL}/by-request/${requestId}`);
    return response.data;
  }

  getResumeDownloadUrl(resumeId: number): string {
    return `${RESUME_URL}/${resumeId}/download`;
  }
}

export default new ResumeService();
