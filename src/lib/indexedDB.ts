import { openDB, DBSchema } from 'idb';

interface MyDB extends DBSchema {
  files: {
    key: string;
    value: {
      name: string;
      data: ArrayBuffer;
      metadata: any;
    };
  };
}

const dbPromise = openDB<MyDB>('my-library', 1, {
  upgrade(db) {
    db.createObjectStore('files');
  },
});

export const setFile = async (fileName: string, fileData: { name: string; data: ArrayBuffer; metadata: any }) => {
  const db = await dbPromise;
  return db.put('files', fileData, fileName);
};

export const getFile = async (fileName: string): Promise<{ name: string; data: ArrayBuffer; metadata: any } | undefined> => {
  const db = await dbPromise;
  return db.get('files', fileName);
};

export const deleteFile = async (fileName: string) => {
  return (await dbPromise).delete('files', fileName);
};

export const getAllFiles = async () => {
  return (await dbPromise).getAll('files');
};

export const clearAllFiles = async () => {
  return (await dbPromise).clear('files');
};

export const getFileNames = async () => {
  return (await dbPromise).getAllKeys('files');
};
