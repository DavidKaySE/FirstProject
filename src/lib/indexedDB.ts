import { openDB, IDBPDatabase } from 'idb';
import { FileMetadata } from '@/types/fileTypes';

const DB_NAME = 'MeasureAppDB';
const FILE_STORE = 'files';
const METADATA_STORE = 'metadata';

let dbPromise: Promise<IDBPDatabase> | null = null;
let db: IDBPDatabase | null = null;

// Funktion för att skapa/öppna databasen
async function getDB() {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, 1, {
      upgrade(db) {
        db.createObjectStore(FILE_STORE);
        const metadataStore = db.createObjectStore(METADATA_STORE, { keyPath: 'fileName' });

        // Skapa ett index för filtyp, om det behövs i framtiden
        metadataStore.createIndex('by_type', 'type');
      },
    });
  }
  return dbPromise;
}

// Hjälpfunktion för loggning
function logError(message: string, error?: any) {
  console.error(`[IndexedDB Error]: ${message}`, error);
}

function logInfo(message: string) {
  console.log(`[IndexedDB Info]: ${message}`);
}

// Funktion för att validera metadata innan sparning
function isValidMetadata(metadata: FileMetadata): boolean {
  return metadata && typeof metadata.name === 'string' && typeof metadata.size === 'number';
}

// Spara en fil och dess metadata i en transaktion
export async function saveFile(fileName: string, fileBlob: Blob, metadata: FileMetadata) {
  if (!isValidMetadata(metadata)) {
    logError('Ogiltig metadata, sparar inte filen.');
    return;
  }

  const db = await getDB();
  const tx = db.transaction([FILE_STORE, METADATA_STORE], 'readwrite');
  try {
    await Promise.all([
      tx.objectStore(FILE_STORE).put(fileBlob, fileName),
      tx.objectStore(METADATA_STORE).put({ ...metadata, fileName })
    ]);
    await tx.done;
    logInfo(`Filen ${fileName} och metadata sparades framgångsrikt.`);
  } catch (error) {
    logError(`Fel vid sparande av filen ${fileName}`, error);
  }
}

// Hämta en fil och dess metadata
export async function getFile(fileName: string): Promise<{ blob: Blob; metadata: FileMetadata } | null> {
  try {
    logInfo(`Börjar hämta fil: ${fileName}`);
    const db = await getDB();
    const tx = db.transaction([FILE_STORE, METADATA_STORE], 'readonly');
    const fileStore = tx.objectStore(FILE_STORE);
    const metadataStore = tx.objectStore(METADATA_STORE);

    const [blob, metadata] = await Promise.all([
      fileStore.get(fileName),
      metadataStore.get(fileName)
    ]);

    if (!blob || !(blob instanceof Blob) || blob.size === 0) {
      logError(`Ogiltig blob-data för fil: ${fileName}`);
      return null;
    }
    
    if (!metadata) {
      logError(`Ingen metadata hittades för fil: ${fileName}`);
      return null;
    }

    await tx.done;
    logInfo(`Hämtad blob för ${fileName}: storlek=${blob.size} bytes, typ=${blob.type}`);
    return { blob, metadata };
  } catch (error) {
    logError(`Fel vid hämtning av fil från IndexedDB: ${fileName}`, error);
    return null;
  }
}

// Ta bort en fil och dess metadata
export async function deleteFile(fileName: string) {
  try {
    const db = await getDB();
    const tx = db.transaction([FILE_STORE, METADATA_STORE], 'readwrite');
    await Promise.all([
      tx.objectStore(FILE_STORE).delete(fileName),
      tx.objectStore(METADATA_STORE).delete(fileName)
    ]);
    await tx.done;
    logInfo(`Filen ${fileName} raderades framgångsrikt.`);
  } catch (error) {
    logError(`Fel vid radering av filen ${fileName}`, error);
  }
}

// Hämta alla filnamn
export async function getAllFiles(): Promise<string[]> {
  const db = await getDB();
  const keys = await db.getAllKeys(FILE_STORE);
  return keys.filter((key): key is string => typeof key === 'string');
}

// Hämta alla filer med metadata
export async function getAllFilesWithMetadata(): Promise<{ fileName: string; metadata: FileMetadata }[]> {
  const db = await getDB();
  const tx = db.transaction([FILE_STORE, METADATA_STORE], 'readonly');
  const fileStore = tx.objectStore(FILE_STORE);
  const metadataStore = tx.objectStore(METADATA_STORE);

  const keys = await fileStore.getAllKeys();
  const files = await Promise.all(
    keys
      .filter((key): key is string => typeof key === 'string')
      .map(async (key) => {
        const metadata = await metadataStore.get(key);
        return { fileName: key, metadata };
      })
  );

  await tx.done;
  return files.filter(file => file.metadata !== undefined);
}

// Exempel på att hämta filer av en viss typ, om du vill använda indexering
export async function getFilesByType(type: string): Promise<string[]> {
  const db = await getDB();
  const tx = db.transaction(METADATA_STORE, 'readonly');
  const store = tx.objectStore(METADATA_STORE);
  const index = store.index('by_type');

  const keys = await index.getAllKeys(type);
  return keys.filter((key): key is string => typeof key === 'string');
}

export async function closeDB() {
  if (db) {
    await db.close();
    db = null;
    dbPromise = null;
  }
}

export async function checkMetadataExists(fileName: string): Promise<boolean> {
  const db = await getDB();
  const metadata = await db.get(METADATA_STORE, fileName);
  return metadata !== undefined;
}
