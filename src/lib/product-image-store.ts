"use client";

const DB_NAME = "commercial-director-v1";
const STORE_NAME = "product-images";
const DB_VERSION = 1;

function openDatabase() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new Error("IndexedDB is unavailable."));
      return;
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => reject(request.error ?? new Error("Could not open image storage."));
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) db.createObjectStore(STORE_NAME);
    };
    request.onsuccess = () => resolve(request.result);
  });
}

export async function putProductImage(projectId: string, file: Blob) {
  const db = await openDatabase();
  try {
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, "readwrite");
      transaction.onerror = () => reject(transaction.error ?? new Error("Could not save product image."));
      transaction.oncomplete = () => resolve();
      transaction.objectStore(STORE_NAME).put(file, projectId);
    });
  } finally {
    db.close();
  }
}

export async function getProductImage(projectId: string) {
  const db = await openDatabase();
  try {
    return await new Promise<Blob | null>((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, "readonly");
      transaction.onerror = () => reject(transaction.error ?? new Error("Could not read product image."));
      const request = transaction.objectStore(STORE_NAME).get(projectId);
      request.onerror = () => reject(request.error ?? new Error("Could not read product image."));
      request.onsuccess = () => resolve(request.result instanceof Blob ? request.result : null);
    });
  } finally {
    db.close();
  }
}
