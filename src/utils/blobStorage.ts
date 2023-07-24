import {indexedDB as fakeIndexedDB} from "fake-indexeddb";
export interface IBlobStorage
{
    saveBlob(blob: Blob, name: string): Promise<void>;
    getBlob(name: string): Promise<Blob>;
    deleteBlob(name: string): Promise<void>;
    listBlobs(): Promise<string[]>;
    isBlobExist(name: string): Promise<boolean>;
}


var indexDB : IDBFactory = fakeIndexedDB;

if(typeof window !== "undefined"){
    indexDB = window?.indexedDB ||
    (window as any)?.mozIndexedDB ||
    (window as any)?.webkitIndexedDB ||
    (window as any)?.msIndexedDB ||
    (window as any)?.shimIndexedDB;
}

if (!indexDB) {
    throw new Error("No IndexedDB support");
}

export class IndexDBBlobStorage implements IBlobStorage
{
    private db: IDBDatabase;

    constructor(db: IDBDatabase) {
        this.db = db;
    }

    static async init(dbName: string): Promise<IndexDBBlobStorage> {
        return await new Promise((resolve, reject) => {
            const request = indexDB.open(dbName, 1);
            request.onerror = (event: any) => {
                reject(event);
            };
            request.onsuccess = (event: any) => {
                resolve(new IndexDBBlobStorage(request.result));
            };
            request.onupgradeneeded = () => {
                const db = request.result;
                db.createObjectStore("blobs");
            };
        });
    }

    async saveBlob(blob: Blob, name: string): Promise<void> {
        const transaction = this.db.transaction(["blobs"], "readwrite");
        const store = transaction.objectStore("blobs");
        store.put(blob, name);
    }

    async getBlob(name: string): Promise<Blob> {
        const transaction = this.db.transaction(["blobs"], "readonly");
        const store = transaction.objectStore("blobs");
        const request = store.get(name);
        return await new Promise((resolve, reject) => {
            request.onerror = (event: any) => {
                reject(event);
            };
            request.onsuccess = (event: any) => {
                resolve(request.result);
            };
        });
    }

    async deleteBlob(name: string): Promise<void> {
        const transaction = this.db.transaction(["blobs"], "readwrite");
        const store = transaction.objectStore("blobs");
        store.delete(name);
    }

    async listBlobs(): Promise<string[]> {
        const transaction = this.db.transaction(["blobs"], "readonly");
        const store = transaction.objectStore("blobs");
        const request = store.getAllKeys();
        return await new Promise((resolve, reject) => {
            request.onerror = (event: any) => {
                reject(event);
            };
            request.onsuccess = (event: any) => {
                resolve(request.result.map((key) => key.toString()));
            };
        });
    }

    async isBlobExist(name: string): Promise<boolean> {
        const transaction = this.db.transaction(["blobs"], "readonly");
        const store = transaction.objectStore("blobs");
        const request = store.getKey(name);
        return await new Promise((resolve, reject) => {
            request.onerror = (event: any) => {
                reject(event);
            };
            request.onsuccess = (event: any) => {
                resolve(request.result !== undefined);
            };
        });
    }

    async getBlobUrl(name: string): Promise<string> {
        const blob = await this.getBlob(name);
        return URL.createObjectURL(blob);
    }
}

export const ImageBlobStorage = IndexDBBlobStorage.init("image");
export const ChatBlobStorage = IndexDBBlobStorage.init("chat");
export const TestBlobStorage = IndexDBBlobStorage.init("test");
export const vectorStorage = IndexDBBlobStorage.init("vector");