import { db } from '@/lib/firebase';
import { collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc, query, where, orderBy } from 'firebase/firestore';

export class DatabaseService {
  private collection: string;

  constructor(collectionName: string) {
    this.collection = collectionName;
  }

  async getAll<T>(options?: {
    where?: [string, '==' | '!=' | '>' | '<' | '>=' | '<=', any][];
    orderBy?: [string, 'asc' | 'desc'][];
  }): Promise<T[]> {
    let q = collection(db, this.collection);

    if (options?.where) {
      options.where.forEach(([field, operator, value]) => {
        q = query(q, where(field, operator, value));
      });
    }

    if (options?.orderBy) {
      options.orderBy.forEach(([field, direction]) => {
        q = query(q, orderBy(field, direction));
      });
    }

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as T[];
  }

  async getById<T>(id: string): Promise<T | null> {
    const docRef = doc(db, this.collection, id);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      return null;
    }

    return {
      id: docSnap.id,
      ...docSnap.data()
    } as T;
  }

  async create<T>(data: Partial<T>): Promise<string> {
    const docRef = await addDoc(collection(db, this.collection), {
      ...data,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    return docRef.id;
  }

  async update<T>(id: string, data: Partial<T>): Promise<void> {
    await updateDoc(doc(db, this.collection, id), {
      ...data,
      updatedAt: new Date()
    });
  }

  async delete(id: string): Promise<void> {
    await deleteDoc(doc(db, this.collection, id));
  }

  async exists(id: string): Promise<boolean> {
    const docRef = doc(db, this.collection, id);
    const docSnap = await getDoc(docRef);
    return docSnap.exists();
  }
}