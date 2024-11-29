export function generateFileName(originalName: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(7);
  const extension = originalName.split('.').pop();
  return `${timestamp}-${random}.${extension}`;
}

export function getFileType(file: File): string {
  return file.type.split('/')[0];
}

export function isAllowedType(file: File, allowedTypes: string[]): boolean {
  const fileType = getFileType(file);
  return allowedTypes.includes(fileType);
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}