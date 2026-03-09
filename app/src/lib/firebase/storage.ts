import { ref, uploadBytesResumable, getDownloadURL, UploadTask } from 'firebase/storage';
import { storage } from './client';
import { getCurrentUser } from './auth';

export interface UploadProgress {
  bytesTransferred: number;
  totalBytes: number;
  percent: number;
  state: 'running' | 'paused' | 'success' | 'canceled' | 'error';
}

/**
 * Upload a photo to Firebase Storage for avatar generation.
 * Photos go to uploads/{uid}/{museId}_original.{ext}
 */
export async function uploadPhoto(
  file: File,
  museId: string,
  onProgress?: (progress: UploadProgress) => void
): Promise<string> {
  const user = getCurrentUser();
  if (!user) throw new Error('Must be signed in to upload');

  const ext = file.name.split('.').pop() || 'jpg';
  const path = `uploads/${user.uid}/${museId}_original.${ext}`;
  const storageRef = ref(storage, path);

  return new Promise((resolve, reject) => {
    const uploadTask: UploadTask = uploadBytesResumable(storageRef, file, {
      contentType: file.type,
      customMetadata: { uid: user.uid, museId },
    });

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress: UploadProgress = {
          bytesTransferred: snapshot.bytesTransferred,
          totalBytes: snapshot.totalBytes,
          percent: Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100),
          state: snapshot.state as UploadProgress['state'],
        };
        onProgress?.(progress);
      },
      (error) => reject(error),
      async () => {
        // Return the storage path (NOT the download URL — that's server-managed)
        resolve(path);
      }
    );
  });
}

/**
 * Generate a unique muse ID for file naming before upload.
 */
export function generateMuseId(): string {
  return `muse_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
}
