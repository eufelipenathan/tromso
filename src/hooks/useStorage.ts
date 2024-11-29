import { useState, useCallback } from 'react';
import { attachmentService, documentService, profileService } from '@/services/storage';
import { useUI } from './useUI';

interface UseStorageOptions {
  onSuccess?: (url: string) => void;
  onError?: (error: Error) => void;
}

export function useStorage(options: UseStorageOptions = {}) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const { startLoading, stopLoading } = useUI();

  const uploadAttachment = useCallback(async (
    file: File,
    entityType: string,
    entityId: string
  ) => {
    setUploading(true);
    setProgress(0);
    setError(null);
    startLoading('upload-attachment');

    try {
      const url = await attachmentService.upload(file, entityType, entityId);
      options.onSuccess?.(url);
      return url;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Upload failed';
      setError(message);
      options.onError?.(error instanceof Error ? error : new Error(message));
      throw error;
    } finally {
      setUploading(false);
      setProgress(100);
      stopLoading('upload-attachment');
    }
  }, [options, startLoading, stopLoading]);

  const uploadDocument = useCallback(async (file: File, dealId: string) => {
    setUploading(true);
    setProgress(0);
    setError(null);
    startLoading('upload-document');

    try {
      const url = await documentService.upload(file, dealId);
      options.onSuccess?.(url);
      return url;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Upload failed';
      setError(message);
      options.onError?.(error instanceof Error ? error : new Error(message));
      throw error;
    } finally {
      setUploading(false);
      setProgress(100);
      stopLoading('upload-document');
    }
  }, [options, startLoading, stopLoading]);

  const uploadAvatar = useCallback(async (file: File, userId: string) => {
    setUploading(true);
    setProgress(0);
    setError(null);
    startLoading('upload-avatar');

    try {
      const url = await profileService.uploadAvatar(file, userId);
      options.onSuccess?.(url);
      return url;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Upload failed';
      setError(message);
      options.onError?.(error instanceof Error ? error : new Error(message));
      throw error;
    } finally {
      setUploading(false);
      setProgress(100);
      stopLoading('upload-avatar');
    }
  }, [options, startLoading, stopLoading]);

  return {
    uploading,
    progress,
    error,
    uploadAttachment,
    uploadDocument,
    uploadAvatar
  };
}