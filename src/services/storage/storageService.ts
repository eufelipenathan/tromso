import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '@/lib/firebase';

export class StorageService {
  private basePath: string;

  constructor(basePath: string) {
    this.basePath = basePath;
  }

  private getRef(path: string) {
    return ref(storage, `${this.basePath}/${path}`);
  }

  async upload(file: File, path: string): Promise<string> {
    const fileRef = this.getRef(path);
    await uploadBytes(fileRef, file);
    return getDownloadURL(fileRef);
  }

  async delete(path: string): Promise<void> {
    const fileRef = this.getRef(path);
    await deleteObject(fileRef);
  }

  async getUrl(path: string): Promise<string> {
    const fileRef = this.getRef(path);
    return getDownloadURL(fileRef);
  }
}