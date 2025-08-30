import { getAuthToken } from './authService';
import { env } from '../config/environment';

const API_BASE_URL = env.apiBaseUrl;

export interface AssetUploadResult {
  assetId: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  contentHash: string;
  publicUrl: string;
  downloadUrl: string;
  createdAt: string;
}

export interface AssetMetadata {
  assetId: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  contentHash: string;
  ownerType: string;
  ownerId?: string;
  visibility: string;
  category: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

/**
 * Upload a file to the Asset Service
 * @param file The file to upload
 * @param options Upload options
 * @param onProgress Progress callback (0-100)
 * @returns Upload result with asset metadata
 */
export async function uploadAsset(
  file: File,
  options: {
    ownerType?: 'USER' | 'STUDY' | 'REVIEW' | 'SYSTEM';
    ownerId?: string;
    visibility?: 'PUBLIC' | 'PRIVATE' | 'RESTRICTED';
    category?: 'PROFILE_IMAGE' | 'STUDY_IMAGE' | 'GENERAL';
    tags?: string[];
  } = {},
  onProgress?: (progress: number) => void
): Promise<AssetUploadResult> {
  const token = getAuthToken();
  
  if (!token) {
    throw new Error('Authentication required');
  }

  const formData = new FormData();
  formData.append('file', file);
  
  // Add optional parameters
  if (options.ownerType) {
    formData.append('ownerType', options.ownerType);
  }
  if (options.ownerId) {
    formData.append('ownerId', options.ownerId);
  }
  formData.append('visibility', options.visibility || 'PRIVATE');
  formData.append('category', options.category || 'GENERAL');
  if (options.tags && options.tags.length > 0) {
    formData.append('tags', options.tags.join(','));
  }

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    // Track upload progress
    if (onProgress) {
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const percentComplete = Math.round((event.loaded / event.total) * 100);
          onProgress(percentComplete);
        }
      });
    }

    // Handle response
    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const response = JSON.parse(xhr.responseText);
          resolve(response);
        } catch (error) {
          reject(new Error('Invalid response format'));
        }
      } else {
        try {
          const errorResponse = JSON.parse(xhr.responseText);
          reject(new Error(errorResponse.message || `Upload failed: ${xhr.statusText}`));
        } catch {
          reject(new Error(`Upload failed: ${xhr.statusText}`));
        }
      }
    });

    // Handle errors
    xhr.addEventListener('error', () => {
      reject(new Error('Network error during upload'));
    });

    xhr.addEventListener('abort', () => {
      reject(new Error('Upload cancelled'));
    });

    // Open connection and set headers
    xhr.open('POST', `${API_BASE_URL}/api/assets/upload`);
    xhr.setRequestHeader('Authorization', `Bearer ${token}`);

    // Send the request
    xhr.send(formData);
  });
}

/**
 * Upload a profile image for the current user using Upload ID pattern
 * @param file The image file to upload
 * @param userEmail The email of the current user
 * @param onProgress Progress callback (0-100)
 * @returns Upload result with public URL
 */
export async function uploadProfileImage(
  file: File,
  userEmail: string,
  onProgress?: (progress: number) => void
): Promise<AssetUploadResult> {
  // Validate file type
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  if (!validTypes.includes(file.type)) {
    throw new Error('Invalid file type. Please upload an image (JPEG, PNG, GIF, or WebP)');
  }

  // Validate file size (max 10MB)
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    throw new Error('File too large. Maximum size is 10MB');
  }

  const token = getAuthToken();
  
  if (!token) {
    throw new Error('Authentication required');
  }

  try {
    // Step 1: Initiate upload session with Asset Service
    const initiateResponse = await fetch(`${API_BASE_URL}/api/assets/uploads/initiate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type,
        userId: userEmail, // Pass user email as userId
        metadata: {
          type: 'profile',
          category: 'PROFILE_IMAGE'
        }
      })
    });

    if (!initiateResponse.ok) {
      const error = await initiateResponse.json().catch(() => ({}));
      throw new Error(error.message || 'Failed to initiate upload');
    }

    const { uploadId, uploadUrl } = await initiateResponse.json();

    // Step 2: Upload the actual file with the upload ID
    const formData = new FormData();
    formData.append('file', file);

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      // Track upload progress
      if (onProgress) {
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            const percentComplete = Math.round((event.loaded / event.total) * 100);
            onProgress(percentComplete);
          }
        });
      }

      // Handle response
      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText);
            resolve(response);
          } catch (error) {
            reject(new Error('Invalid response format'));
          }
        } else {
          try {
            const errorResponse = JSON.parse(xhr.responseText);
            reject(new Error(errorResponse.message || `Upload failed: ${xhr.statusText}`));
          } catch {
            reject(new Error(`Upload failed: ${xhr.statusText}`));
          }
        }
      });

      // Handle errors
      xhr.addEventListener('error', () => {
        reject(new Error('Network error during upload'));
      });

      xhr.addEventListener('abort', () => {
        reject(new Error('Upload cancelled'));
      });

      // Open connection to Asset Service upload endpoint
      xhr.open('PUT', `${API_BASE_URL}/api/assets/uploads/${uploadId}`);
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);

      // Send the request
      xhr.send(formData);
    });
  } catch (error) {
    throw error instanceof Error ? error : new Error('Upload failed');
  }
}

/**
 * Get asset metadata
 * @param assetId The asset ID
 * @returns Asset metadata
 */
export async function getAssetMetadata(assetId: string): Promise<AssetMetadata> {
  const token = getAuthToken();
  
  if (!token) {
    throw new Error('Authentication required');
  }

  const response = await fetch(`${API_BASE_URL}/api/assets/${assetId}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Failed to get asset metadata');
  }

  return response.json();
}

/**
 * Download an asset
 * @param assetId The asset ID
 * @returns Blob of the asset file
 */
export async function downloadAsset(assetId: string): Promise<Blob> {
  const token = getAuthToken();
  
  if (!token) {
    throw new Error('Authentication required');
  }

  const response = await fetch(`${API_BASE_URL}/api/assets/${assetId}/download`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    throw new Error('Failed to download asset');
  }

  return response.blob();
}

/**
 * Get public asset URL (no auth required)
 * @param assetHash The asset hash from publicUrl
 * @returns Full public URL
 */
export function getPublicAssetUrl(assetHash: string): string {
  return `${API_BASE_URL}/api/public/assets/${assetHash}`;
}

/**
 * Validate image file
 * @param file The file to validate
 * @returns Validation result with error message if invalid
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  const maxSize = 10 * 1024 * 1024; // 10MB

  if (!validTypes.includes(file.type)) {
    return {
      valid: false,
      error: '지원하지 않는 파일 형식입니다. JPEG, PNG, GIF, WebP 이미지만 업로드 가능합니다.'
    };
  }

  if (file.size > maxSize) {
    return {
      valid: false,
      error: '파일 크기가 너무 큽니다. 최대 10MB까지 업로드 가능합니다.'
    };
  }

  return { valid: true };
}